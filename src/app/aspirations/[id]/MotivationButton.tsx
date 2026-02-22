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
      setMotivation('햄댕치가 잠시 자리를 비웠어요. 다시 시도해주세요!');
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
        <span className="mr-2">🍔</span>
        햄댕치한테 응원받기
      </Button>

      {motivation && (
        <div className="mt-6 p-5 bg-white border-2 border-gray-800 rounded-xl shadow-[3px_3px_0px_0px_#1a1a1a] animate-fade-in">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🍔</span>
            <p className="text-gray-700 leading-relaxed font-medium">{motivation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
