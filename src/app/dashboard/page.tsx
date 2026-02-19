import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Aspiration, Alert } from '@/types';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch aspirations and alerts in parallel
  const [aspirationsResult, alertsResult] = await Promise.all([
    supabase
      .from('aspirations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('alerts')
      .select(`
        *,
        aspiration:aspirations(id, title, deadline, status)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ]);

  const aspirations = aspirationsResult.data as Aspiration[] | null;
  const alerts = (alertsResult.data as Alert[] | null) || [];

  const activeAspirations = aspirations?.filter((a) => a.status === 'active') || [];
  const completedAspirations = aspirations?.filter((a) => a.status === 'completed') || [];
  const pendingAlertCount = alerts.filter((a) => a.status === 'pending').length;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <DashboardHeader
        userEmail={user.email || ''}
        pendingAlertCount={pendingAlertCount}
        alerts={alerts}
      />

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="animate-fade-in">
              <h2 className="text-4xl font-bold text-gray-800 mb-2">
                My Dashboard ✨
              </h2>
              <p className="text-gray-400">
                {activeAspirations.length}개의 꿈을 향해 나아가는 중이에요
              </p>
            </div>
            <Link
              href="/new"
              className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold rounded-full transition-all duration-300 shadow-lg shadow-pink-200 hover:shadow-xl hover:shadow-pink-300 hover:scale-105 active:scale-95"
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
              새 목표 추가
            </Link>
          </div>

          {/* Tabs Section */}
          <DashboardTabs
            activeAspirations={activeAspirations}
            completedAspirations={completedAspirations}
            alerts={alerts}
          />
        </div>
      </main>
    </div>
  );
}
