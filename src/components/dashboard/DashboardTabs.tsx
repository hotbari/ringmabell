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
      <div className="flex gap-4 mb-8 border-b border-gray-800">
        <button
          onClick={() => setActiveTab('aspirations')}
          className={`pb-3 px-1 text-lg font-semibold transition-colors relative ${activeTab === 'aspirations'
            ? 'text-white'
            : 'text-gray-500 hover:text-gray-300'
            }`}
        >
          Aspirations
          {activeTab === 'aspirations' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`pb-3 px-1 text-lg font-semibold transition-colors relative flex items-center gap-2 ${activeTab === 'alerts'
            ? 'text-white'
            : 'text-gray-500 hover:text-gray-300'
            }`}
        >
          Alerts
          {pendingAlertCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {pendingAlertCount}
            </span>
          )}
          {activeTab === 'alerts' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500" />
          )}
        </button>
      </div>

      {/* Aspirations Tab Content */}
      {activeTab === 'aspirations' && (
        <div>
          {/* Empty State */}
          {activeAspirations.length === 0 && completedAspirations.length === 0 && (
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
          {activeAspirations.length > 0 && (
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
          {completedAspirations.length > 0 && (
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
