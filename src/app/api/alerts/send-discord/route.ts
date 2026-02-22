import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Alert, AlertType } from '@/types';

interface AlertWithAspiration extends Omit<Alert, 'aspiration'> {
  aspiration: {
    id: string;
    title: string;
    deadline: string | null;
    status: string;
  } | null;
}

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user settings
  const { data: settings } = await supabase
    .from('user_settings')
    .select('discord_webhook_url, notification_enabled')
    .eq('user_id', user.id)
    .single();

  if (!settings?.discord_webhook_url || !settings.notification_enabled) {
    return NextResponse.json(
      { message: 'Discord notifications not configured or disabled', sent: 0 },
      { status: 200 }
    );
  }

  // Get pending alerts not yet sent to Discord
  const { data: alerts, error: alertsError } = await supabase
    .from('alerts')
    .select(`
      *,
      aspiration:aspirations(id, title, deadline, status)
    `)
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .eq('sent_to_discord', false);

  if (alertsError) {
    return NextResponse.json({ error: alertsError.message }, { status: 500 });
  }

  if (!alerts || alerts.length === 0) {
    return NextResponse.json({ message: 'No alerts to send', sent: 0 });
  }

  let sentCount = 0;
  const sentAlertIds: string[] = [];

  for (const alert of alerts as AlertWithAspiration[]) {
    const embed = {
      title: `🔔 ${alert.aspiration?.title || 'Alert'}`,
      description: alert.message,
      color: getColorForAlertType(alert.type),
      footer: { text: 'RingMaBell - Keep Your Dreams Alive' },
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch(settings.discord_webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'RingMaBell',
          avatar_url: 'https://em-content.zobj.net/source/apple/391/bell_1f514.png',
          embeds: [embed],
        }),
      });

      if (response.ok) {
        sentCount++;
        sentAlertIds.push(alert.id);
      }

      // Rate limit: Discord allows 30 requests per minute per webhook
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Failed to send alert to Discord:', error);
    }
  }

  // Mark sent alerts
  if (sentAlertIds.length > 0) {
    await supabase
      .from('alerts')
      .update({ sent_to_discord: true })
      .in('id', sentAlertIds);
  }

  return NextResponse.json({
    message: `Sent ${sentCount} alerts to Discord`,
    sent: sentCount,
  });
}

function getColorForAlertType(type: AlertType): number {
  switch (type) {
    case 'overdue':
      return 0xef4444; // red
    case 'deadline_today':
      return 0xf97316; // orange
    case 'deadline_soon':
      return 0xf59e0b; // amber
    case 'reminder':
      return 0x3b82f6; // blue
    default:
      return 0x8b5cf6; // violet
  }
}
