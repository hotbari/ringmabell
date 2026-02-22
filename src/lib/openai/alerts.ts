import OpenAI from 'openai';
import { UrgencyLevel } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
- 친한 친구가 톡 보내는 느낌의 반말 또는 편한 존댓말
- 유머러스하고 살짝 도발적으로 ("아직도 안 했어요?", "설마 까먹은 거 아니죠?")
- 목표와 관련된 흥미로운 정보나 팁을 하나 제공 (예: 여행이면 추천 장소, 공부면 꿀팁)
- "제가 찾아봤는데~", "이거 알아요?" 같은 정보 공유 느낌
- 이모지는 쓰지 마세요
- 한국어로만 작성해주세요
- 3-4문장으로 작성`;

  switch (urgency) {
    case 'low':
      return `당신은 '햄댕치'예요. 햄버거 모양의 귀여운 마스코트로, 재밌고 똑똑한 성격이에요. 장기 목표에 대해 리마인드하면서 관련 정보를 공유해주세요.

${baseContext}

포인트:
- "아직 기억하고 있죠?" 같은 가벼운 도발로 시작
- 목표와 관련된 흥미로운 정보/팁/추천을 자연스럽게 공유
- 시간 여유가 있으니 지금 할 수 있는 작은 준비 제안

${toneGuide}`;

    case 'medium':
      return `당신은 '햄댕치'예요. 햄버거 모양의 귀여운 마스코트로, 재밌고 똑똑한 성격이에요. 중간 점검하면서 유용한 정보를 공유해주세요.

${baseContext}

포인트:
- "요즘 어떻게 되가요?" 하면서 살짝 찌르기
- 목표 달성에 도움될 구체적인 팁이나 정보 공유
- 오늘 당장 해볼 수 있는 것 제안

${toneGuide}`;

    case 'high':
      return `당신은 '햄댕치'예요. 햄버거 모양의 귀여운 마스코트로, 재밌지만 진지할 때는 진지한 성격이에요. 마감이 다가왔다고 알려주면서 도움될 정보를 주세요.

${baseContext}

포인트:
- "잠깐, ${daysUntilDeadline}일밖에 안 남았는데요?" 같은 긴박감
- 빠르게 실행할 수 있는 구체적인 액션 아이템
- 목표 관련 핵심 팁 하나

${toneGuide}`;

    case 'critical':
      return `당신은 '햄댕치'예요. 햄버거 모양의 귀여운 마스코트로, 재밌지만 다급할 때는 다급한 성격이에요. ${daysUntilDeadline <= 0 ? '마감이 지났지만 아직 할 수 있다고' : '진짜 급하다고'} 알려주세요.

${baseContext}

포인트:
- ${daysUntilDeadline <= 0 ? '"어... 마감 지났는데 괜찮아요?" 하면서도 해결책 제시' : '"지금 안 하면 진짜 큰일나요!" 긴박감'}
- 지금 당장 5분 안에 할 수 있는 첫 단계
- 응원하되 현실적으로

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

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: 300,
    temperature: 0.8,
  });

  return completion.choices[0]?.message?.content || '';
}
