interface DiscordEmbed {
  title: string;
  description: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text: string };
  timestamp?: string;
}

interface SendToDiscordParams {
  webhookUrl: string;
  aspirationTitle: string;
  reminderContent: string;
}

export async function sendToDiscord({
  webhookUrl,
  aspirationTitle,
  reminderContent,
}: SendToDiscordParams): Promise<boolean> {
  const embed: DiscordEmbed = {
    title: `🔔 ${aspirationTitle}`,
    description: reminderContent,
    color: 0x8b5cf6, // Violet color
    footer: {
      text: 'RingMaBell - Keep Your Dreams Alive',
    },
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'RingMaBell',
        avatar_url: 'https://em-content.zobj.net/source/apple/391/bell_1f514.png',
        embeds: [embed],
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Discord webhook error:', error);
    return false;
  }
}
