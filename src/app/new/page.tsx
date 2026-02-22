import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AspirationForm } from '@/components/aspirations/AspirationForm';

export default async function NewAspirationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FFF8F2] border-b-2 border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/dashboard" className="inline-flex items-center text-gray-500 hover:text-[#FF4D8B] transition-colors font-bold">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            대시보드로 돌아가기
          </Link>
        </div>
      </header>

      <main className="pt-24 pb-12 px-6">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-10 animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#FFE566] border-2 border-gray-800 rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_#1a1a1a]">
              <span className="text-3xl">✨</span>
            </div>
            <h1 className="text-3xl font-black text-gray-800 mb-2 tracking-tight">
              새 목표 만들기
            </h1>
            <p className="text-gray-500 font-medium">
              어떤 꿈을 이루고 싶으세요? 🌸
            </p>
          </div>

          <div className="bg-white border-2 border-gray-800 rounded-xl p-8 shadow-[6px_6px_0px_0px_#FF4D8B] animate-fade-in">
            <AspirationForm mode="create" />
          </div>
        </div>
      </main>
    </div>
  );
}
