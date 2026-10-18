/**
 * Cloudflare D1 REST API ヘルパー
 * Vercel上のNext.js Server側からD1へ直接クエリを実行する
 */

const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID!;
const CF_D1_DATABASE_ID = process.env.CF_D1_DATABASE_ID!;
const CF_D1_API_TOKEN = process.env.CF_D1_API_TOKEN!;

const D1_REST_URL = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/database/${CF_D1_DATABASE_ID}/query`;

interface D1QueryResult<T = Record<string, unknown>> {
  result: Array<{
    results: T[];
    success: boolean;
    meta: Record<string, unknown>;
  }>;
  success: boolean;
  errors: Array<{ message: string }>;
}

/**
 * D1 REST APIへクエリを送信する汎用関数
 */
export async function d1Query<T = Record<string, unknown>>(
  sql: string,
  params: (string | number | null | boolean)[] = []
): Promise<T[]> {
  if (!CF_ACCOUNT_ID || !CF_D1_DATABASE_ID || !CF_D1_API_TOKEN) {
    throw new Error('Cloudflare D1の環境変数が設定されていません');
  }

  const response = await fetch(D1_REST_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${CF_D1_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql, params }),
    // Vercel Edge/Node.js 環境でのfetchタイムアウト対策
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`D1 APIエラー (${response.status}): ${text}`);
  }

  const data: D1QueryResult<T> = await response.json();

  if (!data.success || data.errors?.length > 0) {
    throw new Error(`D1クエリエラー: ${data.errors?.map(e => e.message).join(', ')}`);
  }

  return data.result?.[0]?.results ?? [];
}
