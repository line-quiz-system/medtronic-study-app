import { NextRequest, NextResponse } from 'next/server';
import { d1Query } from '@/lib/cf-d1';
import { UserProgress } from '@/types';

/**
 * リクエストのAPIシークレット認証
 */
function validateSecret(request: NextRequest): boolean {
  const secret = request.headers.get('x-app-secret');
  return secret === process.env.APP_API_SECRET;
}

/**
 * GET /api/progress
 * 全問題の学習進捗を取得する
 */
export async function GET(request: NextRequest) {
  if (!validateSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rows = await d1Query<{
      question_id: string;
      status: string;
      next_review_date: string;
      correct_count: number;
      incorrect_count: number;
      last_reviewed_at: string | null;
      updated_at: string;
    }>('SELECT * FROM user_progress');

    const progressMap: Record<string, UserProgress> = {};
    rows.forEach((row) => {
      progressMap[row.question_id] = {
        question_id: row.question_id,
        status: row.status as UserProgress['status'],
        next_review_date: row.next_review_date,
        correct_count: row.correct_count,
        incorrect_count: row.incorrect_count,
        last_reviewed_at: row.last_reviewed_at,
        updated_at: row.updated_at,
      };
    });

    return NextResponse.json({ progressMap });
  } catch (err) {
    console.warn('[GET /api/progress] D1 offline/fallback:', err);
    return NextResponse.json({ progressMap: {} });
  }
}


/**
 * POST /api/progress
 * 1問分の学習進捗をupsertする（楽観的UIのバックグラウンド保存）
 */
export async function POST(request: NextRequest) {
  if (!validateSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: UserProgress = await request.json();
    const {
      question_id,
      status,
      next_review_date,
      correct_count,
      incorrect_count,
      last_reviewed_at,
      updated_at,
    } = body;

    await d1Query(
      `INSERT INTO user_progress
        (question_id, status, next_review_date, correct_count, incorrect_count, last_reviewed_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(question_id) DO UPDATE SET
         status = excluded.status,
         next_review_date = excluded.next_review_date,
         correct_count = excluded.correct_count,
         incorrect_count = excluded.incorrect_count,
         last_reviewed_at = excluded.last_reviewed_at,
         updated_at = excluded.updated_at`,
      [
        question_id,
        status,
        next_review_date,
        correct_count,
        incorrect_count,
        last_reviewed_at ?? null,
        updated_at,
      ]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[POST /api/progress]', err);
    return NextResponse.json({ error: 'D1 upsert失敗' }, { status: 500 });
  }
}
