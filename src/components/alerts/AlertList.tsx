'use client';

import { useState, useEffect } from 'react';
import { Alert } from '@/types';
import { AlertCard } from './AlertCard';

interface AlertListProps {
  initialAlerts: Alert[];
}

export function AlertList({ initialAlerts }: AlertListProps) {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all');

  useEffect(() => {
    setAlerts(initialAlerts);
  }, [initialAlerts]);

  const handleMarkDone = async (alertId: string) => {
    const response = await fetch(`/api/alerts/${alertId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'done' }),
    });
    if (response.ok) {
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId ? { ...alert, status: 'done', read_at: new Date().toISOString() } : alert
        )
      );
    }
  };

  const filteredAlerts = alerts.filter((alert) => filter === 'all' || alert.status === filter);
  const pendingCount = alerts.filter((a) => a.status === 'pending').length;

  if (alerts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🔔</div>
        <h3 className="text-xl font-black text-gray-700 mb-2">알림이 없어요</h3>
        <p className="text-gray-500 max-w-sm mx-auto font-medium">
          목표 마감일이 가까워지면 알림이 여기에 나타날 거예요 ♡
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'all', label: `전체 (${alerts.length})` },
          { key: 'pending', label: `대기중 (${pendingCount})` },
          { key: 'done', label: `완료 (${alerts.length - pendingCount})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as 'all' | 'pending' | 'done')}
            className={`px-4 py-2 text-sm font-black rounded-lg border-2 transition-all ${
              filter === key
                ? 'bg-[#FF4D8B] text-white border-[#c4185e] shadow-[3px_3px_0px_0px_#c4185e]'
                : 'bg-white text-gray-600 border-gray-800 shadow-[3px_3px_0px_0px_#1a1a1a] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#1a1a1a]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert, index) => (
          <div key={alert.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
            <AlertCard alert={alert} onMarkDone={handleMarkDone} />
          </div>
        ))}
        {filteredAlerts.length === 0 && (
          <div className="text-center py-8 text-gray-400 font-medium">
            {filter === 'pending' ? '대기 중인 알림이 없어요 ✦' : '완료된 알림이 없어요'}
          </div>
        )}
      </div>
    </div>
  );
}
