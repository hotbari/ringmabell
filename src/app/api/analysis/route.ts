import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/analysis - Fetch user's aspiration analyses and interest summary
 */
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch all analyses for user's aspirations
  const { data: analyses, error: analysisError } = await supabase
    .from('aspiration_analysis')
    .select(`
      *,
      aspiration:aspirations!inner(id, title, user_id)
    `)
    .eq('aspiration.user_id', user.id);

  if (analysisError) {
    return NextResponse.json({ error: analysisError.message }, { status: 500 });
  }

  // Fetch user's interests with global interest data
  const { data: userInterests, error: interestError } = await supabase
    .from('user_interests')
    .select(`
      *,
      interest:interests(*)
    `)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('strength', { ascending: false });

  if (interestError) {
    return NextResponse.json({ error: interestError.message }, { status: 500 });
  }

  // Aggregate life domains
  const domainCounts: Record<string, number> = {};
  for (const a of analyses || []) {
    if (a.life_domain) {
      domainCounts[a.life_domain] = (domainCounts[a.life_domain] || 0) + 1;
    }
  }

  // Aggregate top values
  const valueCounts: Record<string, number> = {};
  for (const a of analyses || []) {
    for (const v of (a.values as string[]) || []) {
      valueCounts[v] = (valueCounts[v] || 0) + 1;
    }
  }

  // Aggregate emotions
  const emotionCounts: Record<string, number> = {};
  for (const a of analyses || []) {
    for (const e of (a.emotions as string[]) || []) {
      emotionCounts[e] = (emotionCounts[e] || 0) + 1;
    }
  }

  return NextResponse.json({
    analyses: analyses || [],
    interests: userInterests || [],
    summary: {
      domains: domainCounts,
      values: Object.entries(valueCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10),
      emotions: Object.entries(emotionCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10),
      total_interests: userInterests?.length || 0,
      total_analyzed: analyses?.length || 0,
    },
  });
}
