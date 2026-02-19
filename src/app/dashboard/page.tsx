import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Aspiration, Alert } from '@/types';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [aspirationsResult, alertsResult] = await Promise.all([
    supabase.from('aspirations').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('alerts').select(`*, aspiration:aspirations(id, title, deadline, status)`).eq('user_id', user.id).order('created_at', { ascending: false }),
  ]);

  const aspirations = aspirationsResult.data as Aspiration[] | null;
  const alerts = (alertsResult.data as Alert[] | null) || [];
  const activeAspirations = aspirations?.filter((a) => a.status === 'active') || [];
  const completedAspirations = aspirations?.filter((a) => a.status === 'completed') || [];
  const pendingAlertCount = alerts.filter((a) => a.status === 'pending').length;

  return (
    <div className="min-h-screen">
      <DashboardHeader userEmail={user.email || ''} pendingAlertCount={pendingAlertCount} alerts={alerts} />

      <main className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="animate-fade-in">
              <h2 className="text-4xl font-black text-gray-800 mb-1 tracking-tight">
                My Dashboard ✦
              </h2>
              <p className="text-gray-500 font-medium">
                {activeAspirations.length}개의 꿈을 향해 나아가는 중이에요 🌸
              </p>
            </div>
            <Link
              href="/new"
              className="flex items-center gap-2 px-6 py-3 bg-[#FF4D8B] text-white font-black rounded-lg border-2 border-[#c4185e] shadow-[4px_4px_0px_0px_#c4185e] hover:shadow-[2px_2px_0px_0px_#c4185e] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
              새 목표 추가
            </Link>
          </div>

          <DashboardTabs activeAspirations={activeAspirations} completedAspirations={completedAspirations} alerts={alerts} />
        </div>
      </main>
    </div>
  );
}
