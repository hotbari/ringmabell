import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateReminder(
  aspirationTitle: string,
  aspirationDetails: string,
  deadline: string | null
): Promise<string> {
  const deadlineContext = deadline
    ? `The deadline is ${deadline}.`
    : '';

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: `You are a supportive friend. Write a short, warm reminder (2-3 sentences) about this aspiration:

"${aspirationTitle}"
Details: "${aspirationDetails}"
${deadlineContext}

Be encouraging but not cheesy. Suggest one small action they could take today.`,
      },
    ],
    max_tokens: 200,
    temperature: 0.8,
  });

  return completion.choices[0]?.message?.content || '';
}
