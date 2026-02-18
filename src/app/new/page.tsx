import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AspirationForm } from '@/components/aspirations/AspirationForm';

export default async function NewAspirationPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4">
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
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-10 animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-600/20 flex items-center justify-center">
              <span className="text-3xl">✨</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              New Aspiration
            </h1>
            <p className="text-gray-400">
              What dream do you want to keep alive?
            </p>
          </div>

          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8 animate-scale-in">
            <AspirationForm mode="create" />
          </div>
        </div>
      </main>
    </div>
  );
}
