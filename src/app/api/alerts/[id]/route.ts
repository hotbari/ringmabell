import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AlertStatus } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface UpdateAlertInput {
  status?: AlertStatus;
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

  const body: UpdateAlertInput = await request.json();

  const updateData: Record<string, unknown> = {};

  if (body.status) {
    updateData.status = body.status;
    if (body.status === 'done') {
      updateData.read_at = new Date().toISOString();
    }
  }

  const { data, error } = await supabase
    .from('alerts')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
