'use client';

import React, { useState } from 'react';
import { useStudyStore } from '@/store/useStudyStore';
import {
  Download,
  Upload,
  RotateCcw,
  Database,
  Info,
  AlertTriangle,
  FileJson,
} from 'lucide-react';

export default function SettingsPage() {
  const {
    questions,
    progressMap,
    resetAllProgress,
    importCustomQuestions,
    importFullBackup,
  } = useStudyStore();

  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleExport = () => {
    const data = {
      exportDate: new Date().toISOString(),
      appVersion: '1.0.0',
      questions,
      progressMap,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ce_recall_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    try {
      setImportStatus(null);
      const parsed = JSON.parse(importJsonText);

      if (parsed.questions || parsed.progressMap) {
        const success = importFullBackup(parsed);
        if (success) {
          setImportStatus('バックアップデータを正常に復元しました。');
          setImportJsonText('');
          return;
        }
      }

      if (Array.isArray(parsed)) {
        importCustomQuestions(parsed);
        setImportStatus(`${parsed.length} 問の追加問題を取り込みました。`);
        setImportJsonText('');
        return;
      }

      setImportStatus('エラー: 対応していないJSONフォーマットです。');
    } catch {
      setImportStatus('エラー: 有効なJSON文字列を入力してください。');
    }
  };

  const handleReset = () => {
    resetAllProgress();
    setShowResetConfirm(false);
    alert('すべての学習進捗をリセットしました。');
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6 bg-white">
      {/* ページタイトル */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          設定・データ管理
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          学習データのバックアップ、追加問題の取り込み、システム設定を行えます。
        </p>
      </div>

      {/* 忘却曲線アルゴリズムの仕様カード */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-teal-700 font-bold text-sm">
          <Info className="w-4 h-4" />
          <span>搭載されている間隔反復（Spaced Repetition）ルール</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-emerald-700 block">自己評価と復習間隔</span>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>覚えている → 7日後復習 (Wait 7d)</li>
              <li>やや曖昧 → 3日後復習 (Loop 3d)</li>
              <li>忘れていた → 明日復習 (Loop 1d)</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-teal-700 block">記憶の定着フロー</span>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>期日が到来した問題が復習セッションに出題</li>
              <li>7日後待機での正解で長期定着</li>
              <li>復習間隔に合わせて自動で次回出題日を設定</li>
            </ul>
          </div>
        </div>
      </div>

      {/* データのエクスポート・バックアップ */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
          <Database className="w-4 h-4 text-teal-600" />
          <span>データバックアップ & 復元</span>
        </div>

        <p className="text-xs text-slate-500">
          現在の学習進捗や登録問題をJSON形式で保存したり、別の端末へ引き継ぐことができます。
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>JSONバックアップをダウンロード</span>
          </button>
        </div>
      </div>

      {/* 問題・データのJSONインポート */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
          <FileJson className="w-4 h-4 text-teal-600" />
          <span>問題・データの取り込み (JSON Import)</span>
        </div>

        <p className="text-xs text-slate-500">
          生成した問題JSON配列、または以前エクスポートしたバックアップJSONを貼り付けて取り込みます。
        </p>

        <textarea
          rows={4}
          placeholder='[{"category":"基礎","subcategory":"血流","question":"...","answer":"...","difficulty":1}]'
          value={importJsonText}
          onChange={(e) => setImportJsonText(e.target.value)}
          className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
        />

        {importStatus && (
          <div className={`p-3 rounded-xl text-xs font-medium ${
            importStatus.startsWith('エラー')
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}>
            {importStatus}
          </div>
        )}

        <button
          onClick={handleImport}
          disabled={!importJsonText.trim()}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm active:scale-95 transition-all"
        >
          <Upload className="w-4 h-4" />
          <span>JSONを取り込む</span>
        </button>
      </div>

      {/* 危険ゾーン：進捗全リセット */}
      <div className="bg-rose-50/50 rounded-3xl p-5 sm:p-6 border border-rose-200 space-y-3">
        <div className="flex items-center gap-2 font-bold text-sm text-rose-700">
          <AlertTriangle className="w-4 h-4" />
          <span>学習進捗の初期化</span>
        </div>

        <p className="text-xs text-rose-600">
          すべての学習履歴とマスター認定ステータスを初期状態に戻します。（問題データ自体は保持されます）
        </p>

        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 px-3 py-2 rounded-xl border border-rose-200 bg-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>全進捗をリセットする</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
            >
              本当にリセットする
            </button>
            <button
              onClick={() => setShowResetConfirm(false)}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-2"
            >
              キャンセル
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
