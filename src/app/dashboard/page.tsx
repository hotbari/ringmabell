import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AspirationCard } from '@/components/aspirations/AspirationCard';
import { Aspiration } from '@/types';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: aspirations } = await supabase
    .from('aspirations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const activeAspirations = (aspirations as Aspiration[] | null)?.filter(
    (a) => a.status === 'active'
  );
  const completedAspirations = (aspirations as Aspiration[] | null)?.filter(
    (a) => a.status === 'completed'
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-[#141414] via-[#141414]/95 to-transparent">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold gradient-text">RingMaBell</h1>
          <div className="flex items-center gap-6">
            <span className="text-sm text-gray-400 hidden sm:block">
              {user.email}
            </span>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="animate-fade-in">
              <h2 className="text-4xl font-bold text-white mb-2">
                My Aspirations
              </h2>
              <p className="text-gray-400">
                {activeAspirations?.length || 0} active dreams to pursue
              </p>
            </div>
            <Link
              href="/new"
              className="group flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105 active:scale-95"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Aspiration
            </Link>
          </div>

          {/* Empty State */}
          {(!aspirations || aspirations.length === 0) && (
            <div className="text-center py-20 animate-fade-in">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-violet-600/20 flex items-center justify-center">
                <span className="text-5xl">🌟</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Start Your Journey
              </h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Add your first aspiration and let AI help you stay motivated
              </p>
              <Link
                href="/new"
                className="inline-flex items-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg transition-all duration-300"
              >
                Add Your First Dream
              </Link>
            </div>
          )}

          {/* Active Aspirations */}
          {activeAspirations && activeAspirations.length > 0 && (
            <section className="mb-12">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-violet-500 rounded-full"></span>
                Active
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {activeAspirations.map((aspiration, i) => (
                  <div
                    key={aspiration.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <AspirationCard aspiration={aspiration} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Completed Aspirations */}
          {completedAspirations && completedAspirations.length > 0 && (
            <section>
              <h3 className="text-xl font-semibold text-gray-400 mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-green-500 rounded-full"></span>
                Completed
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 opacity-60">
                {completedAspirations.map((aspiration, i) => (
                  <div
                    key={aspiration.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <AspirationCard aspiration={aspiration} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
