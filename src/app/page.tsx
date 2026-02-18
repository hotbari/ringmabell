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
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold gradient-text">RingMaBell</h1>
          <Link
            href="/login"
            className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-md transition-all duration-200 active:scale-95"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6 pt-20">
        <div className="max-w-4xl text-center animate-fade-in">
          {/* Glowing orb background effect */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative">
            <div className="mb-6 inline-flex items-center px-4 py-2 bg-violet-600/20 border border-violet-500/30 rounded-full text-violet-300 text-sm">
              <span className="mr-2">✨</span>
              AI-Powered Aspiration Tracker
            </div>

            <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Never Forget Your
              <span className="block gradient-text">Dreams Again</span>
            </h2>

            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Capture your aspirations. Get AI-powered motivation when you need it most.
              Turn your dreams into reality.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="group px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105 active:scale-95"
              >
                Start Free
                <svg
                  className="inline-block ml-2 w-5 h-5 transition-transform group-hover:translate-x-1"
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
            </div>
          </div>

          {/* Feature Cards */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '🎯',
                title: 'Capture Dreams',
                desc: 'Save your aspirations with deadlines and details',
              },
              {
                icon: '🤖',
                title: 'AI Motivation',
                desc: 'Get personalized encouragement powered by GPT-4',
              },
              {
                icon: '📈',
                title: 'Track Progress',
                desc: 'Mark milestones and celebrate your wins',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-6 bg-[#1f1f1f] border border-gray-800 rounded-xl hover:border-violet-500/50 transition-all duration-300 hover:bg-[#252525]"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-600 text-sm">
        Built to help you achieve your dreams
      </footer>
    </div>
  );
}
