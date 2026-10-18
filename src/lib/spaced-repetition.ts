import { StudyStatus, AnswerRating, UserProgress, ReviewCalculationResult, Question, StudyCard, StudyQuota } from '@/types';

/**
 * 日付に指定日数を加算し、0時0分0秒（暦日の開始）を期日として返す関数
 * 解答時刻に関わらず、指定日数後の00:00:00を次回出題可能時刻として設定する
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setDate(result.getDate() + days);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * 次回復習日時を計算する（ISO文字列形式）
 */
export function calculateNextReviewDate(days: number, fromDate: Date = new Date()): string {
  return addDays(fromDate, days).toISOString();
}

/**
 * 解答結果（評価区分または正解/不正解）と現在のステータスから、次回ステータスと復習日を算出
 *
 * 状態遷移ルール:
 * 1. 覚えている (remembered / true):
 *    - 1週間後（7日後）: wait_7
 * 2. 3日後に復習 (review_3d):
 *    - 3日後: loop_3
 * 3. 忘れていた (forgot / false):
 *    - 翌日復習 (1日後): loop_1
 */
export function calculateNextReview(
  currentStatus: StudyStatus,
  rating: AnswerRating | boolean,
  baseDate: Date = new Date()
): ReviewCalculationResult {
  // 3日後に復習
  if (rating === 'review_3d') {
    return {
      nextStatus: 'loop_3',
      nextReviewDate: addDays(baseDate, 3),
      daysAdded: 3,
      explanation: '3日後に再出題します。',
    };
  }

  // 覚えている (正解): 常に1週間後（7日後）
  if (rating === true || rating === 'remembered') {
    return {
      nextStatus: 'wait_7',
      nextReviewDate: addDays(baseDate, 7),
      daysAdded: 7,
      explanation: '正解のため、1週間後（7日後）に再出題します。',
    };
  }

  // 忘れていた (不正解): 翌日復習 (1日後)
  if (rating === 'forgot') {
    return {
      nextStatus: 'loop_1',
      nextReviewDate: addDays(baseDate, 1),
      daysAdded: 1,
      explanation: '不正解のため、翌日（1日後）に復習します。',
    };
  }

  // boolean false（旧互換用ループ）
  if (currentStatus === 'loop_1') {
    return {
      nextStatus: 'loop_2',
      nextReviewDate: addDays(baseDate, 2),
      daysAdded: 2,
      explanation: '復習で不正解のため、2日後に再出題します。',
    };
  }

  if (currentStatus === 'loop_2') {
    return {
      nextStatus: 'loop_3',
      nextReviewDate: addDays(baseDate, 3),
      daysAdded: 3,
      explanation: '復習で不正解のため、3日後に再出題します。',
    };
  }

  if (currentStatus === 'loop_3') {
    return {
      nextStatus: 'loop_1',
      nextReviewDate: addDays(baseDate, 1),
      daysAdded: 1,
      explanation: '復習で不正解のため、再度翌日（1日後）から復習します。',
    };
  }

  return {
    nextStatus: 'loop_1',
    nextReviewDate: addDays(baseDate, 1),
    daysAdded: 1,
    explanation: '不正解のため、翌日（1日後）に復習します。',
  };
}

/**
 * 忘却曲線・間隔反復ステータス遷移ロジック（UserProgress生成）
 */
export function calculateNextProgress(
  currentProgress: UserProgress | null | undefined,
  rating: AnswerRating | boolean,
  now: Date = new Date()
): UserProgress {
  const currentStatus: StudyStatus = currentProgress?.status ?? 'unseen';
  const currentCorrect = currentProgress?.correct_count ?? 0;
  const currentIncorrect = currentProgress?.incorrect_count ?? 0;
  const currentReviewCount = currentProgress?.review_count ?? (currentCorrect + currentIncorrect);
  const questionId = currentProgress?.question_id ?? '';

  const reviewResult = calculateNextReview(currentStatus, rating, now);
  const isCorrect = rating === true || rating === 'remembered';

  return {
    question_id: questionId,
    status: reviewResult.nextStatus,
    next_review_date: reviewResult.nextReviewDate.toISOString(),
    review_count: currentReviewCount + 1,
    correct_count: isCorrect ? currentCorrect + 1 : currentCorrect,
    incorrect_count: !isCorrect ? currentIncorrect + 1 : currentIncorrect,
    last_reviewed_at: now.toISOString(),
    updated_at: now.toISOString(),
  };
}

/**
 * カードが未出題（unseen または new）であるかの判定
 */
export function isCardUnseen(progress: UserProgress | null | undefined): boolean {
  if (!progress) return true;
  return progress.status === 'unseen' || progress.status === 'new';
}

/**
 * 復習期日到来カードであるかの判定
 * ルール: 未出題（unseen / new）以外で、次回出題日時 <= 現在日時
 */
export function isDueForReview(progress: UserProgress | null | undefined, now: Date = new Date()): boolean {
  if (!progress) return false;
  if (progress.status === 'unseen' || progress.status === 'new') {
    return false;
  }
  if (!progress.next_review_date) return false;
  const nextReview = new Date(progress.next_review_date);
  return nextReview.getTime() <= now.getTime();
}

