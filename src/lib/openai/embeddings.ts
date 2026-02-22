import OpenAI from 'openai';
import { createAdminClient } from '@/lib/supabase/admin';

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

/**
 * Generate embedding for a single text using text-embedding-3-small
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const openai = getOpenAIClient();

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.slice(0, 8000), // model max ~8k tokens
  });

  return response.data[0].embedding;
}

/**
 * Generate embeddings for multiple texts in a single API call
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const openai = getOpenAIClient();

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts.map((t) => t.slice(0, 8000)),
  });

  return response.data
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
}

/**
 * Store aspiration embedding in Supabase
 */
export async function storeAspirationEmbedding(
  aspirationId: string,
  title: string,
  details: string
): Promise<void> {
  const text = `${title}\n${details}`;
  const embedding = await generateEmbedding(text);
  const supabase = createAdminClient();

  await supabase
    .from('aspiration_embeddings')
    .upsert({
      aspiration_id: aspirationId,
      embedding: JSON.stringify(embedding),
    });
}

/**
 * Find similar aspirations for a user using cosine similarity
 */
export async function findSimilarAspirations(
  aspirationId: string,
  userId: string,
  threshold: number = 0.75,
  limit: number = 10
): Promise<{ aspiration_id: string; similarity: number }[]> {
  const supabase = createAdminClient();

  // Get the embedding for the target aspiration
  const { data: embeddingData } = await supabase
    .from('aspiration_embeddings')
    .select('embedding')
    .eq('aspiration_id', aspirationId)
    .single();

  if (!embeddingData?.embedding) return [];

  // Use the RPC function for similarity search
  const { data, error } = await supabase.rpc('match_aspirations', {
    query_embedding: embeddingData.embedding,
    match_user_id: userId,
    match_threshold: threshold,
    match_count: limit,
  });

  if (error || !data) return [];

  // Exclude the aspiration itself
  return data.filter(
    (r: { aspiration_id: string; similarity: number }) =>
      r.aspiration_id !== aspirationId
  );
}

/**
 * Compute cosine similarity between two vectors (client-side fallback)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
