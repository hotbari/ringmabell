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
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
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
            Back
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
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
              }`}
            >
              {aspiration.status === 'completed' ? '✅ Completed' : '🎯 Active'}
            </span>
          </div>

          {/* Form Card */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8 animate-scale-in">
            <h1 className="text-2xl font-bold text-white mb-6">
              Edit Aspiration
            </h1>
            <AspirationForm aspiration={aspiration as Aspiration} mode="edit" />
          </div>

          {/* Motivation Section */}
          <div className="mt-6 bg-[#1a1a1a] border border-gray-800 rounded-xl p-8 animate-fade-in">
            <h2 className="text-lg font-semibold text-white mb-2">
              Need some motivation?
            </h2>
            <p className="text-gray-500 text-sm mb-4">
              Let AI inspire you to keep going
            </p>
            <MotivationButton aspirationId={id} />
          </div>
        </div>
      </main>
    </div>
  );
}
