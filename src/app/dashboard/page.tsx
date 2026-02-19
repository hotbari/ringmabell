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
      />

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="animate-fade-in">
              <h2 className="text-4xl font-bold text-white mb-2">
                My Dashboard
              </h2>
              <p className="text-gray-400">
                {activeAspirations.length} active dreams to pursue
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
