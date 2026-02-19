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
          alert.id === alertId
            ? { ...alert, status: 'done', read_at: new Date().toISOString() }
            : alert
        )
      );
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'all') return true;
    return alert.status === filter;
  });

  const pendingCount = alerts.filter((a) => a.status === 'pending').length;

  if (alerts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🔔</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">알림이 없어요</h3>
        <p className="text-gray-400 max-w-sm mx-auto">
          목표 마감일이 가까워지면 알림이 여기에 나타날 거예요 🌸
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm rounded-full transition-all font-medium ${
            filter === 'all'
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md shadow-pink-200'
              : 'bg-white text-gray-400 hover:text-gray-600 border border-pink-100'
          }`}
        >
          전체 ({alerts.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 text-sm rounded-full transition-all font-medium ${
            filter === 'pending'
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md shadow-pink-200'
              : 'bg-white text-gray-400 hover:text-gray-600 border border-pink-100'
          }`}
        >
          대기중 ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('done')}
          className={`px-4 py-2 text-sm rounded-full transition-all font-medium ${
            filter === 'done'
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md shadow-pink-200'
              : 'bg-white text-gray-400 hover:text-gray-600 border border-pink-100'
          }`}
        >
          완료 ({alerts.length - pendingCount})
        </button>
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert, index) => (
          <div
            key={alert.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <AlertCard alert={alert} onMarkDone={handleMarkDone} />
          </div>
        ))}

        {filteredAlerts.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            {filter === 'pending' ? '대기 중인 알림이 없어요 ✨' : '완료된 알림이 없어요'}
          </div>
        )}
      </div>
    </div>
  );
}
