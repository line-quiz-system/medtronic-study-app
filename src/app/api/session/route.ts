import { NextRequest, NextResponse } from 'next/server';
import { d1Query } from '@/lib/cf-d1';
import { ActiveSessionData } from '@/types';

function validateSecret(request: NextRequest): boolean {
  const secret = request.headers.get('x-app-secret');
  return secret === process.env.APP_API_SECRET;
}

/**
 * GET /api/session
 * 進行中の中断セッションを取得する（端末間同期用）
 */
export async function GET(request: NextRequest) {
  if (!validateSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rows = await d1Query<{ session_data: string | null; updated_at: string }>(
      'SELECT session_data, updated_at FROM active_session WHERE id = 1'
    );

    if (!rows.length || !rows[0].session_data) {
      return NextResponse.json({ activeSession: null });
    }

    const activeSession: ActiveSessionData = JSON.parse(rows[0].session_data);
    return NextResponse.json({ activeSession });
  } catch (err) {
    console.warn('[GET /api/session] D1 offline/fallback:', err);
    return NextResponse.json({ activeSession: null });
  }
}

/**
 * POST /api/session
 * 進行中セッションを更新する（nullでクリア）
 */
export async function POST(request: NextRequest) {
  if (!validateSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: { activeSession: ActiveSessionData | null } = await request.json();
    const sessionJson = body.activeSession ? JSON.stringify(body.activeSession) : null;
    const now = new Date().toISOString();

    await d1Query(
      `INSERT INTO active_session (id, session_data, updated_at)
       VALUES (1, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         session_data = excluded.session_data,
         updated_at = excluded.updated_at`,
      [sessionJson, now]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.warn('[POST /api/session] D1 offline/fallback:', err);
    return NextResponse.json({ ok: true });
  }
}

