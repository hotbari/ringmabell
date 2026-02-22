/**
 * Backfill script: Analyze all existing aspirations
 *
 * Run with: npx tsx --env-file=.env.local scripts/backfill-analysis.ts
 *
 * Prerequisites:
 * - OPENAI_API_KEY in .env.local
 * - NEXT_PUBLIC_SUPABASE_URL in .env.local
 * - SUPABASE_SERVICE_ROLE_KEY in .env.local
 * - Phase 1 migration has been run
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ---- Extraction ----
async function extractInterests(title: string, details: string) {
  const prompt = `당신은 목표/소망 텍스트를 분석하여 구조화된 데이터를 추출하는 전문가입니다.

목표 제목: "${title}"
목표 상세: "${details}"

다음 JSON 형식으로만 응답하세요:
{
  "interests": [{ "name": "영어 소문자", "name_ko": "한국어", "category": "activity|skill|topic|place|experience|other", "specificity": "broad|medium|specific", "confidence": 0.0~1.0 }],
  "emotions": ["영어"],
  "values": ["영어"],
  "life_domain": "health|career|education|finance|relationships|creativity|travel|lifestyle|hobby|other"
}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 500,
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(completion.choices[0]?.message?.content || '{}');
}

// ---- Embedding ----
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.slice(0, 8000),
  });
  return response.data[0].embedding;
}

// ---- Main ----
async function main() {
  console.log('=== RingMaBell Backfill: Interest Analysis + Embeddings ===\n');

  // 1. Fetch all aspirations
  const { data: aspirations, error } = await supabase
    .from('aspirations')
    .select('id, user_id, title, details')
    .order('created_at', { ascending: true });

  if (error || !aspirations) {
    console.error('Failed to fetch aspirations:', error);
    process.exit(1);
  }

  console.log(`Found ${aspirations.length} aspirations to process.\n`);

  // 2. Check which already have analysis
  const { data: existing } = await supabase
    .from('aspiration_analysis')
    .select('aspiration_id');

  const alreadyAnalyzed = new Set((existing || []).map((e) => e.aspiration_id));

  const toProcess = aspirations.filter((a) => !alreadyAnalyzed.has(a.id));
  console.log(`${alreadyAnalyzed.size} already analyzed, ${toProcess.length} to process.\n`);

  let processed = 0;
  let failed = 0;

  for (const aspiration of toProcess) {
    try {
      process.stdout.write(`[${processed + 1}/${toProcess.length}] "${aspiration.title}" ... `);

      // Extract interests
      const result = await extractInterests(aspiration.title, aspiration.details);

      // Store analysis
      await supabase.from('aspiration_analysis').upsert({
        aspiration_id: aspiration.id,
        interests_extracted: result.interests || [],
        emotions: result.emotions || [],
        values: result.values || [],
        life_domain: result.life_domain || 'other',
      });

      // Update aspiration
      const tags = (result.interests || []).map((i: { name_ko?: string; name: string }) => i.name_ko || i.name);
      await supabase
        .from('aspirations')
        .update({ life_domain: result.life_domain || 'other', auto_tags: tags })
        .eq('id', aspiration.id);

      // Upsert interests into global dictionary + user links
      for (const interest of result.interests || []) {
        const { data: existingInterest } = await supabase
          .from('interests')
          .select('id')
          .ilike('name', interest.name)
          .single();

        let interestId: string;
        if (existingInterest) {
          interestId = existingInterest.id;
        } else {
          const { data: newInterest } = await supabase
            .from('interests')
            .insert({
              name: interest.name,
              name_ko: interest.name_ko || interest.name,
              category: interest.category || 'other',
            })
            .select('id')
            .single();
          if (!newInterest) continue;
          interestId = newInterest.id;
        }

        await supabase.from('user_interests').upsert(
          {
            user_id: aspiration.user_id,
            interest_id: interestId,
            source_aspiration_id: aspiration.id,
            strength: interest.confidence || 0.5,
            status: 'active',
          },
          { onConflict: 'user_id,interest_id,source_aspiration_id' }
        );
      }

      // Generate embedding
      const text = `${aspiration.title}\n${aspiration.details}`;
      const embedding = await generateEmbedding(text);
      await supabase.from('aspiration_embeddings').upsert({
        aspiration_id: aspiration.id,
        embedding: JSON.stringify(embedding),
      });

      processed++;
      console.log('OK');

      // Rate limit: 50ms between requests
      await new Promise((r) => setTimeout(r, 50));
    } catch (err) {
      failed++;
      console.log('FAILED:', (err as Error).message);
    }
  }

  console.log(`\n=== Done! Processed: ${processed}, Failed: ${failed} ===`);

  // 3. Recompute groups for each user
  const userIds = [...new Set(aspirations.map((a) => a.user_id))];
  console.log(`\nRecomputing groups for ${userIds.length} users...`);

  for (const userId of userIds) {
    try {
      // Get user's embeddings
      const userAspirations = aspirations.filter((a) => a.user_id === userId && a.title);
      if (userAspirations.length < 2) continue;

      const ids = userAspirations.map((a) => a.id);
      const { data: embeddings } = await supabase
        .from('aspiration_embeddings')
        .select('aspiration_id, embedding')
        .in('aspiration_id', ids);

      if (!embeddings || embeddings.length < 2) continue;

      // Simple clustering
      const parsed = embeddings.map((e) => ({
        id: e.aspiration_id,
        vec: typeof e.embedding === 'string' ? JSON.parse(e.embedding) : e.embedding,
      }));

      const clusters = cluster(parsed, 0.75);
      if (clusters.length === 0) continue;

      // Delete old groups
      const { data: oldGroups } = await supabase
        .from('aspiration_groups')
        .select('id')
        .eq('user_id', userId);
      if (oldGroups && oldGroups.length > 0) {
        await supabase.from('aspiration_group_members').delete().in('group_id', oldGroups.map((g) => g.id));
        await supabase.from('aspiration_groups').delete().eq('user_id', userId);
      }

      // Create groups
      const titleMap = new Map(userAspirations.map((a) => [a.id, a.title]));
      for (const cl of clusters) {
        const titles = cl.map((id) => titleMap.get(id) || '');
        const meta = await generateGroupName(titles);

        const { data: group } = await supabase
          .from('aspiration_groups')
          .insert({ user_id: userId, name: meta.name, description: meta.description, color: meta.color, icon: meta.icon })
          .select('id')
          .single();

        if (!group) continue;
        await supabase.from('aspiration_group_members').insert(
          cl.map((aid) => ({ aspiration_id: aid, group_id: group.id, similarity_score: 0.8 }))
        );
      }

      console.log(`  User ${userId.slice(0, 8)}...: ${clusters.length} groups created`);
    } catch (err) {
      console.log(`  User ${userId.slice(0, 8)}... FAILED:`, (err as Error).message);
    }
  }

  console.log('\n=== Backfill complete! ===');
}

function cluster(items: { id: string; vec: number[] }[], threshold: number): string[][] {
  const visited = new Set<number>();
  const clusters: string[][] = [];
  for (let i = 0; i < items.length; i++) {
    if (visited.has(i)) continue;
    const group = [items[i].id];
    visited.add(i);
    for (let j = i + 1; j < items.length; j++) {
      if (visited.has(j)) continue;
      if (cosine(items[i].vec, items[j].vec) >= threshold) {
        group.push(items[j].id);
        visited.add(j);
      }
    }
    if (group.length >= 2) clusters.push(group);
  }
  return clusters;
}

function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

async function generateGroupName(titles: string[]) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: `아래 목표들을 하나의 카테고리로 묶어주세요. JSON으로만 응답:
${titles.map((t, i) => `${i + 1}. ${t}`).join('\n')}

{"name":"한국어 카테고리명","icon":"이모지","color":"hex 파스텔톤","description":"한 문장 설명"}`,
      }],
      max_tokens: 200,
      temperature: 0.5,
      response_format: { type: 'json_object' },
    });
    return JSON.parse(completion.choices[0]?.message?.content || '{}');
  } catch {
    return { name: '기타', icon: '🎯', color: '#FFD6E8', description: '' };
  }
}

main().catch(console.error);
