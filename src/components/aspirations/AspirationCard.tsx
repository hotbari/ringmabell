'use client';

import Link from 'next/link';
import { Aspiration } from '@/types';

interface AspirationCardProps {
  aspiration: Aspiration;
}

export function AspirationCard({ aspiration }: AspirationCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysUntilDeadline = () => {
    if (!aspiration.deadline) return null;
    const deadline = new Date(aspiration.deadline);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntil = getDaysUntilDeadline();

  return (
    <Link href={`/aspirations/${aspiration.id}`} className="block">
      <div className="group bg-[#1f1f1f] rounded-lg overflow-hidden border border-gray-800 hover:border-violet-500/50 transition-colors p-5">
        {/* Status indicator */}
        <div className="flex items-center justify-between mb-3">
          <span
            className={`text-xs font-medium px-2 py-1 rounded ${
              aspiration.status === 'completed'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-violet-500/20 text-violet-400'
            }`}
          >
            {aspiration.status === 'completed' ? '완료' : '진행중'}
          </span>

          {daysUntil !== null && (
            <span
              className={`text-xs px-2 py-1 rounded font-medium ${
                daysUntil < 0
                  ? 'bg-red-500/20 text-red-400'
                  : daysUntil <= 7
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              {daysUntil < 0
                ? '기한 지남'
                : daysUntil === 0
                ? '오늘 마감'
                : `${daysUntil}일 남음`}
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-violet-300 transition-colors">
          {aspiration.title}
        </h3>

        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
          {aspiration.details}
        </p>

        <span className="text-xs text-gray-600">
          {formatDate(aspiration.created_at)}
        </span>
      </div>
    </Link>
  );
}
