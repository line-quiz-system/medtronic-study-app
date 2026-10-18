'use client';

import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  correctCount?: number;
  incorrectCount?: number;
}

export function ProgressBar({ current, total, correctCount = 0, incorrectCount = 0 }: ProgressBarProps) {
  const percentage = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  const correctPct = total > 0 ? (correctCount / total) * 100 : 0;
  const incorrectPct = total > 0 ? (incorrectCount / total) * 100 : 0;

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
        <span>進捗 {current} / {total} 問</span>
        <span className="tabular-nums">{percentage}%</span>
      </div>

      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
        <div
          style={{ width: `${correctPct}%` }}
          className="h-full bg-emerald-500 transition-all duration-300 ease-out"
          title={`正解: ${correctCount}`}
        />
        <div
          style={{ width: `${incorrectPct}%` }}
          className="h-full bg-rose-500 transition-all duration-300 ease-out"
          title={`不正解: ${incorrectCount}`}
        />
      </div>
    </div>
  );
}
