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
    ? `마감일: ${deadline}`
    : '';

  const completion = await getOpenAIClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: `당신은 '햄댕치'예요. 햄버거 모양의 귀여운 마스코트로, 사용자의 목표 달성을 응원하는 캐릭터예요. 재밌고 똑똑한 성격이에요. 아래 목표에 대해 리마인드하면서 유용한 정보도 공유해주세요 (3-4문장).

목표: "${aspirationTitle}"
상세 내용: "${aspirationDetails}"
${deadlineContext}

말투 가이드:
- 친한 친구가 톡 보내는 느낌의 편한 말투
- 유머러스하고 살짝 도발적으로 ("아직도 안 했어요?", "설마 까먹은 거 아니죠?")
- 목표와 관련된 흥미로운 정보나 팁을 하나 제공
- "제가 찾아봤는데~", "이거 알아요?" 같은 정보 공유 느낌
- 이모지는 쓰지 마세요
- 한국어로만 작성`,
      },
    ],
    max_tokens: 300,
    temperature: 0.9,
  });

  return completion.choices[0]?.message?.content || '';
}
