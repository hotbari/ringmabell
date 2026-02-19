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
      <div className="group bg-white rounded-2xl overflow-hidden border border-pink-100 hover:border-pink-300 hover:shadow-lg hover:shadow-pink-100 transition-all duration-200 p-5">
        {/* Status indicator */}
        <div className="flex items-center justify-between mb-3">
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              aspiration.status === 'completed'
                ? 'bg-emerald-100 text-emerald-600'
                : 'bg-pink-100 text-pink-600'
            }`}
          >
            {aspiration.status === 'completed' ? '✅ 완료' : '🌸 진행중'}
          </span>

          {daysUntil !== null && (
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                daysUntil < 0
                  ? 'bg-red-100 text-red-500'
                  : daysUntil <= 7
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-purple-100 text-purple-500'
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

        <h3 className="text-base font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-pink-500 transition-colors">
          {aspiration.title}
        </h3>

        <p className="text-sm text-gray-400 line-clamp-2 mb-4">
          {aspiration.details}
        </p>

        <span className="text-xs text-gray-300">
          {formatDate(aspiration.created_at)}
        </span>
      </div>
    </Link>
  );
}
