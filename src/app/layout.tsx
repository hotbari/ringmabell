import type { Metadata, Viewport } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import './globals.css';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';

const notoSansKR = Noto_Sans_KR({
  variable: '--font-noto-sans-kr',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'RingMaBell - 목표 알림 서비스',
  description:
    '목표를 기록하고 AI 알림을 받아보세요. 작은 실천이 큰 변화를 만듭니다.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'RingMaBell',
  },
};

export const viewport: Viewport = {
  themeColor: '#f472b6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body
        className={`${notoSansKR.variable} antialiased`}
      >
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
