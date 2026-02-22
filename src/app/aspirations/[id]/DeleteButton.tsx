'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

interface DeleteButtonProps {
  aspirationId: string;
}

export function DeleteButton({ aspirationId }: DeleteButtonProps) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/aspirations/${aspirationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Delete failed:', error);
      setIsDeleting(false);
      setIsConfirming(false);
    }
  };

  if (isConfirming) {
    return (
      <div className="flex items-center gap-2 animate-fade-in">
        <span className="text-sm text-gray-500">삭제할까요?</span>
        <Button
          size="sm"
          variant="danger"
          onClick={handleDelete}
          isLoading={isDeleting}
        >
          Yes
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsConfirming(false)}
          disabled={isDeleting}
        >
          No
        </Button>
      </div>
    );
  }

  return (
    <Button size="sm" variant="ghost" onClick={() => setIsConfirming(true)}>
      <svg
        className="w-4 h-4 text-red-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    </Button>
  );
}
