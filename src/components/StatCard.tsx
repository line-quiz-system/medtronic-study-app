'use client';

import React from 'react';
import { LucideIcon, ChevronRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  colorTheme: 'brand' | 'cardiac' | 'amber' | 'emerald' | 'indigo';
  onClick?: () => void;
  actionHint?: string;
}

const THEME_STYLES = {
  brand: {
    bg: 'bg-teal-50 dark:bg-teal-950/30',
    border: 'border-teal-200/80 dark:border-teal-800/50',
    iconBg: 'bg-teal-500 text-white',
    text: 'text-teal-900 dark:text-teal-100',
    subtext: 'text-teal-600 dark:text-teal-400',
    hoverBorder: 'hover:border-teal-400 dark:hover:border-teal-600',
  },
  cardiac: {
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    border: 'border-rose-200/80 dark:border-rose-800/50',
    iconBg: 'bg-rose-500 text-white',
    text: 'text-rose-900 dark:text-rose-100',
    subtext: 'text-rose-600 dark:text-rose-400',
    hoverBorder: 'hover:border-rose-400 dark:hover:border-rose-600',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200/80 dark:border-amber-800/50',
    iconBg: 'bg-amber-500 text-white',
    text: 'text-amber-900 dark:text-amber-100',
    subtext: 'text-amber-600 dark:text-amber-400',
    hoverBorder: 'hover:border-amber-400 dark:hover:border-amber-600',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200/80 dark:border-emerald-800/50',
    iconBg: 'bg-emerald-500 text-white',
    text: 'text-emerald-900 dark:text-emerald-100',
    subtext: 'text-emerald-600 dark:text-emerald-400',
    hoverBorder: 'hover:border-emerald-400 dark:hover:border-emerald-600',
  },
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    border: 'border-indigo-200/80 dark:border-indigo-800/50',
    iconBg: 'bg-indigo-500 text-white',
    text: 'text-indigo-900 dark:text-indigo-100',
    subtext: 'text-indigo-600 dark:text-indigo-400',
    hoverBorder: 'hover:border-indigo-400 dark:hover:border-indigo-600',
  },
};

export function StatCard({ title, value, subtitle, icon: Icon, colorTheme, onClick, actionHint }: StatCardProps) {
  const theme = THEME_STYLES[colorTheme];

  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl p-4 sm:p-5 border transition-all ${theme.bg} ${theme.border} ${
        onClick
          ? `cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-xs ${theme.hoverBorder} group`
          : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {title}
            </span>
            {onClick && (
              <ChevronRight className="w-3 h-3 text-slate-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            )}
          </div>
          <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums ${theme.text}`}>
            {value}
          </div>
          {subtitle && (
            <div className={`text-xs font-medium ${theme.subtext}`}>
              {subtitle}
            </div>
          )}
        </div>

        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs ${theme.iconBg} ${onClick ? 'group-hover:scale-105 transition-transform' : ''}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {actionHint && (
        <div className="mt-2 pt-2 border-t border-slate-200/40 dark:border-slate-800/40 flex items-center justify-between text-[10px] text-slate-400 font-medium">
          <span>{actionHint}</span>
          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </div>
      )}
    </div>
  );
}
