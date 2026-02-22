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
  const rating = Number(body.rating);
  const comment = typeof body.comment === 'string' ? body.comment.slice(0, 1000) : '';

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: '별점은 1~5 사이 정수여야 해요' }, { status: 400 });
  }

  // 24시간 내 중복 제출 방지
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: recent } = await supabase
    .from('feedback')
    .select('id')
    .eq('user_id', user.id)
    .gte('created_at', oneDayAgo)
    .limit(1);

  if (recent && recent.length > 0) {
    return NextResponse.json(
      { error: '하루에 한 번만 피드백을 보낼 수 있어요' },
      { status: 429 }
    );
  }

  const { error } = await supabase.from('feedback').insert({
    user_id: user.id,
    rating,
    comment,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Discord 웹훅 전송
  const webhookUrl = process.env.FEEDBACK_DISCORD_WEBHOOK_URL;
  if (webhookUrl) {
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [
            {
              title: '새로운 피드백',
              description: comment || '(코멘트 없음)',
              color: 0xff4d8b,
              fields: [
                { name: '별점', value: `${stars} ${rating}/5`, inline: true },
                { name: '사용자', value: user.email || '알 수 없음', inline: true },
              ],
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      });
    } catch {
      // Discord 전송 실패해도 피드백 저장은 성공
    }
  }

  return NextResponse.json({ success: true });
}
