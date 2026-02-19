import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AspirationForm } from '@/components/aspirations/AspirationForm';
import { DeleteButton } from './DeleteButton';
import { StatusToggle } from './StatusToggle';
import { MotivationButton } from './MotivationButton';
import { Aspiration } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AspirationPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: aspiration } = await supabase
    .from('aspirations')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!aspiration) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-gray-400 hover:text-pink-500 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            돌아가기
          </Link>
          <div className="flex items-center gap-3">
            <StatusToggle aspiration={aspiration as Aspiration} />
            <DeleteButton aspirationId={id} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-xl mx-auto">
          {/* Status Badge */}
          <div className="flex justify-center mb-6 animate-fade-in">
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                aspiration.status === 'completed'
                  ? 'bg-emerald-100 text-emerald-600 border border-emerald-200'
                  : 'bg-pink-100 text-pink-600 border border-pink-200'
              }`}
            >
              {aspiration.status === 'completed' ? '✅ 완료' : '🌸 진행 중'}
            </span>
          </div>

          {/* Form Card */}
          <div className="bg-white border border-pink-100 rounded-2xl p-8 shadow-lg shadow-pink-100/50 animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              목표 수정하기 ✏️
            </h1>
            <AspirationForm aspiration={aspiration as Aspiration} mode="edit" />
          </div>

          {/* Motivation Section */}
          <div className="mt-6 bg-white border border-pink-100 rounded-2xl p-8 shadow-lg shadow-pink-100/50 animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              동기부여가 필요하세요? 💪
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              AI가 응원 메시지를 만들어드릴게요 ✨
            </p>
            <MotivationButton aspirationId={id} />
          </div>
        </div>
      </main>
    </div>
  );
}
