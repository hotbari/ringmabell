'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Aspiration, CreateAspirationInput, UpdateAspirationInput } from '@/types';

interface AspirationFormProps {
  aspiration?: Aspiration;
  mode: 'create' | 'edit';
}

export function AspirationForm({ aspiration, mode }: AspirationFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<CreateAspirationInput>({
    title: aspiration?.title || '',
    details: aspiration?.details || '',
    deadline: aspiration?.deadline || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const url =
        mode === 'create'
          ? '/api/aspirations'
          : `/api/aspirations/${aspiration?.id}`;

      const method = mode === 'create' ? 'POST' : 'PATCH';

      const body: CreateAspirationInput | UpdateAspirationInput = {
        title: formData.title,
        details: formData.details,
        deadline: formData.deadline || null,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Something went wrong');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm animate-fade-in">
          {error}
        </div>
      )}

      <Input
        id="title"
        label="What's your aspiration?"
        placeholder="e.g., Learn to play guitar, Visit Japan..."
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />

      <Textarea
        id="details"
        label="Tell me more about it"
        placeholder="Why does this matter to you? What would achieving this mean?"
        rows={4}
        value={formData.details}
        onChange={(e) => setFormData({ ...formData, details: e.target.value })}
        required
      />

      <Input
        id="deadline"
        label="Target date (optional)"
        type="date"
        value={formData.deadline || ''}
        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
      />

      <div className="flex gap-3 pt-4">
        <Button type="submit" isLoading={isLoading} size="lg" className="flex-1">
          {mode === 'create' ? 'Create Aspiration' : 'Save Changes'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
