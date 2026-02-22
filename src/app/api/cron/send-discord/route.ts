import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AlertType } from '@/types';

// Service role client for cron jobs (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface UserSettings {
  user_id: string;
  discord_webhook_url: string;
  notification_enabled: boolean;
}

interface AlertWithAspiration {
  id: string;
  user_id: string;
  type: AlertType;
  message: string;
  aspiration: {
    id: string;
    title: string;
  }[] | null;
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

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get all users with Discord configured
  const { data: userSettings, error: settingsError } = await supabase
    .from('user_settings')
    .select('user_id, discord_webhook_url, notification_enabled')
    .eq('notification_enabled', true)
    .not('discord_webhook_url', 'is', null);

  if (settingsError) {
    console.error('Failed to fetch user settings:', settingsError);
    return NextResponse.json({ error: settingsError.message }, { status: 500 });
  }

  if (!userSettings || userSettings.length === 0) {
    return NextResponse.json({ message: 'No users with Discord configured', sent: 0 });
  }

  let totalSent = 0;

  for (const settings of userSettings as UserSettings[]) {
    // Get pending alerts not yet sent to Discord for this user
    const { data: alerts, error: alertsError } = await supabase
      .from('alerts')
      .select(`
        id,
        user_id,
        type,
        message,
        aspiration:aspirations(id, title)
      `)
      .eq('user_id', settings.user_id)
      .eq('status', 'pending')
      .eq('sent_to_discord', false);

    if (alertsError || !alerts || alerts.length === 0) {
      continue;
    }

    const sentAlertIds: string[] = [];

    for (const alert of alerts as AlertWithAspiration[]) {
      const embed = {
        title: `🔔 ${alert.aspiration?.[0]?.title || 'Alert'}`,
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
          totalSent++;
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
  }

  console.log(`Cron: Sent ${totalSent} Discord notifications`);

  return NextResponse.json({
    message: `Sent ${totalSent} alerts to Discord`,
    sent: totalSent,
  });
}
