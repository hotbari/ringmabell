'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      setMessage({ type: 'error', text: '별점을 선택해주세요' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '소중한 피드백 감사합니다!' });
        setTimeout(() => {
          onClose();
          setRating(0);
          setComment('');
          setMessage(null);
        }, 1500);
      } else if (response.status === 429) {
        setMessage({ type: 'error', text: '하루에 한 번만 피드백을 보낼 수 있어요' });
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || '피드백 전송에 실패했어요' });
      }
    } catch {
      setMessage({ type: 'error', text: '네트워크 오류가 발생했어요' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = hoveredRating || rating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-xl border-2 border-gray-800 shadow-[8px_8px_0px_0px_#FF4D8B] w-full max-w-md mx-4 p-6 animate-fade-in">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-800">
          <h2 className="text-xl font-black text-gray-800">💬 피드백</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors font-black text-lg">
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Star Rating */}
          <div>
            <h3 className="text-sm font-black text-gray-700 mb-3">서비스는 어떠셨나요?</h3>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="text-3xl transition-transform hover:scale-110"
                >
                  <span style={{ color: star <= displayRating ? '#FFE566' : '#D1D5DB' }}>
                    ★
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <Textarea
            placeholder="의견을 자유롭게 남겨주세요 (선택)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
            rows={4}
          />

          {/* Message */}
          {message && (
            <div className={`p-3 rounded-lg text-sm font-medium border-2 ${
              message.type === 'success'
                ? 'bg-[#C8F2FF] text-blue-700 border-blue-300'
                : 'bg-red-50 text-red-600 border-red-300'
            }`}>
              {message.text}
            </div>
          )}

          <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting} disabled={rating === 0} className="w-full">
            보내기 ✦
          </Button>
        </div>
      </div>
    </div>
  );
}
