import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CreateAspirationInput } from '@/types';

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('aspirations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body: CreateAspirationInput = await request.json();

  if (!body.title || !body.details) {
    return NextResponse.json(
      { error: 'Title and details are required' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('aspirations')
    .insert({
      user_id: user.id,
      title: body.title,
      details: body.details,
      deadline: body.deadline || null,
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
