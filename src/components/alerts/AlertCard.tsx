'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Alert } from '@/types';
import { Button } from '@/components/ui/Button';

interface AlertCardProps {
  alert: Alert;
  onMarkDone: (alertId: string) => Promise<void>;
}

export function AlertCard({ alert, onMarkDone }: AlertCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getAlertIcon = () => {
    switch (alert.type) {
      case 'overdue':
        return '🚨';
      case 'deadline_today':
        return '⚠️';
      case 'deadline_soon':
        return '⏰';
      case 'reminder':
        return '📅';
    }
  };

  const getAlertColor = () => {
    switch (alert.type) {
      case 'overdue':
        return 'border-red-500/50 bg-red-500/5';
      case 'deadline_today':
        return 'border-orange-500/50 bg-orange-500/5';
      case 'deadline_soon':
        return 'border-amber-500/50 bg-amber-500/5';
      case 'reminder':
        return 'border-blue-500/50 bg-blue-500/5';
    }
  };

  const handleMarkDone = async () => {
    setIsLoading(true);
    try {
      await onMarkDone(alert.id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`relative rounded-lg border p-4 ${getAlertColor()} ${
        alert.status === 'done' ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{getAlertIcon()}</span>

        <div className="flex-1 min-w-0">
          {alert.aspiration && (
            <Link
              href={`/aspirations/${alert.aspiration_id}`}
              className="text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors line-clamp-1"
            >
              {alert.aspiration.title}
            </Link>
          )}

          <p className="text-white mt-1">{alert.message}</p>

          <div className="flex items-center gap-3 mt-3">
            <span className="text-xs text-gray-500">
              {getTimeAgo(alert.created_at)}
            </span>

            {alert.sent_to_discord && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                </svg>
                Sent
              </span>
            )}
          </div>
        </div>

        {alert.status === 'pending' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkDone}
            isLoading={isLoading}
            className="flex-shrink-0"
          >
            Done
          </Button>
        )}

        {alert.status === 'done' && (
          <span className="text-green-500 text-lg flex-shrink-0">✓</span>
        )}
      </div>
    </div>
  );
}
