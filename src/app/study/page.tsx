'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStudyStore } from '@/store/useStudyStore';
import { Flashcard } from '@/components/Flashcard';
import { EcgLoader } from '@/components/EcgLoader';
import confetti from 'canvas-confetti';
import {
  LogOut,
  Target,
  Trophy,
  Home,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { AnswerRating } from '@/types';

export default function StudyPage() {
  const router = useRouter();
  const {
    sessionCards,
    currentSessionIndex,
    isFlipped,
    sessionCorrectIds,
    sessionIncorrectIds,
    sessionReview3dIds,
    isSessionActive,
    isSessionCompleted,
    flipCard,
    submitAnswer,
    startSession,
    startUnseenSession,
    endSession,
    getOverallStats,
  } = useStudyStore();

  const [mounted, setMounted] = useState(false);
  const [isPreparing, setIsPreparing] = useState(true);
  const [isFinishedEarly, setIsFinishedEarly] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setIsPreparing(false);
    }, 850);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (mounted && !isSessionActive && !isSessionCompleted && sessionCards.length === 0) {
      const ok = startSession();
      if (!ok) {
        router.push('/');
      }
    }
  }, [mounted, isSessionActive, isSessionCompleted, sessionCards.length, startSession, router]);

  const totalCards = sessionCards.length;
  const isCompleted =
    isSessionCompleted || (totalCards > 0 && currentSessionIndex >= totalCards) || isFinishedEarly;
  const currentCard = sessionCards[currentSessionIndex];

  const handleFinishEarly = () => {
    setIsFinishedEarly(true);
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        flipCard();
      } else if (isFlipped && !isCompleted) {
        if (e.key === '1' || e.code === 'Digit1' || e.code === 'Numpad1') {
          e.preventDefault();
          submitAnswer('forgot');
        } else if (e.key === '2' || e.code === 'Digit2' || e.code === 'Numpad2') {
          e.preventDefault();
          submitAnswer('review_3d');
        } else if (e.key === '3' || e.code === 'Digit3' || e.code === 'Numpad3') {
          e.preventDefault();
          submitAnswer('remembered');
        }
      }
    },
    [isFlipped, isCompleted, flipCard, submitAnswer]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isCompleted && mounted) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });

        const timer = setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
          });
        }, 300);

        return () => clearTimeout(timer);
      } catch {
        // ignore
      }
    }
  }, [isCompleted, mounted]);

  const handleExitAndSave = () => {
    router.push('/');
  };

  const handleContinueUnseen = () => {
    setIsPreparing(true);
    setIsFinishedEarly(false);
    endSession();
    const ok = startUnseenSession(15);
    setTimeout(() => setIsPreparing(false), 750);
    if (!ok) {
      router.push('/');
    }
  };

  const handleBackToHome = () => {
    endSession();
    router.push('/');
  };

  if (!mounted || isPreparing || totalCards === 0) {
    return (
      <EcgLoader
        message="アクティブリコール学習セッションを準備中..."
        subMessage="LEAD II | Sinus Rhythm | HR 72 bpm | 25.0 mm/s"
      />
    );
  }

  const rememberedCount = sessionCorrectIds.length;
  const review3dCount = sessionReview3dIds?.length || 0;
  const forgotCount = sessionIncorrectIds.length;
  const answeredTotal = rememberedCount + review3dCount + forgotCount;
  const stats = getOverallStats();
  const unseenAvailable = stats.newCount;

  return (
    <div className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 py-5 sm:py-8 bg-white">
      {!isCompleted && currentCard ? (
        <div className="space-y-5">
          {/* 上部ヘッダー（進捗バー & 中断して保存） */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between gap-1.5 text-xs">
              <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0 whitespace-nowrap">
                <Target className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                <span className="font-bold text-slate-900 text-xs sm:text-sm">
                  問題 {currentSessionIndex + 1}/{totalCards}問
                </span>
                <span className="text-slate-400 font-mono text-[11px] hidden md:inline ml-1">
                  ({Math.round((currentSessionIndex / totalCards) * 100)}%)
                </span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2 shrink-0 whitespace-nowrap">
                {currentSessionIndex > 0 && (
                  <button
                    type="button"
                    onClick={handleFinishEarly}
                    className="flex items-center space-x-1 rounded-xl border border-teal-200 bg-teal-50 px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-teal-700 hover:bg-teal-100 transition shadow-sm whitespace-nowrap"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                    <span className="hidden sm:inline">終了して結果確認</span>
                    <span className="sm:hidden">結果確認</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleExitAndSave}
                  className="flex items-center space-x-1 rounded-xl border border-slate-200 bg-slate-50 px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition whitespace-nowrap"
                >
                  <LogOut className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden sm:inline">中断して保存</span>
                  <span className="sm:hidden">中断保存</span>
                </button>
              </div>
            </div>

            {/* 進捗バー */}
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 transition-all duration-300"
                style={{ width: `${(currentSessionIndex / totalCards) * 100}%` }}
              />
            </div>
          </div>

          {/* フラッシュカード本体 */}
          <Flashcard
            key={`${currentCard.question.id}-${currentSessionIndex}`}
            card={currentCard}
            isFlipped={isFlipped}
            onFlip={flipCard}
            onAnswer={(rating: AnswerRating | boolean) => submitAnswer(rating)}
          />
        </div>
      ) : (
        /* セッション完了画面 */
        <div className="space-y-8 animate-fadeIn">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/25 mb-5">
              <Trophy className="h-10 w-10 animate-bounce" />
            </div>

            <div className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200 mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>セッション完了</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              セッションが完了しました！
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              自己評価に基づき、次回出題スケジュール（翌日・3日後・7日後）が自動設定されました。
            </p>

            {/* 結果サマリーグリッド */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-[11px] font-bold text-slate-500 uppercase">解答数</span>
                <div className="mt-2 flex items-baseline space-x-1">
                  <span className="text-2xl font-black text-slate-900">{answeredTotal}</span>
                  <span className="text-xs text-slate-500">問</span>
                </div>
              </div>

              <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4">
                <span className="text-[11px] font-bold text-rose-600 uppercase">忘れていた</span>
                <div className="mt-2 flex items-baseline space-x-1">
                  <span className="text-2xl font-black text-rose-700">{forgotCount}</span>
                  <span className="text-xs text-rose-600/80">問 (翌日)</span>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                <span className="text-[11px] font-bold text-amber-600 uppercase">3日後復習</span>
                <div className="mt-2 flex items-baseline space-x-1">
                  <span className="text-2xl font-black text-amber-700">{review3dCount}</span>
                  <span className="text-xs text-amber-600/80">問</span>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                <span className="text-[11px] font-bold text-emerald-600 uppercase">覚えている</span>
                <div className="mt-2 flex items-baseline space-x-1">
                  <span className="text-2xl font-black text-emerald-700">{rememberedCount}</span>
                  <span className="text-xs text-emerald-600/80">問 (7日後)</span>
                </div>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleBackToHome}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition shadow-sm"
              >
                <Home className="h-4 w-4" />
                <span>ホームに戻る</span>
              </button>
              {unseenAvailable > 0 && (
                <button
                  type="button"
                  onClick={handleContinueUnseen}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-7 py-3.5 text-sm font-bold text-white shadow-md shadow-teal-600/20 hover:from-teal-500 hover:to-emerald-500 transition"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>続けて未学習15問を解く</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
