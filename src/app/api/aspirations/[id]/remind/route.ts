import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateReminder } from '@/lib/openai/client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: aspiration } = await supabase
    .from('aspirations')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!aspiration) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const reminder = await generateReminder(
      aspiration.title,
      aspiration.details,
      aspiration.deadline
    );

    return NextResponse.json({ reminder });
  } catch (error) {
    console.error('Failed to generate reminder:', error);
    return NextResponse.json(
      { error: 'Failed to generate reminder' },
      { status: 500 }
    );
  }
}
