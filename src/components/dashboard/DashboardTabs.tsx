'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Aspiration, Alert, AspirationGroup, AspirationGroupMember } from '@/types';
import { AspirationCard } from '@/components/aspirations/AspirationCard';
import { AlertList } from '@/components/alerts/AlertList';
import Link from 'next/link';
import Image from 'next/image';

interface DashboardTabsProps {
  activeAspirations: Aspiration[];
  completedAspirations: Aspiration[];
  alerts: Alert[];
  groups?: AspirationGroup[];
  groupMembers?: AspirationGroupMember[];
}

export function DashboardTabs({
  activeAspirations,
  completedAspirations,
  alerts,
  groups = [],
  groupMembers = [],
}: DashboardTabsProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'aspirations' | 'alerts'>(
    tabParam === 'alerts' ? 'alerts' : 'aspirations'
  );
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  useEffect(() => {
    if (tabParam === 'alerts') setActiveTab('alerts');
  }, [tabParam]);

  const pendingAlertCount = alerts.filter((a) => a.status === 'pending').length;

  // Build a map: aspirationId -> groupIds
  const aspirationGroupMap = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const member of groupMembers) {
      const existing = map.get(member.aspiration_id) || [];
      existing.push(member.group_id);
      map.set(member.aspiration_id, existing);
    }
    return map;
  }, [groupMembers]);

  // Filter aspirations by selected group
  const filteredActiveAspirations = useMemo(() => {
    if (!selectedGroupId) return activeAspirations;
    return activeAspirations.filter((a) => {
      const groupIds = aspirationGroupMap.get(a.id);
      return groupIds?.includes(selectedGroupId);
    });
  }, [activeAspirations, selectedGroupId, aspirationGroupMap]);

  const filteredCompletedAspirations = useMemo(() => {
    if (!selectedGroupId) return completedAspirations;
    return completedAspirations.filter((a) => {
      const groupIds = aspirationGroupMap.get(a.id);
      return groupIds?.includes(selectedGroupId);
    });
  }, [completedAspirations, selectedGroupId, aspirationGroupMap]);

  // Get the group info for a given aspiration (for tag display on card)
  const getAspirationGroups = (aspirationId: string): AspirationGroup[] => {
    const groupIds = aspirationGroupMap.get(aspirationId) || [];
    return groups.filter((g) => groupIds.includes(g.id));
  };

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={() => setActiveTab('aspirations')}
          className={`px-5 py-2.5 text-sm font-black rounded-lg border-2 transition-all ${
            activeTab === 'aspirations'
              ? 'bg-[#FF4D8B] text-white border-[#c4185e] shadow-[3px_3px_0px_0px_#c4185e]'
              : 'bg-white text-gray-600 border-gray-800 shadow-[3px_3px_0px_0px_#1a1a1a] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#1a1a1a]'
          }`}
        >
          🌸 나의 목표들
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-5 py-2.5 text-sm font-black rounded-lg border-2 transition-all flex items-center gap-2 ${
            activeTab === 'alerts'
              ? 'bg-[#FF4D8B] text-white border-[#c4185e] shadow-[3px_3px_0px_0px_#c4185e]'
              : 'bg-white text-gray-600 border-gray-800 shadow-[3px_3px_0px_0px_#1a1a1a] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#1a1a1a]'
          }`}
        >
          🔔 알림
          {pendingAlertCount > 0 && (
            <span className={`text-xs font-black px-1.5 py-0.5 rounded-full border ${
              activeTab === 'alerts'
                ? 'bg-white text-[#FF4D8B] border-white'
                : 'bg-[#FFE566] text-gray-800 border-gray-800'
            }`}>
              {pendingAlertCount}
            </span>
          )}
        </button>
      </div>

      {/* Aspirations Tab Content */}
      {activeTab === 'aspirations' && (
        <div>
          {/* Group Filter Tags */}
          {groups.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setSelectedGroupId(null)}
                className={`px-3 py-1.5 text-xs font-black rounded-full border-2 transition-all ${
                  selectedGroupId === null
                    ? 'bg-[#FF4D8B] text-white border-[#c4185e]'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'
                }`}
              >
                전체
              </button>
              {groups.map((group) => (
                <button
                  key={group.id}
                  onClick={() =>
                    setSelectedGroupId(
                      selectedGroupId === group.id ? null : group.id
                    )
                  }
                  className={`px-3 py-1.5 text-xs font-black rounded-full border-2 transition-all ${
                    selectedGroupId === group.id
                      ? 'text-white border-gray-700'
                      : 'text-gray-600 border-gray-300 hover:border-gray-500'
                  }`}
                  style={
                    selectedGroupId === group.id
                      ? { backgroundColor: group.color }
                      : {}
                  }
                >
                  {group.icon} {group.name}
                </button>
              ))}
            </div>
          )}

          {/* Empty State */}
          {activeAspirations.length === 0 && completedAspirations.length === 0 && (
            <div className="text-center py-16 animate-fade-in">
              <Image src="/Photoroom.png" alt="햄댕치" width={160} height={160} className="mx-auto mb-4 drop-shadow-md" />
              <h3 className="text-2xl font-black text-gray-800 mb-3">
                첫 번째 꿈을 기록해봐요!
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto font-medium">
                이루고 싶은 목표를 적어두면 햄댕치가 도와드릴게요 ✦
              </p>
              <Link
                href="/new"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#FF4D8B] text-white font-black rounded-lg border-2 border-[#c4185e] shadow-[5px_5px_0px_0px_#c4185e] hover:shadow-[2px_2px_0px_0px_#c4185e] hover:translate-x-[3px] hover:translate-y-[3px] transition-all text-base"
              >
                ✦ 첫 번째 목표 추가하기
              </Link>
            </div>
          )}

          {/* Active Aspirations */}
          {filteredActiveAspirations.length > 0 && (
            <section className="mb-12">
              <h3 className="text-base font-black text-gray-700 mb-6 flex items-center gap-2">
                <span className="bg-[#FF4D8B] text-white px-3 py-1 rounded-full text-xs border-2 border-[#c4185e]">
                  진행 중 💪
                </span>
                {selectedGroupId && (
                  <span className="text-xs text-gray-400 font-medium">
                    ({filteredActiveAspirations.length}개)
                  </span>
                )}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredActiveAspirations.map((aspiration, i) => (
                  <div key={aspiration.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                    <AspirationCard aspiration={aspiration} groups={getAspirationGroups(aspiration.id)} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* No results for filter */}
          {selectedGroupId && filteredActiveAspirations.length === 0 && filteredCompletedAspirations.length === 0 && (
            <div className="text-center py-12 text-gray-400 font-medium">
              이 그룹에 속한 목표가 없어요
            </div>
          )}

          {/* Completed Aspirations */}
          {filteredCompletedAspirations.length > 0 && (
            <section>
              <h3 className="text-base font-black text-gray-500 mb-6 flex items-center gap-2">
                <span className="bg-[#C8F2FF] text-gray-700 px-3 py-1 rounded-full text-xs border-2 border-gray-400">
                  완료한 목표들 ✅
                </span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 opacity-70">
                {filteredCompletedAspirations.map((aspiration, i) => (
                  <div key={aspiration.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                    <AspirationCard aspiration={aspiration} groups={getAspirationGroups(aspiration.id)} />
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