/**
 * 未登録問題用のデフォルトUserProgressを生成
 */
export function createDefaultProgress(questionId: string, now: Date = new Date()): UserProgress {
  return {
    question_id: questionId,
    status: 'unseen',
    correct_count: 0,
    incorrect_count: 0,
    review_count: 0,
    next_review_date: new Date(0).toISOString(),
    last_reviewed_at: null,
    updated_at: now.toISOString(),
  };
}

/**
 * デフォルトのFisher-Yatesシャッフル関数
 */
export function defaultShuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

export interface SelectSessionOptions {
  categories?: string[];
  now?: Date;
  shuffleFn?: <T>(items: T[]) => T[];
}

/**
 * 本日復習対象カード（期日到来カード）のみを抽出してシャッフル
 */
export function selectReviewCards(
  questions: Question[],
  progressMap: Record<string, UserProgress>,
  options?: SelectSessionOptions
): StudyCard[] {
  const categories = options?.categories;
  const now = options?.now ?? new Date();
  const shuffle = options?.shuffleFn ?? defaultShuffle;

  let targetQuestions = questions ?? [];
  if (categories && categories.length > 0) {
    targetQuestions = targetQuestions.filter((q) => categories.includes(q.category));
  }

  const dueCards: StudyCard[] = [];
  for (const q of targetQuestions) {
    if (!q) continue;
    const progress = progressMap[q.id];
    if (isDueForReview(progress, now)) {
      dueCards.push({ question: q, progress: progress! });
    }
  }

  return shuffle(dueCards);
}

/**
 * 未学習カードのみを抽出してシャッフル
 */
export function selectUnseenCards(
  questions: Question[],
  progressMap: Record<string, UserProgress>,
  options?: SelectSessionOptions
): StudyCard[] {
  const categories = options?.categories;
  const now = options?.now ?? new Date();
  const shuffle = options?.shuffleFn ?? defaultShuffle;

  let targetQuestions = questions ?? [];
  if (categories && categories.length > 0) {
    targetQuestions = targetQuestions.filter((q) => categories.includes(q.category));
  }

  const unseenCards: StudyCard[] = [];
  for (const q of targetQuestions) {
    if (!q) continue;
    const progress = progressMap[q.id];
    if (!progress || isCardUnseen(progress)) {
      const p = progress || createDefaultProgress(q.id, now);
      unseenCards.push({ question: q, progress: p });
    }
  }

  return shuffle(unseenCards);
}

/**
 * 互換性のためのカード選定関数
 */
export function selectSessionCards(
  questions: Question[],
  progressMap: Record<string, UserProgress>,
  quota: StudyQuota = 'all',
  options?: SelectSessionOptions
): StudyCard[] {
  const due = selectReviewCards(questions, progressMap, options);
  const unseen = selectUnseenCards(questions, progressMap, options);

  const combined = [...due, ...unseen];
  if (quota === 'all') return combined;
  return combined.slice(0, quota);
}

/**
 * ステータスの表示用メタデータ取得
 */
export function getStatusBadgeInfo(status: StudyStatus): {
  label: string;
  shortLabel: string;
  description: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
} {
  switch (status) {
    case 'unseen':
    case 'new':
      return {
        label: '未学習',
        shortLabel: '未学習',
        description: 'まだ一度も学習していない問題です',
        bgClass: 'bg-slate-100',
        textClass: 'text-slate-700',
        borderClass: 'border-slate-300',
      };
    case 'loop_1':
      return {
        label: '翌日復習 (1日後)',
        shortLabel: '1日後',
        description: '不正解後の復習（明日）',
        bgClass: 'bg-rose-50',
        textClass: 'text-rose-700',
        borderClass: 'border-rose-200',
      };
    case 'loop_2':
      return {
        label: '2日後復習',
        shortLabel: '2日後',
        description: '復習で不正解（2日後）',
        bgClass: 'bg-amber-50',
        textClass: 'text-amber-700',
        borderClass: 'border-amber-200',
      };
    case 'loop_3':
      return {
        label: '3日後復習',
        shortLabel: '3日後',
        description: '復習で不正解（3日後）',
        bgClass: 'bg-amber-50',
        textClass: 'text-amber-700',
        borderClass: 'border-amber-200',
      };
    case 'loop_7':
    case 'loop_14':
      return {
        label: '復習待機',
        shortLabel: '復習',
        description: '復習待機中の問題です',
        bgClass: 'bg-rose-50',
        textClass: 'text-rose-700',
        borderClass: 'border-rose-200',
      };
    case 'wait_7':
      return {
        label: '7日後待機 (定着中)',
        shortLabel: '7日後',
        description: '正解後の定期復習（7日後）',
        bgClass: 'bg-teal-50',
        textClass: 'text-teal-700',
        borderClass: 'border-teal-200',
      };
    case 'mastered':
      return {
        label: '習得済み',
        shortLabel: '習得済み',
        description: '長期記憶に定着した問題です',
        bgClass: 'bg-emerald-50',
        textClass: 'text-emerald-700',
        borderClass: 'border-emerald-200',
      };
  }
}
