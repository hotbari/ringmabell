import OpenAI from 'openai';
import { createAdminClient } from '@/lib/supabase/admin';
import { ExtractedInterest, LifeDomain, InterestCategory } from '@/types';

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

interface ExtractionResult {
  interests: ExtractedInterest[];
  emotions: string[];
  values: string[];
  life_domain: LifeDomain;
}

const EXTRACTION_PROMPT = `당신은 목표/소망 텍스트를 분석하여 구조화된 데이터를 추출하는 전문가입니다.

아래 목표 텍스트를 분석하여 JSON으로 응답하세요.

목표 제목: "{title}"
목표 상세: "{details}"

다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "interests": [
    {
      "name": "영어 이름 (소문자, 예: cooking, running)",
      "name_ko": "한국어 이름 (예: 요리, 달리기)",
      "category": "activity | skill | topic | place | experience | other",
      "specificity": "broad | medium | specific",
      "confidence": 0.0~1.0
    }
  ],
  "emotions": ["excitement", "curiosity", "determination", "anxiety", "hope" 등 영어로],
  "values": ["creativity", "health", "growth", "discipline", "freedom" 등 영어로],
  "life_domain": "health | career | education | finance | relationships | creativity | travel | lifestyle | hobby | other"
}

규칙:
- interests는 1-5개 추출
- confidence가 0.5 미만인 관심사는 제외
- emotions는 1-3개
- values는 1-3개
- life_domain은 가장 적합한 것 하나만`;

/**
 * Extract interests, emotions, values, and life domain from aspiration text
 */
export async function extractInterests(
  title: string,
  details: string
): Promise<ExtractionResult> {
  const openai = getOpenAIClient();
  const prompt = EXTRACTION_PROMPT
    .replace('{title}', title)
    .replace('{details}', details);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 500,
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    return { interests: [], emotions: [], values: [], life_domain: 'other' };
  }

  try {
    const parsed = JSON.parse(content);
    return {
      interests: (parsed.interests || []).map((i: ExtractedInterest & { name_ko?: string }) => ({
        name: i.name?.toLowerCase() || '',
        name_ko: i.name_ko || i.name,
        category: validateCategory(i.category),
        specificity: i.specificity || 'medium',
        confidence: Math.max(0, Math.min(1, i.confidence || 0.5)),
      })),
      emotions: parsed.emotions || [],
      values: parsed.values || [],
      life_domain: validateLifeDomain(parsed.life_domain),
    };
  } catch {
    return { interests: [], emotions: [], values: [], life_domain: 'other' };
  }
}

function validateCategory(cat: string): InterestCategory {
  const valid: InterestCategory[] = ['activity', 'skill', 'topic', 'place', 'experience', 'other'];
  return valid.includes(cat as InterestCategory) ? (cat as InterestCategory) : 'other';
}

function validateLifeDomain(domain: string): LifeDomain {
  const valid: LifeDomain[] = [
    'health', 'career', 'education', 'finance',
    'relationships', 'creativity', 'travel',
    'lifestyle', 'hobby', 'other',
  ];
  return valid.includes(domain as LifeDomain) ? (domain as LifeDomain) : 'other';
}

/**
 * Analyze an aspiration and store results in DB.
 * - Extracts interests/emotions/values/life_domain
 * - Upserts into aspiration_analysis
 * - Creates/links interests in global dictionary
 * - Updates aspiration's life_domain and auto_tags
 */
export async function analyzeAspiration(
  aspirationId: string,
  userId: string,
  title: string,
  details: string
): Promise<ExtractionResult> {
  const result = await extractInterests(title, details);
  const supabase = createAdminClient();

  // 1. Store analysis cache
  await supabase
    .from('aspiration_analysis')
    .upsert({
      aspiration_id: aspirationId,
      interests_extracted: result.interests,
      emotions: result.emotions,
      values: result.values,
      life_domain: result.life_domain,
    });

  // 2. Update aspiration with life_domain and auto_tags
  const tags = result.interests.map(
    (i: ExtractedInterest & { name_ko?: string }) => (i as { name_ko: string }).name_ko || i.name
  );
  await supabase
    .from('aspirations')
    .update({
      life_domain: result.life_domain,
      auto_tags: tags,
    })
    .eq('id', aspirationId);

  // 3. Upsert interests into global dictionary and link to user
  for (const interest of result.interests) {
    const interestWithKo = interest as ExtractedInterest & { name_ko?: string };
    // Upsert into global interests table
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
          name_ko: interestWithKo.name_ko || interest.name,
          category: interest.category,
        })
        .select('id')
        .single();

      if (!newInterest) continue;
      interestId = newInterest.id;
    }

    // Link user to interest
    await supabase
      .from('user_interests')
      .upsert(
        {
          user_id: userId,
          interest_id: interestId,
          source_aspiration_id: aspirationId,
          strength: interest.confidence,
          status: 'active',
        },
        { onConflict: 'user_id,interest_id,source_aspiration_id' }
      );
  }

  // 4. Update interest co-occurrence edges
  if (result.interests.length > 1) {
    await updateInterestEdges(result.interests);
  }

  return result;
}

/**
 * Update co-occurrence edges between interests extracted from the same aspiration
 */
async function updateInterestEdges(
  interests: (ExtractedInterest & { name_ko?: string })[]
): Promise<void> {
  const supabase = createAdminClient();

  // Get interest IDs
  const interestIds: Map<string, string> = new Map();
  for (const interest of interests) {
    const { data } = await supabase
      .from('interests')
      .select('id')
      .ilike('name', interest.name)
      .single();
    if (data) interestIds.set(interest.name, data.id);
  }

  // Create edges for each pair
  const names = Array.from(interestIds.keys());
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const fromId = interestIds.get(names[i])!;
      const toId = interestIds.get(names[j])!;

      // Check existing edge
      const { data: existing } = await supabase
        .from('interest_edges')
        .select('co_occurrence_count, weight')
        .eq('from_interest_id', fromId)
        .eq('to_interest_id', toId)
        .single();

      if (existing) {
        const newCount = existing.co_occurrence_count + 1;
        await supabase
          .from('interest_edges')
          .update({
            co_occurrence_count: newCount,
            weight: Math.min(1.0, existing.weight + 0.1),
          })
          .eq('from_interest_id', fromId)
          .eq('to_interest_id', toId);
      } else {
        await supabase
          .from('interest_edges')
          .insert({
            from_interest_id: fromId,
            to_interest_id: toId,
            relationship_type: 'co_occurrence',
            weight: 0.5,
            co_occurrence_count: 1,
          });
      }
    }
  }
}
