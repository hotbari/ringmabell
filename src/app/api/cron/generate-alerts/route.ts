import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AlertType } from '@/types';
import { generateAlertMessage, getUrgencyLevel } from '@/lib/openai/alerts';

// Service role client for cron jobs (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface AspirationWithDeadline {
  id: string;
  user_id: string;
  title: string;
  details: string;
  deadline: string;
  status: string;
}

interface AlertToCreate {
  user_id: string;
  aspiration_id: string;
  type: AlertType;
  message: string;
}

interface ExistingAlert {
  aspiration_id: string;
  created_at: string;
}

function getAlertTypeForDeadline(daysUntilDeadline: number): AlertType {
  if (daysUntilDeadline < 0) return 'overdue';
  if (daysUntilDeadline <= 1) return 'deadline_today';
  if (daysUntilDeadline <= 3) return 'deadline_soon';
  return 'reminder';
}

function shouldSendAlert(
  daysUntilDeadline: number,
  lastAlertAt: Date | null
): boolean {
  const now = new Date();
  const hoursSinceLastAlert = lastAlertAt
    ? (now.getTime() - lastAlertAt.getTime()) / (1000 * 60 * 60)
    : Infinity;

  if (daysUntilDeadline > 30) {
    return hoursSinceLastAlert >= 168; // 7 days
  }
  if (daysUntilDeadline > 14) {
    return hoursSinceLastAlert >= 84; // 3.5 days
  }
  if (daysUntilDeadline > 3) {
    return hoursSinceLastAlert >= 24; // 1 day
  }
  return hoursSinceLastAlert >= 12; // 12 hours
}

function getFallbackMessage(type: AlertType, title: string, daysUntil: number): string {
  switch (type) {
    case 'reminder':
      return `Keep going with "${title}"! ${daysUntil} days until your deadline.`;
    case 'deadline_soon':
      return `Only ${daysUntil} days left for "${title}"! Time to focus.`;
    case 'deadline_today':
      return `Today is the day for "${title}"! You've got this.`;
    case 'overdue':
      return `"${title}" is overdue. What's one thing you can do right now?`;
  }
}

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch all active aspirations with deadlines (all users)
  const { data: aspirations, error: aspirationsError } = await supabase
    .from('aspirations')
    .select('id, user_id, title, details, deadline, status')
    .eq('status', 'active')
    .not('deadline', 'is', null);

  if (aspirationsError) {
    console.error('Failed to fetch aspirations:', aspirationsError);
    return NextResponse.json({ error: aspirationsError.message }, { status: 500 });
  }

  if (!aspirations || aspirations.length === 0) {
    return NextResponse.json({ message: 'No aspirations with deadlines', generated: 0 });
  }

  // Fetch latest alerts for all aspirations
  const aspirationIds = aspirations.map((a) => a.id);
  const { data: existingAlerts, error: alertsError } = await supabase
    .from('alerts')
    .select('aspiration_id, created_at')
    .in('aspiration_id', aspirationIds)
    .order('created_at', { ascending: false });

  if (alertsError) {
    console.error('Failed to fetch alerts:', alertsError);
    return NextResponse.json({ error: alertsError.message }, { status: 500 });
  }

  // Build map of aspiration_id -> latest alert timestamp
  const lastAlertMap = new Map<string, Date>();
  for (const alert of (existingAlerts || []) as ExistingAlert[]) {
    if (!lastAlertMap.has(alert.aspiration_id)) {
      lastAlertMap.set(alert.aspiration_id, new Date(alert.created_at));
    }
  }

  // Generate new alerts
  const alertsToCreate: AlertToCreate[] = [];

  for (const aspiration of aspirations as AspirationWithDeadline[]) {
    const deadline = new Date(aspiration.deadline);
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    const daysUntilDeadline = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    const lastAlertAt = lastAlertMap.get(aspiration.id) || null;

    if (!shouldSendAlert(daysUntilDeadline, lastAlertAt)) {
      continue;
    }

    const alertType = getAlertTypeForDeadline(daysUntilDeadline);

    // Generate AI message
    let message: string;
    try {
      message = await generateAlertMessage(
        aspiration.title,
        aspiration.details,
        daysUntilDeadline
      );
    } catch (error) {
      console.error('AI message generation failed:', error);
      message = getFallbackMessage(alertType, aspiration.title, daysUntilDeadline);
    }

    alertsToCreate.push({
      user_id: aspiration.user_id,
      aspiration_id: aspiration.id,
      type: alertType,
      message,
    });
  }

  if (alertsToCreate.length === 0) {
    return NextResponse.json({ message: 'No new alerts to generate', generated: 0 });
  }

  // Insert new alerts
  const { data: createdAlerts, error: insertError } = await supabase
    .from('alerts')
    .insert(alertsToCreate)
    .select();

  if (insertError) {
    console.error('Failed to insert alerts:', insertError);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  console.log(`Cron: Generated ${createdAlerts?.length || 0} alerts`);

  return NextResponse.json({
    message: `Generated ${createdAlerts?.length || 0} new alerts`,
    generated: createdAlerts?.length || 0,
  });
}
