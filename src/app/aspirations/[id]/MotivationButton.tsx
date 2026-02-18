'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface MotivationButtonProps {
  aspirationId: string;
}

export function MotivationButton({ aspirationId }: MotivationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [motivation, setMotivation] = useState<string | null>(null);

  const getMotivation = async () => {
    setIsLoading(true);
    setMotivation(null);

    try {
      const response = await fetch(`/api/aspirations/${aspirationId}/remind`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed');

      const data = await response.json();
      setMotivation(data.reminder);
    } catch (error) {
      console.error(error);
      setMotivation('Could not generate motivation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Button
        onClick={getMotivation}
        isLoading={isLoading}
        size="lg"
        className="w-full"
      >
        <span className="mr-2">✨</span>
        Get AI Motivation
      </Button>

      {motivation && (
        <div className="mt-6 p-6 bg-gradient-to-br from-violet-600/20 to-purple-600/20 rounded-xl border border-violet-500/30 animate-fade-in">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💜</span>
            <p className="text-gray-200 leading-relaxed">{motivation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
