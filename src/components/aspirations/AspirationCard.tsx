'use client';

import Link from 'next/link';
import { Aspiration } from '@/types';

interface AspirationCardProps {
  aspiration: Aspiration;
}

export function AspirationCard({ aspiration }: AspirationCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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

  const getGradient = () => {
    const gradients = [
      'from-violet-600 to-purple-600',
      'from-blue-600 to-cyan-600',
      'from-pink-600 to-rose-600',
      'from-amber-600 to-orange-600',
      'from-emerald-600 to-teal-600',
    ];
    const index = aspiration.title.length % gradients.length;
    return gradients[index];
  };

  return (
    <Link href={`/aspirations/${aspiration.id}`} className="block">
      <div className="group relative bg-[#1f1f1f] rounded-lg overflow-hidden card-hover border border-gray-800 hover:border-violet-500/50">
        {/* Gradient Header */}
        <div
          className={`h-24 bg-gradient-to-br ${getGradient()} opacity-80 group-hover:opacity-100 transition-opacity`}
        />

        {/* Content */}
        <div className="p-5 -mt-8 relative">
          {/* Icon Badge */}
          <div className="w-12 h-12 rounded-lg bg-[#1f1f1f] border-2 border-[#1f1f1f] flex items-center justify-center mb-4 shadow-lg">
            <span className="text-2xl">
              {aspiration.status === 'completed' ? '✅' : '🎯'}
            </span>
          </div>

          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-violet-300 transition-colors">
            {aspiration.title}
          </h3>

          <p className="text-sm text-gray-500 line-clamp-2 mb-4">
            {aspiration.details}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">
              {formatDate(aspiration.created_at)}
            </span>

            {daysUntil !== null && (
              <span
                className={`px-2 py-1 rounded-full font-medium ${
                  daysUntil < 0
                    ? 'bg-red-500/20 text-red-400'
                    : daysUntil <= 7
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {daysUntil < 0
                  ? 'Overdue'
                  : daysUntil === 0
                  ? 'Today'
                  : `${daysUntil}d left`}
              </span>
            )}
          </div>
        </div>

        {/* Hover Glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-violet-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
    </Link>
  );
}
