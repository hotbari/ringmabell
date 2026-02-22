'use client';

import Link from 'next/link';
import { Aspiration, AspirationGroup } from '@/types';

interface AspirationCardProps {
  aspiration: Aspiration;
  groups?: AspirationGroup[];
}

export function AspirationCard({ aspiration, groups = [] }: AspirationCardProps) {
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
      <div className="group bg-white rounded-xl border-2 border-gray-800 shadow-[4px_4px_0px_0px_#1a1a1a] hover:shadow-[2px_2px_0px_0px_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] transition-all p-5">
        {/* Status indicator */}
        <div className="flex items-center justify-between mb-3">
          <span
            className={`text-xs font-black px-2.5 py-1 rounded-full border-2 ${
              aspiration.status === 'completed'
                ? 'bg-[#C8F2FF] text-blue-700 border-blue-400'
                : 'bg-[#FFD6E8] text-[#FF4D8B] border-[#FF4D8B]'
            }`}
          >
            {aspiration.status === 'completed' ? '✅ 완료' : '🌸 진행중'}
          </span>

          {daysUntil !== null && (
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-black border-2 ${
                daysUntil < 0
                  ? 'bg-red-100 text-red-600 border-red-400'
                  : daysUntil <= 7
                  ? 'bg-[#FFE566] text-gray-800 border-gray-500'
                  : 'bg-gray-100 text-gray-500 border-gray-300'
              }`}
            >
              {daysUntil < 0 ? '기한 지남' : daysUntil === 0 ? '오늘 마감' : `${daysUntil}일 남음`}
            </span>
          )}
        </div>

        <h3 className="text-base font-black text-gray-800 mb-2 line-clamp-2 group-hover:text-[#FF4D8B] transition-colors">
          {aspiration.title}
        </h3>

        <p className="text-sm text-gray-500 line-clamp-2 mb-3 font-medium">
          {aspiration.details}
        </p>

        {/* Group tags */}
        {groups.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {groups.map((group) => (
              <span
                key={group.id}
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: group.color + '33', color: group.color }}
              >
                {group.icon} {group.name}
              </span>
            ))}
          </div>
        )}

        <span className="text-xs text-gray-300 font-medium">
          {formatDate(aspiration.created_at)}
        </span>
      </div>
    </Link>
  );
}
