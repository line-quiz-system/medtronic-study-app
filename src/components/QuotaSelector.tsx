'use client';

import React from 'react';
import { useStudyStore } from '@/store/useStudyStore';
import { StudyQuota } from '@/types';

const QUOTAS: { label: string; value: StudyQuota }[] = [
  { label: '5問', value: 5 },
  { label: '10問', value: 10 },
  { label: '20問', value: 20 },
  { label: '50問', value: 50 },
  { label: '100問', value: 100 },
  { label: '全問', value: 'all' },
];

export function QuotaSelector() {
  const { selectedQuota, setSelectedQuota } = useStudyStore();

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
        1回の学習ノルマ
      </label>

      <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
        {QUOTAS.map((q) => {
          const isSelected = selectedQuota === q.value;

          return (
            <button
              key={String(q.value)}
              onClick={() => setSelectedQuota(q.value)}
              className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-brand-500 dark:text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              {q.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
