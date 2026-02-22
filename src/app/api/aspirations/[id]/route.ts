import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { UpdateAspirationInput } from '@/types';
import { analyzeAspiration } from '@/lib/openai/interest-extraction';
import { storeAspirationEmbedding } from '@/lib/openai/embeddings';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
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
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Aspiration not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body: UpdateAspirationInput = await request.json();

  // Only allow known fields to prevent arbitrary column injection
  const updateFields: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (body.title !== undefined) updateFields.title = body.title;
  if (body.details !== undefined) updateFields.details = body.details;
  if (body.deadline !== undefined) updateFields.deadline = body.deadline;
  if (body.status !== undefined) updateFields.status = body.status;

  const { data, error } = await supabase
    .from('aspirations')
    .update(updateFields)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Re-analyze if title or details changed
  if (body.title || body.details) {
    try {
      await Promise.all([
        analyzeAspiration(data.id, user.id, data.title, data.details),
        storeAspirationEmbedding(data.id, data.title, data.details),
      ]);
    } catch (err) {
      console.error('[aspiration-analysis] Background re-analysis failed:', err);
    }
  }

  return NextResponse.json(data);
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('aspirations')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
