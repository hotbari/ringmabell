import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const webhookUrl = body.webhook_url;

  if (!webhookUrl) {
    return NextResponse.json({ error: 'Webhook URL required' }, { status: 400 });
  }

  // Validate it's a Discord webhook URL
  if (!webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
    return NextResponse.json({ error: 'Invalid Discord webhook URL' }, { status: 400 });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'RingMaBell',
        avatar_url: 'https://em-content.zobj.net/source/apple/391/bell_1f514.png',
        embeds: [
          {
            title: '🔔 Test Notification',
            description: 'Your Discord webhook is connected! You will receive deadline alerts here.',
            color: 0x8b5cf6,
            footer: { text: 'RingMaBell - Keep Your Dreams Alive' },
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Webhook test failed' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to send test message' }, { status: 500 });
  }
}
