import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Image from 'next/image';

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
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FFF8F2] border-b-2 border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-black text-[#FF4D8B] tracking-tight">
            ★ RingMaBell ★
          </h1>
          <Link
            href="/login"
            className="px-5 py-2 bg-[#FF4D8B] text-white font-bold rounded-lg border-2 border-[#c4185e] shadow-[3px_3px_0px_0px_#c4185e] hover:shadow-[1px_1px_0px_0px_#c4185e] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-sm"
          >
            로그인
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6 pt-20">
        <div className="max-w-4xl w-full">

          {/* Two-column hero: text left, mascot right */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 mb-16">

            {/* Left: text */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-block mb-6 px-4 py-1.5 bg-[#FFE566] text-gray-800 text-sm font-bold rounded-lg border-2 border-gray-800 shadow-[3px_3px_0px_0px_#1a1a1a]">
                ✦ 햄댕치 목표 알림 서비스 ✦
              </div>

              <h2 className="text-5xl md:text-6xl font-black text-gray-800 mb-6 leading-tight tracking-tight">
                목표를 기록하고
                <span className="block text-[#FF4D8B]">
                  잊지 않게 알려드려요!
                </span>
              </h2>

              <p className="text-lg text-gray-500 mb-10 leading-relaxed">
                하고 싶은 것, 되고 싶은 것을 적어두세요.
                적절한 때에 알림을 보내 목표를 상기시켜 드릴게요 ♥
              </p>

              <Link
                href="/login"
                className="inline-flex items-center px-8 py-4 bg-[#FF4D8B] text-white font-black rounded-lg border-2 border-[#c4185e] shadow-[5px_5px_0px_0px_#c4185e] hover:shadow-[2px_2px_0px_0px_#c4185e] hover:translate-x-[3px] hover:translate-y-[3px] transition-all text-lg"
              >
                지금 시작하기 →
              </Link>
            </div>

            {/* Right: mascot */}
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
              {/* Speech bubble */}
              <div className="relative bg-white border-2 border-gray-800 rounded-xl px-4 py-2 shadow-[3px_3px_0px_0px_#1a1a1a]">
                <p className="text-sm font-black text-gray-700 whitespace-nowrap">나랑 같이 목표 이뤄요! 🍔</p>
                {/* Bubble tail */}
                <div className="absolute -bottom-[10px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[10px] border-l-transparent border-r-transparent border-t-gray-800" />
                <div className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-white" />
              </div>
              <Image src="/Photoroom.png" alt="햄댕치" width={256} height={256} className="w-52 h-52 md:w-64 md:h-64 drop-shadow-lg" />
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { emoji: '📝', color: '#FFE566', title: '목표 기록', desc: '달성하고 싶은 목표와 마감일을 기록해요' },
              { emoji: '💌', color: '#C8F2FF', title: '맞춤 알림', desc: '마감이 다가오면 동기부여 메시지를 보내드려요' },
              { emoji: '🌸', color: '#FFD6E8', title: '진행 관리', desc: '목표 달성 현황을 한눈에 확인할 수 있어요' },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 border-2 border-gray-800 rounded-xl shadow-[5px_5px_0px_0px_#1a1a1a]"
                style={{ backgroundColor: feature.color }}
              >
                <div className="text-4xl mb-3">{feature.emoji}</div>
                <h3 className="text-lg font-black text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-400 text-sm border-t-2 border-gray-200 mt-12">
        ♡ 목표 달성을 돕는 알림 서비스 ♡
      </footer>
    </div>
  );
}
