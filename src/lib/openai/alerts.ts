import OpenAI from 'openai';
import { UrgencyLevel } from '@/types';

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export function getUrgencyLevel(daysUntilDeadline: number): UrgencyLevel {
  if (daysUntilDeadline <= 3) return 'critical';
  if (daysUntilDeadline <= 7) return 'high';
  if (daysUntilDeadline <= 30) return 'medium';
  return 'low';
}

function buildAlertPrompt(
  urgency: UrgencyLevel,
  title: string,
  details: string,
  daysUntilDeadline: number
): string {
  const baseContext = `Aspiration: "${title}"\nDetails: "${details}"\nDays until deadline: ${daysUntilDeadline}`;

  switch (urgency) {
    case 'low':
      return `You are a supportive friend. Write a calm, encouraging reminder (2-3 sentences) for someone working on a long-term goal.

${baseContext}

Focus on:
- Acknowledging the journey ahead
- Mentioning the value of consistent small steps
- Keep it relaxed and positive`;

    case 'medium':
      return `You are a supportive accountability partner. Write a motivating check-in message (2-3 sentences).

${baseContext}

Focus on:
- Asking about progress in a friendly way
- Suggesting one concrete small action they could take
- Maintaining momentum without pressure`;

    case 'high':
      return `You are a dedicated coach. Write an urgent but supportive reminder (2-3 sentences).

${baseContext}

Focus on:
- The deadline is approaching - convey urgency
- Suggest a specific action to make progress today
- Be encouraging but direct`;

    case 'critical':
      return `You are an urgent but caring accountability partner. Write a compelling call-to-action (2-3 sentences).

${baseContext}

Focus on:
- ${daysUntilDeadline <= 0 ? 'The deadline has passed - what can they do now?' : 'The deadline is imminent - time to act!'}
- One immediate action they should take right now
- Be direct and motivating, not guilt-inducing`;
  }
}

export async function generateAlertMessage(
  aspirationTitle: string,
  aspirationDetails: string,
  daysUntilDeadline: number
): Promise<string> {
  const urgency = getUrgencyLevel(daysUntilDeadline);
  const prompt = buildAlertPrompt(urgency, aspirationTitle, aspirationDetails, daysUntilDeadline);

  const completion = await getOpenAIClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: 200,
    temperature: 0.8,
  });

  return completion.choices[0]?.message?.content || '';
}
