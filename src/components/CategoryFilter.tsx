'use client';

import React from 'react';
import { useStudyStore } from '@/store/useStudyStore';
import { Check } from 'lucide-react';

export function CategoryFilter() {
  const { questions, selectedCategories, toggleCategory, setSelectedCategories } = useStudyStore();

  // 重複なしのカテゴリ一覧
  const categories = Array.from(new Set(questions.map((q) => q.category)));

  const isAllSelected = selectedCategories.length === 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          出題カテゴリ
        </label>
        <button
          onClick={() => setSelectedCategories([])}
          className={`text-xs font-semibold px-2 py-0.5 rounded transition-colors ${
            isAllSelected
              ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          すべて選択
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const isSelected = selectedCategories.includes(cat);
          const count = questions.filter((q) => q.category === cat).length;

          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                isSelected
                  ? 'bg-brand-500 text-white border-brand-500 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-600'
              }`}
            >
              {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
              <span>{cat}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isSelected ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
