'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { UserSettings } from '@/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSettings: UserSettings | null;
}

export function SettingsModal({
  isOpen,
  onClose,
  initialSettings,
}: SettingsModalProps) {
  const [webhookUrl, setWebhookUrl] = useState(
    initialSettings?.discord_webhook_url || ''
  );
  const [notificationEnabled, setNotificationEnabled] = useState(
    initialSettings?.notification_enabled ?? true
  );
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    if (initialSettings) {
      setWebhookUrl(initialSettings.discord_webhook_url || '');
      setNotificationEnabled(initialSettings.notification_enabled);
    }
  }, [initialSettings]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discord_webhook_url: webhookUrl || null,
          notification_enabled: notificationEnabled,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '저장됐어요! ✨' });
        setTimeout(() => {
          onClose();
          setMessage(null);
        }, 1500);
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || '저장에 실패했어요' });
      }
    } catch {
      setMessage({ type: 'error', text: '네트워크 오류가 발생했어요' });
    } finally {
      setIsSaving(false);
    }
  };

  const validateWebhook = async () => {
    if (!webhookUrl) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/settings/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhook_url: webhookUrl }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '디스코드로 테스트 메시지를 보냈어요! 💌' });
      } else {
        setMessage({ type: 'error', text: '유효하지 않은 웹훅 URL이에요' });
      }
    } catch {
      setMessage({ type: 'error', text: '테스트에 실패했어요' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl border border-pink-100 shadow-2xl shadow-pink-100/50 w-full max-w-md mx-4 p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">설정 ⚙️</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Discord Webhook Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              </svg>
              Discord 연동
            </h3>

            <Input
              type="url"
              placeholder="https://discord.com/api/webhooks/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="mb-3"
            />

            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={validateWebhook}
                disabled={!webhookUrl || isSaving}
              >
                테스트 전송
              </Button>
            </div>

            <p className="text-xs text-gray-400 mt-2">
              Discord 서버 설정 → 연동 → 웹훅에서 URL을 가져오세요
            </p>
          </div>

          {/* Notification Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-medium">알림 받기</span>
            <button
              onClick={() => setNotificationEnabled(!notificationEnabled)}
              className={`relative w-12 h-6 rounded-full transition-all ${
                notificationEnabled
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500'
                  : 'bg-gray-200'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                  notificationEnabled ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`p-3 rounded-xl text-sm ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'bg-red-50 text-red-500 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Save Button */}
          <Button
            variant="primary"
            onClick={handleSave}
            isLoading={isSaving}
            className="w-full"
          >
            저장하기
          </Button>
        </div>
      </div>
    </div>
  );
}
