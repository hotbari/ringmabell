import OpenAI from 'openai';

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function generateReminder(
  aspirationTitle: string,
  aspirationDetails: string,
  deadline: string | null
): Promise<string> {
  const deadlineContext = deadline
    ? `The deadline is ${deadline}.`
    : '';

  const completion = await getOpenAIClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: `당신은 친근한 친구예요. 아래 목표에 대해 짧고 따뜻한 리마인더를 한국어로 작성해주세요 (2-3문장).

목표: "${aspirationTitle}"
상세 내용: "${aspirationDetails}"
${deadlineContext}

말투 가이드:
- 20-30대가 쓰는 편한 존댓말 (~요, ~에요)
- "화이팅이에요", "할 수 있어요", "한번 해봐요" 같은 자연스러운 표현
- 이모지는 쓰지 마세요
- 오늘 할 수 있는 작은 행동 하나를 제안해주세요`,
      },
    ],
    max_tokens: 200,
    temperature: 0.8,
  });

  return completion.choices[0]?.message?.content || '';
}
