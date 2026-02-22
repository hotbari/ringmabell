import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { recomputeGroups } from '@/lib/openai/grouping';

/**
 * GET /api/groups - Fetch user's auto-generated groups with members
 */
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: groups, error } = await supabase
    .from('aspiration_groups')
    .select(`
      *,
      members:aspiration_group_members(
        aspiration_id,
        similarity_score
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(groups);
}

/**
 * POST /api/groups/recompute - Trigger group recomputation
 */
export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await recomputeGroups(user.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[groups] Recompute failed:', err);
    return NextResponse.json(
      { error: 'Failed to recompute groups' },
      { status: 500 }
    );
  }
}
