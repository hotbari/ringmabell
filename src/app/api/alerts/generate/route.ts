import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AlertType } from '@/types';
import { generateAlertMessage, getUrgencyLevel } from '@/lib/openai/alerts';

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

  // 30+ days: every 7 days (168 hours)
  if (daysUntilDeadline > 30) {
    return hoursSinceLastAlert >= 168;
  }
  // 14-30 days: every 3.5 days (84 hours)
  if (daysUntilDeadline > 14) {
    return hoursSinceLastAlert >= 84;
  }
  // 3-14 days: every day (24 hours)
  if (daysUntilDeadline > 3) {
    return hoursSinceLastAlert >= 24;
  }
  // 0-3 days or overdue: every 12 hours
  return hoursSinceLastAlert >= 12;
}

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch active aspirations with deadlines
  const { data: aspirations, error: aspirationsError } = await supabase
    .from('aspirations')
    .select('id, user_id, title, details, deadline, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .not('deadline', 'is', null);

  if (aspirationsError) {
    return NextResponse.json({ error: aspirationsError.message }, { status: 500 });
  }

  if (!aspirations || aspirations.length === 0) {
    return NextResponse.json({ message: 'No aspirations with deadlines', generated: 0 });
  }

  // Fetch latest alert for each aspiration
  const aspirationIds = aspirations.map((a) => a.id);
  const { data: existingAlerts, error: alertsError } = await supabase
    .from('alerts')
    .select('aspiration_id, created_at')
    .eq('user_id', user.id)
    .in('aspiration_id', aspirationIds)
    .order('created_at', { ascending: false });

  if (alertsError) {
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
    const urgency = getUrgencyLevel(daysUntilDeadline);

    // Generate AI message
    let message: string;
    try {
      message = await generateAlertMessage(
        aspiration.title,
        aspiration.details,
        daysUntilDeadline
      );
    } catch (error) {
      // Fallback to simple message if AI fails
      console.error('AI message generation failed:', error);
      message = getFallbackMessage(alertType, aspiration.title, daysUntilDeadline);
    }

    alertsToCreate.push({
      user_id: user.id,
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
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({
    message: `Generated ${createdAlerts?.length || 0} new alerts`,
    generated: createdAlerts?.length || 0,
    alerts: createdAlerts,
  });
}

function getFallbackMessage(type: AlertType, title: string, daysUntil: number): string {
  switch (type) {
    case 'reminder':
      return `"${title}" 목표 잊지 않으셨죠? 마감까지 ${daysUntil}일 남았어요. 오늘도 조금씩 해봐요!`;
    case 'deadline_soon':
      return `"${title}" 마감이 ${daysUntil}일 남았어요! 지금 집중해보는 건 어때요?`;
    case 'deadline_today':
      return `오늘이 "${title}" 마감일이에요! 할 수 있어요, 화이팅!`;
    case 'overdue':
      return `"${title}" 마감이 지났지만 괜찮아요. 지금 할 수 있는 것부터 시작해봐요!`;
  }
}
