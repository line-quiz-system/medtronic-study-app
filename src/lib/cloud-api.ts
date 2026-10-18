/**
 * クライアントサイドからNext.js API Routes経由でD1へアクセスするヘルパー
 * ブラウザ側のJSから呼び出す（API Secretはヘッダーに含める）
 */

import { UserProgress, ActiveSessionData } from '@/types';

const APP_API_SECRET = process.env.NEXT_PUBLIC_APP_API_SECRET ?? '';

function buildHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-app-secret': APP_API_SECRET,
  };
}

function isConfigured(): boolean {
  return !!APP_API_SECRET;
}

/**
 * 全進捗データをD1から取得（アプリ起動時の同期用）
 */
export async function fetchProgressFromCloud(): Promise<Record<string, UserProgress> | null> {
  if (!isConfigured()) return null;

  try {
    const res = await fetch('/api/progress', {
      headers: buildHeaders(),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.progressMap ?? null;
  } catch {
    return null;
  }
}

/**
 * 1問分の進捗をバックグラウンドでD1へ保存（fire-and-forget）
 */
export async function saveProgressToCloud(progress: UserProgress): Promise<void> {
  if (!isConfigured()) return;

  try {
    await fetch('/api/progress', {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(progress),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    // オフライン・エラー時はローカルストレージで保護されているため安全
  }
}

/**
 * 中断セッションをD1から取得（端末間再開用）
 */
export async function fetchSessionFromCloud(): Promise<ActiveSessionData | null> {
  if (!isConfigured()) return null;

  try {
    const res = await fetch('/api/session', {
      headers: buildHeaders(),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.activeSession ?? null;
  } catch {
    return null;
  }
}

/**
 * 中断セッションをD1へ保存（nullでクリア）
 */
export async function saveSessionToCloud(session: ActiveSessionData | null): Promise<void> {
  if (!isConfigured()) return;

  try {
    await fetch('/api/session', {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({ activeSession: session }),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    // オフライン・エラー時はローカルストレージで保護
  }
}
