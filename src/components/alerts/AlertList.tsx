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
        <h3 className="text-xl font-semibold text-white mb-2">No alerts yet</h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          Alerts will appear here when your aspirations approach their deadlines.
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
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            filter === 'all'
              ? 'bg-violet-600 text-white'
              : 'bg-[#2a2a2a] text-gray-400 hover:text-white'
          }`}
        >
          All ({alerts.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            filter === 'pending'
              ? 'bg-violet-600 text-white'
              : 'bg-[#2a2a2a] text-gray-400 hover:text-white'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('done')}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            filter === 'done'
              ? 'bg-violet-600 text-white'
              : 'bg-[#2a2a2a] text-gray-400 hover:text-white'
          }`}
        >
          Done ({alerts.length - pendingCount})
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
          <div className="text-center py-8 text-gray-500">
            No {filter} alerts
          </div>
        )}
      </div>
    </div>
  );
}
