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
  const baseContext = `목표: "${title}"\n상세 내용: "${details}"\n마감까지 남은 일수: ${daysUntilDeadline}일`;

  const toneGuide = `말투 가이드:
- 20-30대가 쓰는 편한 존댓말 (~요, ~에요)
- "화이팅이에요", "할 수 있어요", "힘내봐요" 같은 자연스러운 표현
- 이모지는 쓰지 마세요
- 한국어로만 작성해주세요`;

  switch (urgency) {
    case 'low':
      return `당신은 친근한 친구예요. 장기 목표를 위해 노력하는 사람에게 편안하고 따뜻한 리마인더를 작성해주세요 (2-3문장).

${baseContext}

포인트:
- 아직 시간이 많으니 꾸준히 하면 된다는 점
- 작은 것부터 차근차근이라는 느낌

${toneGuide}`;

    case 'medium':
      return `당신은 친근한 친구예요. 중간 점검 느낌의 응원 메시지를 작성해주세요 (2-3문장).

${baseContext}

포인트:
- 요즘 어떻게 진행되고 있는지 물어보는 느낌
- 오늘 할 수 있는 작은 행동 하나 제안
- 부담주지 않으면서 동기부여

${toneGuide}`;

    case 'high':
      return `당신은 친근하지만 진지한 친구예요. 마감이 다가오고 있다는 걸 알려주는 메시지를 작성해주세요 (2-3문장).

${baseContext}

포인트:
- 시간이 얼마 안 남았다는 점을 자연스럽게 전달
- 오늘 당장 할 수 있는 구체적인 행동 제안
- 응원하되 긴박감도 함께

${toneGuide}`;

    case 'critical':
      return `당신은 친근하지만 진지한 친구예요. ${daysUntilDeadline <= 0 ? '마감이 지났다는 점을 알려주면서도 포기하지 말라는' : '마감이 정말 임박했다는 걸 알려주는'} 메시지를 작성해주세요 (2-3문장).

${baseContext}

포인트:
- ${daysUntilDeadline <= 0 ? '지났지만 지금이라도 할 수 있는 것' : '정말 급하다는 느낌, 하지만 할 수 있다는 격려'}
- 지금 바로 할 수 있는 행동 하나
- 죄책감 주지 않으면서 동기부여

${toneGuide}`;
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
