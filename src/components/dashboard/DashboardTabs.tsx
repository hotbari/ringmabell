'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Aspiration, Alert } from '@/types';
import { AspirationCard } from '@/components/aspirations/AspirationCard';
import { AlertList } from '@/components/alerts/AlertList';
import Link from 'next/link';

interface DashboardTabsProps {
  activeAspirations: Aspiration[];
  completedAspirations: Aspiration[];
  alerts: Alert[];
}

export function DashboardTabs({
  activeAspirations,
  completedAspirations,
  alerts,
}: DashboardTabsProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'aspirations' | 'alerts'>(
    tabParam === 'alerts' ? 'alerts' : 'aspirations'
  );

  useEffect(() => {
    if (tabParam === 'alerts') {
      setActiveTab('alerts');
    }
  }, [tabParam]);

  const pendingAlertCount = alerts.filter((a) => a.status === 'pending').length;

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setActiveTab('aspirations')}
          className={`px-5 py-2.5 text-sm font-semibold rounded-full transition-all ${
            activeTab === 'aspirations'
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md shadow-pink-200'
              : 'bg-white text-gray-400 hover:text-gray-600 border border-pink-100'
          }`}
        >
          나의 목표들 🌸
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-5 py-2.5 text-sm font-semibold rounded-full transition-all flex items-center gap-2 ${
            activeTab === 'alerts'
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md shadow-pink-200'
              : 'bg-white text-gray-400 hover:text-gray-600 border border-pink-100'
          }`}
        >
          알림
          {pendingAlertCount > 0 && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              activeTab === 'alerts'
                ? 'bg-white/30 text-white'
                : 'bg-pink-100 text-pink-600'
            }`}>
              {pendingAlertCount}
            </span>
          )}
        </button>
      </div>

      {/* Aspirations Tab Content */}
      {activeTab === 'aspirations' && (
        <div>
          {/* Empty State */}
          {activeAspirations.length === 0 && completedAspirations.length === 0 && (
            <div className="text-center py-20 animate-fade-in">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                <span className="text-5xl">🌟</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                첫 번째 꿈을 기록해봐요!
              </h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                이루고 싶은 목표를 적어두면 AI가 도와드릴게요 ✨
              </p>
              <Link
                href="/new"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold rounded-full transition-all shadow-lg shadow-pink-200 hover:shadow-xl hover:shadow-pink-300"
              >
                첫 번째 목표 추가하기 🌸
              </Link>
            </div>
          )}

          {/* Active Aspirations */}
          {activeAspirations.length > 0 && (
            <section className="mb-12">
              <h3 className="text-lg font-semibold text-gray-700 mb-6 flex items-center gap-2">
                <span className="w-1 h-5 bg-gradient-to-b from-pink-400 to-purple-400 rounded-full"></span>
                진행 중 💪
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
          {completedAspirations.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-gray-500 mb-6 flex items-center gap-2">
                <span className="w-1 h-5 bg-gradient-to-b from-emerald-400 to-teal-400 rounded-full"></span>
                완료한 목표들 ✅
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 opacity-70">
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
      )}

      {/* Alerts Tab Content */}
      {activeTab === 'alerts' && (
        <div className="animate-fade-in">
          <AlertList initialAlerts={alerts} />
        </div>
      )}
    </div>
  );
}
