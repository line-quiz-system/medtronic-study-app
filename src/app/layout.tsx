import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { PWAInstallBanner } from '@/components/PWAInstallBanner';

export const metadata: Metadata = {
  title: 'Medtronic Academy - アクティブリコール学習',
  description: 'Medtronic Academy High Power (CRT / ICD) アクティブリコール想起訓練Webアプリ',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg?v=3', type: 'image/svg+xml' },
      { url: '/icon-192x192.png?v=3', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png?v=3', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png?v=3', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Medtronic学習',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="antialiased min-h-screen bg-white text-slate-900 flex flex-col selection:bg-teal-500/20 selection:text-slate-900">
        <Header />
        <PWAInstallBanner />
        <main className="flex-1 flex flex-col pb-16 bg-white">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
