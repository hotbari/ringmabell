import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            RingMaBell 🔔
          </h1>
          <Link
            href="/login"
            className="px-5 py-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium rounded-full transition-all shadow-md shadow-pink-200 hover:shadow-lg hover:shadow-pink-300"
          >
            로그인
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6 pt-20">
        <div className="max-w-3xl text-center">
          <div className="inline-block mb-4 px-4 py-1.5 bg-pink-100 text-pink-600 text-sm font-medium rounded-full">
            ✨ AI 목표 알림 서비스
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 leading-tight">
            목표를 기록하고
            <span className="block bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              잊지 않게 알려드려요
            </span>
          </h2>

          <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed">
            하고 싶은 것, 되고 싶은 것을 적어두세요.
            적절한 때에 알림을 보내 목표를 상기시켜 드릴게요.
          </p>

          <Link
            href="/login"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold rounded-full transition-all shadow-lg shadow-pink-200 hover:shadow-xl hover:shadow-pink-300 hover:scale-105 active:scale-95"
          >
            시작하기
            <svg
              className="ml-2 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>

          {/* Feature Cards */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                emoji: '📝',
                title: '목표 기록',
                desc: '달성하고 싶은 목표와 마감일을 기록해요',
              },
              {
                emoji: '💌',
                title: '맞춤 알림',
                desc: '마감이 다가오면 동기부여 메시지를 보내드려요',
              },
              {
                emoji: '🌸',
                title: '진행 관리',
                desc: '목표 달성 현황을 한눈에 확인할 수 있어요',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 bg-white border border-pink-100 rounded-2xl shadow-sm hover:shadow-md hover:border-pink-200 transition-all"
              >
                <div className="text-3xl mb-3">{feature.emoji}</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-400 text-sm">
        목표 달성을 돕는 알림 서비스 💕
      </footer>
    </div>
  );
}
