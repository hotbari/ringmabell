'use client';

import { useState, useEffect, useRef } from 'react';
import { SettingsModal } from './SettingsModal';
import { UserSettings, Alert } from '@/types';
import Link from 'next/link';

interface DashboardHeaderProps {
  userEmail: string;
  pendingAlertCount: number;
  alerts?: Alert[];
}

export function DashboardHeader({
  userEmail,
  pendingAlertCount,
  alerts = [],
}: DashboardHeaderProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pendingAlerts = alerts.filter((a) => a.status === 'pending').slice(0, 5);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FFF8F2] border-b-2 border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-black text-[#FF4D8B] tracking-tight">
            ★ RingMaBell ★
          </h1>
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative text-gray-500 hover:text-[#FF4D8B] transition-colors p-2"
                title="알림"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {pendingAlertCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#FF4D8B] text-white text-xs font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    {pendingAlertCount > 9 ? '9+' : pendingAlertCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border-2 border-gray-800 rounded-xl shadow-[5px_5px_0px_0px_#FF4D8B] overflow-hidden z-50">
                  <div className="p-4 border-b-2 border-gray-800 bg-[#FFE566] flex justify-between items-center">
                    <h3 className="font-black text-gray-800">🔔 알림</h3>
                    {pendingAlertCount > 0 && (
                      <span className="text-xs text-gray-600 font-bold">{pendingAlertCount}개 대기중</span>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {pendingAlerts.length === 0 ? (
                      <div className="p-6 text-center text-gray-400">
                        <p>알림이 없어요 ♡</p>
                      </div>
                    ) : (
                      pendingAlerts.map((alert) => (
                        <div key={alert.id} className="p-4 border-b border-pink-100 hover:bg-pink-50 transition-colors">
                          <p className="text-sm text-gray-700 line-clamp-2 font-medium">{alert.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {alert.aspiration?.title || '알림'}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  <Link
                    href="/dashboard?tab=alerts"
                    className="block p-3 text-center text-sm text-[#FF4D8B] font-bold hover:bg-pink-50 transition-colors"
                    onClick={() => setIsNotificationOpen(false)}
                  >
                    전체 알림 보기 →
                  </Link>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-gray-500 hover:text-[#FF4D8B] transition-colors p-2"
              title="설정"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            <span className="text-sm text-gray-400 hidden sm:block font-medium">
              {userEmail}
            </span>

            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="text-gray-400 hover:text-[#FF4D8B] transition-colors text-sm font-bold">
                로그아웃
              </button>
            </form>
          </div>
        </div>
      </header>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialSettings={settings}
      />
    </>
  );
}
