'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Aspiration } from '@/types';

interface StatusToggleProps {
  aspiration: Aspiration;
}

export function StatusToggle({ aspiration }: StatusToggleProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const toggleStatus = async () => {
    setIsLoading(true);

    try {
      const newStatus =
        aspiration.status === 'active' ? 'completed' : 'active';

      const response = await fetch(`/api/aspirations/${aspiration.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      router.refresh();
    } catch (error) {
      console.error('Status update failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant={aspiration.status === 'active' ? 'secondary' : 'primary'}
      onClick={toggleStatus}
      isLoading={isLoading}
    >
      {aspiration.status === 'active' ? (
        <>
          <svg
            className="w-4 h-4 mr-1.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Complete
        </>
      ) : (
        <>
          <svg
            className="w-4 h-4 mr-1.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Reactivate
        </>
      )}
    </Button>
  );
}
