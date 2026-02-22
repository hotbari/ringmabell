import OpenAI from 'openai';
import { createAdminClient } from '@/lib/supabase/admin';

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

interface GroupSuggestion {
  name: string;
  icon: string;
  color: string;
  description: string;
}

/**
 * Generate a group name/icon for a cluster of aspirations using GPT-4o-mini
 */
async function generateGroupMetadata(
  titles: string[]
): Promise<GroupSuggestion> {
  const openai = getOpenAIClient();

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: `아래 목표들을 하나의 카테고리로 묶어주세요. JSON으로만 응답하세요.

목표들:
${titles.map((t, i) => `${i + 1}. ${t}`).join('\n')}

응답 형식:
{
  "name": "짧은 한국어 카테고리명 (예: 건강, 요리, 자기계발)",
  "icon": "이모지 하나",
  "color": "hex 색상코드 (밝고 파스텔톤)",
  "description": "한 문장 설명"
}`,
      },
    ],
    max_tokens: 200,
    temperature: 0.5,
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    return { name: '기타', icon: '🎯', color: '#FFD6E8', description: '' };
  }

  try {
    const parsed = JSON.parse(content);
    return {
      name: parsed.name || '기타',
      icon: parsed.icon || '🎯',
      color: parsed.color || '#FFD6E8',
      description: parsed.description || '',
    };
  } catch {
    return { name: '기타', icon: '🎯', color: '#FFD6E8', description: '' };
  }
}

interface EmbeddingRow {
  aspiration_id: string;
  embedding: number[];
}

/**
 * Simple clustering using cosine similarity threshold.
 * Returns clusters of aspiration IDs.
 */
function clusterBySimilarity(
  embeddings: EmbeddingRow[],
  threshold: number = 0.75
): string[][] {
  const n = embeddings.length;
  const visited = new Set<number>();
  const clusters: string[][] = [];

  for (let i = 0; i < n; i++) {
    if (visited.has(i)) continue;

    const cluster: string[] = [embeddings[i].aspiration_id];
    visited.add(i);

    for (let j = i + 1; j < n; j++) {
      if (visited.has(j)) continue;

      const sim = cosineSim(embeddings[i].embedding, embeddings[j].embedding);
      if (sim >= threshold) {
        cluster.push(embeddings[j].aspiration_id);
        visited.add(j);
      }
    }

    // Only create groups with 2+ aspirations
    if (cluster.length >= 2) {
      clusters.push(cluster);
    }
  }

  return clusters;
}

function cosineSim(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Re-compute auto groups for a user.
 * 1. Fetch all aspiration embeddings
 * 2. Cluster by cosine similarity
 * 3. Generate group names via GPT
 * 4. Replace existing groups
 */
export async function recomputeGroups(userId: string): Promise<void> {
  const supabase = createAdminClient();

  // 1. Fetch user's aspiration embeddings
  const { data: aspirations } = await supabase
    .from('aspirations')
    .select('id, title')
    .eq('user_id', userId)
    .eq('status', 'active');

  if (!aspirations || aspirations.length < 2) return;

  const aspirationIds = aspirations.map((a) => a.id);
  const titleMap = new Map(aspirations.map((a) => [a.id, a.title]));

  const { data: embeddingsRaw } = await supabase
    .from('aspiration_embeddings')
    .select('aspiration_id, embedding')
    .in('aspiration_id', aspirationIds);

  if (!embeddingsRaw || embeddingsRaw.length < 2) return;

  // Parse embeddings (pgvector returns as string)
  const embeddings: EmbeddingRow[] = embeddingsRaw.map((e) => ({
    aspiration_id: e.aspiration_id,
    embedding: typeof e.embedding === 'string'
      ? JSON.parse(e.embedding)
      : e.embedding,
  }));

  // 2. Cluster
  const clusters = clusterBySimilarity(embeddings);
  if (clusters.length === 0) return;

  // 3. Delete existing auto groups for this user
  const { data: existingGroups } = await supabase
    .from('aspiration_groups')
    .select('id')
    .eq('user_id', userId);

  if (existingGroups && existingGroups.length > 0) {
    await supabase
      .from('aspiration_group_members')
      .delete()
      .in('group_id', existingGroups.map((g) => g.id));

    await supabase
      .from('aspiration_groups')
      .delete()
      .eq('user_id', userId);
  }

  // 4. Create new groups
  for (const cluster of clusters) {
    const titles = cluster.map((id) => titleMap.get(id) || '');
    const metadata = await generateGroupMetadata(titles);

    const { data: group } = await supabase
      .from('aspiration_groups')
      .insert({
        user_id: userId,
        name: metadata.name,
        description: metadata.description,
        color: metadata.color,
        icon: metadata.icon,
      })
      .select('id')
      .single();

    if (!group) continue;

    // Insert members
    const members = cluster.map((aspirationId) => ({
      aspiration_id: aspirationId,
      group_id: group.id,
      similarity_score: 0.8, // average for the cluster
    }));

    await supabase
      .from('aspiration_group_members')
      .insert(members);
  }
}
