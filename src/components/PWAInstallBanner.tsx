'use client';

import React, { useEffect, useState } from 'react';
import { X, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallBanner() {
  const [mounted, setMounted] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === 'undefined') return;

    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    const isIosDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone;

    if (isIosDevice && !isStandalone) {
      setIsIOS(true);
      try {
        const dismissed = localStorage.getItem('pwa_ios_prompt_dismissed');
        if (!dismissed) {
          setShowPrompt(true);
        }
      } catch {
        // ignore
      }
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    if (isIOS) {
      try {
        localStorage.setItem('pwa_ios_prompt_dismissed', 'true');
      } catch {
        // ignore
      }
    }
  };

  if (!mounted || !showPrompt) return null;

  return (
    <div className="fixed top-16 left-4 right-4 z-50 max-w-md mx-auto bg-white/95 backdrop-blur-md text-slate-900 p-3.5 rounded-2xl shadow-xl border border-teal-200 animate-fadeIn">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <img
            src="/icon.svg?v=3"
            alt="ECG App Icon"
            className="w-11 h-11 rounded-xl border border-teal-500/30 shadow-sm flex-shrink-0"
          />
          <div>
            <h4 className="text-xs font-bold text-teal-700">心電図アイコンでホーム画面に追加</h4>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-tight">
              {isIOS ? (
                <>
                  画面下の共有アイコン <Share className="w-3 h-3 inline text-teal-600" /> をタップし「ホーム画面に追加」を選択
                </>
              ) : (
                '専用アイコンでホーム画面から1タップで復習を開始できます'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {!isIOS && deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold text-xs px-3 py-1.5 rounded-xl hover:from-teal-600 hover:to-emerald-700 transition-colors flex-shrink-0"
            >
              追加
            </button>
          )}
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
