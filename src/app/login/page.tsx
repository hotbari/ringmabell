'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    const supabase = createClient();

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('이메일에서 확인 링크를 눌러주세요!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '문제가 발생했어요');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <Link
        href="/"
        className="mb-10 text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent"
      >
        RingMaBell 🔔
      </Link>

      <div className="w-full max-w-md bg-white rounded-2xl p-10 border border-pink-100 shadow-xl shadow-pink-100/50">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {isSignUp ? '회원가입' : '로그인'}
        </h1>
        <p className="text-gray-400 mb-8">
          {isSignUp
            ? '목표 관리를 시작해보세요 ✨'
            : '다시 오셨네요! 반가워요 🌸'}
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-500 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="email"
            type="email"
            label="이메일"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            id="password"
            type="password"
            label="비밀번호"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          <Button type="submit" isLoading={isLoading} size="lg" className="w-full mt-2">
            {isSignUp ? '회원가입' : '로그인'}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <span className="text-gray-400">
            {isSignUp ? '이미 계정이 있으신가요?' : '처음이신가요?'}{' '}
          </span>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setMessage('');
            }}
            className="text-pink-500 hover:text-pink-600 font-semibold transition-colors"
          >
            {isSignUp ? '로그인' : '회원가입'}
          </button>
        </div>
      </div>

      <p className="mt-8 text-gray-400 text-sm">
        목표를 기록하고 알림을 받아보세요 💕
      </p>
    </div>
  );
}
