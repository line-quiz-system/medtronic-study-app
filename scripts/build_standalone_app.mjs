import fs from "fs";
import path from "path";

const QUESTIONS_JSON_PATH = path.resolve(process.cwd(), "output/medtronic_questions.json");
const OUTPUT_HTML_ROOT = path.resolve(process.cwd(), "index.html");
const OUTPUT_HTML_GAS = path.resolve(process.cwd(), "gas_app/index.html");

const rawQuestions = JSON.parse(fs.readFileSync(QUESTIONS_JSON_PATH, "utf-8"));
console.log(`ロード完了: ${rawQuestions.length}問`);

const questionsJsonString = JSON.stringify(rawQuestions);

const htmlTemplate = `<!DOCTYPE html>
<html lang="ja" class="h-full">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="theme-color" content="#004B87">
  <meta name="description" content="Medtronic Academy High Power 学習アプリ - CRT / ICD アクティブリコール問題集">
  <title>Medtronic Academy High Power | アクティブリコール学習アプリ</title>
  <link rel="manifest" href="./manifest.json">
  <link rel="apple-touch-icon" href="./icon-192.png">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            mdt: {
              primary: '#004B87',     // Medtronic Core Navy Blue
              dark: '#002554',        // Deep Brand Blue
              light: '#00A3E0',       // Accent Cyan Blue
              surface: '#F4F7FB',     // Clean Light Blue-Gray background
              card: '#FFFFFF',        // Pure White card
              border: '#D0DCE8',      // Elegant boundary
              text: '#0F1E36',        // Deep Slate text
              muted: '#52667A'        // Secondary text
            }
          }
        }
      }
    }
  </script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js"></script>
  <style>
    :root {
      --safe-bottom: max(env(safe-area-inset-bottom, 0px), 12px);
    }
    body {
      background-color: #F4F7FB;
      color: #0F1E36;
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
      user-select: none;
      overflow-x: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    .dark body {
      background-color: #001733;
      color: #E2E8F0;
    }
    .safe-bottom {
      padding-bottom: var(--safe-bottom);
    }
    @keyframes ecgSweep {
      0% { stroke-dashoffset: 1000; opacity: 0.95; }
      75% { stroke-dashoffset: 0; opacity: 1; }
      100% { stroke-dashoffset: -1000; opacity: 0.2; }
    }
    .animate-ecg-trace {
      stroke-dasharray: 1000;
      stroke-dashoffset: 1000;
      animation: ecgSweep 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    }
    /* 3Dカード反転トランジション */
    .perspective-1000 {
      perspective: 1000px;
    }
    .card-inner {
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      transform-style: preserve-3d;
    }
    .card-flipped {
      transform: rotateY(180deg);
    }
  </style>
</head>
<body class="min-h-full flex flex-col antialiased">

  <!-- 心電図・モニター風ローディングオーバーレイ -->
  <div id="ecg-loading-overlay" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-mdt-dark/95 px-4 backdrop-blur-md transition-opacity duration-300">
    <div class="w-full max-w-md rounded-3xl border border-blue-400/30 bg-[#001D44] p-5 sm:p-6 shadow-2xl space-y-4">
      <div class="flex items-center justify-between text-xs border-b border-blue-900/60 pb-3">
        <div class="flex items-center space-x-2">
          <span class="h-2.5 w-2.5 rounded-full bg-[#00A3E0] animate-ping"></span>
          <span class="font-mono font-bold text-[#00A3E0] tracking-wider">MEDTRONIC ACADEMY HIGH POWER</span>
        </div>
        <div class="flex items-center space-x-1 font-mono text-cyan-300">
          <span class="text-sm font-black">75</span>
          <span class="text-[10px] text-blue-200">BPM</span>
        </div>
      </div>
      <div class="relative h-28 w-full overflow-hidden rounded-2xl border border-blue-900/60 bg-[#001229]">
        <div class="absolute inset-0 opacity-20" style="background-image: linear-gradient(to right, #00A3E0 1px, transparent 1px), linear-gradient(to bottom, #00A3E0 1px, transparent 1px); background-size: 16px 16px;"></div>
        <svg viewBox="0 0 600 130" class="relative z-10 h-full w-full" preserveAspectRatio="none">
          <path d="M 0,75 L 35,75 C 42,75 46,62 54,62 C 62,62 66,75 73,75 L 90,75 L 96,86 L 106,18 L 116,108 L 123,75 L 142,75 C 152,75 158,52 170,52 C 182,52 188,75 198,75 L 235,75 C 242,75 246,62 254,62 C 262,62 266,75 273,75 L 290,75 L 296,86 L 306,16 L 316,108 L 323,75 L 342,75 C 352,75 358,52 370,52 C 382,52 388,75 398,75 L 435,75 C 442,75 446,62 454,62 C 462,62 466,75 473,75 L 490,75 L 496,86 L 506,18 L 516,108 L 523,75 L 542,75 C 552,75 558,52 570,52 C 582,52 588,75 600,75" fill="none" stroke="#003566" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M 0,75 L 35,75 C 42,75 46,62 54,62 C 62,62 66,75 73,75 L 90,75 L 96,86 L 106,18 L 116,108 L 123,75 L 142,75 C 152,75 158,52 170,52 C 182,52 188,75 198,75 L 235,75 C 242,75 246,62 254,62 C 262,62 266,75 273,75 L 290,75 L 296,86 L 306,16 L 316,108 L 323,75 L 342,75 C 352,75 358,52 370,52 C 382,52 388,75 398,75 L 435,75 C 442,75 446,62 454,62 C 462,62 466,75 473,75 L 490,75 L 496,86 L 506,18 L 516,108 L 523,75 L 542,75 C 552,75 558,52 570,52 C 582,52 588,75 600,75" pathLength="1000" fill="none" stroke="#00A3E0" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" class="animate-ecg-trace" />
        </svg>
      </div>
      <div class="text-center space-y-1">
        <p class="text-xs sm:text-sm font-bold text-white">Medtronic High Power 学習データを読込中...</p>
        <p class="text-[11px] font-mono text-cyan-300">CRT / ICD プログラミング & デバイス臨床工学</p>
      </div>
    </div>
  </div>

  <!-- 上部ヘッダー（Medtronic Blue & White） -->
  <header class="sticky top-0 z-40 border-b border-mdt-border/70 bg-white/95 dark:bg-[#001D44]/95 backdrop-blur-md transition-colors shadow-sm">
    <div class="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
      <div class="flex items-center space-x-2.5 cursor-pointer" onclick="switchTab('dashboard')">
        <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-mdt-primary text-white font-black shadow-md">
          <i data-lucide="activity" class="h-5 w-5"></i>
        </div>
        <div>
          <span class="text-sm font-bold text-mdt-primary dark:text-cyan-300 tracking-wide block leading-tight">Medtronic Academy</span>
          <span class="text-[10px] text-mdt-muted dark:text-blue-200 font-semibold">High Power (全239問)</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="toggleDarkMode()" class="h-8 w-8 rounded-lg border border-mdt-border dark:border-blue-800 bg-mdt-surface dark:bg-blue-950 flex items-center justify-center text-mdt-muted dark:text-cyan-300 transition">
          <i id="theme-icon" data-lucide="moon" class="h-4 w-4"></i>
        </button>
        <span class="hidden sm:inline-flex rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-mdt-primary dark:bg-blue-900/40 dark:text-cyan-300 dark:border-blue-800">
          スマホ・オフライン自動保存
        </span>
      </div>
    </div>
  </header>

  <!-- メインコンテンツ -->
  <main class="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 pb-28">

    <!-- 1. ダッシュボード -->
    <div id="tab-dashboard" class="space-y-6">

      <!-- 中断セッション再開バナー -->
      <div id="resume-banner" class="hidden rounded-2xl border border-blue-300 bg-gradient-to-r from-blue-50 to-white dark:from-[#002D5E] dark:to-[#001D44] dark:border-blue-700 p-4 shadow-md">
        <div class="flex items-center justify-between gap-3">
          <div>
            <div class="text-xs font-bold text-mdt-primary dark:text-cyan-300">前回の学習を再開できます</div>
            <div id="resume-subtext" class="text-[11px] text-mdt-muted dark:text-blue-200 mt-0.5"></div>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="discardSession()" class="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-sm">破棄</button>
            <button onclick="resumeSession()" class="rounded-xl bg-mdt-primary hover:bg-blue-700 px-3.5 py-1.5 text-xs font-bold text-white shadow">再開</button>
          </div>
        </div>
      </div>

      <!-- ヒーローセクション（Medtronic青と白の基調） -->
      <div class="relative overflow-hidden rounded-3xl border border-blue-200 dark:border-blue-900 bg-gradient-to-br from-white via-blue-50/40 to-blue-100/50 dark:from-[#002554] dark:via-[#001D44] dark:to-[#001229] p-5 sm:p-7 shadow-lg">
        <div class="inline-flex items-center space-x-1.5 rounded-full bg-blue-100 dark:bg-blue-900/60 px-3 py-1 text-[11px] font-bold text-mdt-primary dark:text-cyan-300 border border-blue-200 dark:border-blue-700 mb-2.5">
          <span>全19講義・239問 1問1答アクティブリコール</span>
        </div>
        <h1 class="text-xl sm:text-3xl font-extrabold text-mdt-text dark:text-white leading-tight">
          Medtronic Academy High Power
          <span class="block text-mdt-primary dark:text-cyan-300 mt-1">臨床工学・専門問題集</span>
        </h1>
        <p class="mt-2 text-xs sm:text-sm text-mdt-muted dark:text-blue-100 leading-relaxed max-w-2xl">
          CRT / ICD の電気生理学的原理・最適化アルゴリズム・リードトラブル・デバイスプログラミングを網羅。自力で論理的解説を想起するアクティブリコール訓練で、確実に知識を定着させます。
        </p>

        <!-- クイックアクションボタン -->
        <div class="mt-5 flex flex-wrap gap-2.5">
          <button onclick="quickStart()" class="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-mdt-primary hover:bg-blue-800 text-white px-5 py-3.5 text-sm font-bold shadow-md hover:shadow-lg active:scale-95 transition">
            <i data-lucide="play" class="h-4 w-4"></i>
            <span id="quick-start-label">今すぐ15問で学習開始</span>
          </button>
          <button onclick="openSelectModal('unseen', 'ALL')" class="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl border border-mdt-border dark:border-blue-800 bg-white dark:bg-blue-950/80 px-4 py-3.5 text-xs sm:text-sm font-bold text-mdt-text dark:text-white shadow-sm active:scale-95 transition">
            <i data-lucide="layers" class="h-4 w-4 text-mdt-primary dark:text-cyan-400"></i>
            <span>分野・教材を選んで開始</span>
          </button>
        </div>
      </div>

      <!-- 3枚集計カード（忘却曲線ステータス） -->
      <div class="grid grid-cols-3 gap-2.5 sm:gap-4">
        <div onclick="openSelectModal('due', 'ALL')" class="cursor-pointer rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-white dark:bg-[#00224A] p-3.5 sm:p-5 text-center sm:text-left shadow-sm hover:shadow active:scale-95 transition">
          <span class="text-[11px] font-bold text-rose-600 dark:text-rose-400 block">本日復習</span>
          <span id="stat-due" class="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mt-1 block">0</span>
          <span class="text-[10px] text-rose-500 dark:text-rose-300 mt-1 block font-medium">タップで復習</span>
        </div>
        <div onclick="openSelectModal('unseen', 'ALL')" class="cursor-pointer rounded-2xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-[#00224A] p-3.5 sm:p-5 text-center sm:text-left shadow-sm hover:shadow active:scale-95 transition">
          <span class="text-[11px] font-bold text-mdt-primary dark:text-cyan-400 block">未学習</span>
          <span id="stat-unseen" class="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mt-1 block">239</span>
          <span class="text-[10px] text-blue-500 dark:text-blue-300 mt-1 block font-medium">タップで開始</span>
        </div>
        <div class="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-white dark:bg-[#00224A] p-3.5 sm:p-5 text-center sm:text-left shadow-sm">
          <span class="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">本日解答数</span>
          <span id="stat-today" class="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mt-1 block">0</span>
          <span class="text-[10px] text-slate-400 dark:text-slate-400 mt-1 block font-medium">今日の達成</span>
        </div>
      </div>

      <!-- 分野別（CRT / ICD）および講義別進捗リスト -->
      <div class="rounded-3xl border border-mdt-border dark:border-blue-900 bg-white dark:bg-[#001D44] p-4 sm:p-6 shadow-sm space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-base font-bold text-mdt-text dark:text-white">講義教材別 習得進捗</h3>
            <p class="text-xs text-mdt-muted dark:text-blue-200">各教材をタップすると、未学習や復習問題を選択して開始できます</p>
          </div>
          <span id="total-progress-pill" class="rounded-full bg-blue-100 dark:bg-blue-900 text-mdt-primary dark:text-cyan-300 px-3 py-1 text-xs font-extrabold">0% 習得</span>
        </div>
        <div id="category-list" class="space-y-3"></div>
      </div>

    </div>

    <!-- 2. 学習セッション画面 -->
    <div id="tab-study" class="hidden space-y-4">
      <div id="study-active-area" class="space-y-4">

        <!-- 上部コントロール & プログレスバー -->
        <div class="rounded-2xl border border-mdt-border dark:border-blue-900 bg-white dark:bg-[#001D44] p-3.5 space-y-2.5 shadow-sm">
          <div class="flex items-center justify-between text-xs">
            <div class="flex items-center space-x-2">
              <span id="study-counter" class="font-bold text-mdt-primary dark:text-cyan-300">問題 1 / 15</span>
              <span id="study-mode-badge" class="rounded bg-blue-50 dark:bg-blue-900/60 px-2 py-0.5 text-[10px] font-bold text-mdt-primary dark:text-cyan-200"></span>
            </div>
            <button onclick="switchTab('dashboard')" class="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-sm active:scale-95 transition">
              中断して保存
            </button>
          </div>
          <div class="h-2 w-full rounded-full bg-slate-200 dark:bg-blue-950 overflow-hidden">
            <div id="study-bar" class="h-full bg-gradient-to-r from-mdt-primary to-cyan-500 transition-all duration-300" style="width: 0%"></div>
          </div>
        </div>

        <!-- アクティブリコール用フラッシュカード -->
        <div class="rounded-3xl border border-mdt-border dark:border-blue-900 bg-white dark:bg-[#00224A] shadow-xl overflow-hidden min-h-[420px] flex flex-col justify-between p-5 sm:p-8">
          
          <!-- 表面（問題） -->
          <div id="card-front" onclick="flipCard()" class="flex flex-col justify-between flex-1 cursor-pointer space-y-5">
            <div>
              <div class="flex flex-wrap items-center justify-between gap-1.5 border-b border-slate-200 dark:border-blue-900 pb-3">
                <div class="flex flex-wrap items-center gap-1.5">
                  <span id="card-cat" class="rounded-lg bg-blue-100 dark:bg-blue-900/60 px-2.5 py-1 text-xs font-bold text-mdt-primary dark:text-cyan-300 border border-blue-200 dark:border-blue-700"></span>
                  <span id="card-subcat" class="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] text-slate-700 dark:text-slate-300"></span>
                </div>
                <span id="card-stars" class="text-xs text-amber-500 font-bold">★★</span>
              </div>
              <div class="my-6">
                <span class="text-[11px] font-bold text-mdt-primary dark:text-cyan-400 block mb-1">【問題】</span>
                <h2 id="card-q" class="text-base sm:text-xl font-bold text-slate-800 dark:text-white leading-relaxed"></h2>
              </div>
              <div class="rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/40 p-4 text-xs text-slate-700 dark:text-blue-100 leading-relaxed">
                <div class="flex items-center space-x-1.5 font-bold text-mdt-primary dark:text-cyan-300 mb-1">
                  <i data-lucide="brain" class="h-4 w-4"></i>
                  <span>アクティブリコール（自力想起訓練）</span>
                </div>
                選択肢はありません。頭の中で解剖学的構造、電気生理学的メカニズム、具体的数値を思い出してからタップしてください。
              </div>
            </div>
            <button type="button" class="w-full rounded-2xl bg-mdt-primary hover:bg-blue-800 text-white py-3.5 text-sm font-bold shadow-md active:scale-95 transition flex items-center justify-center gap-2">
              <i data-lucide="eye" class="h-4 w-4"></i>
              <span>タップして解答・論理解説を表示</span>
            </button>
          </div>

          <!-- 裏面（解答・解説） -->
          <div id="card-back" class="hidden flex-col justify-between flex-1 space-y-4">
            <div class="space-y-3">
              <div class="flex items-center justify-between border-b border-slate-200 dark:border-blue-900 pb-2.5">
                <span class="rounded-lg bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                  解答・論理解説
                </span>
                <button onclick="flipCard()" class="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">問題に戻る</button>
              </div>

              <!-- 問題文の確認 -->
              <div class="rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5">
                <p id="card-q-back" class="text-xs font-bold text-slate-700 dark:text-slate-300"></p>
              </div>

              <!-- 解答・解説本文（150〜200文字の医学・工学的メカニズム） -->
              <div class="rounded-2xl bg-emerald-50/70 dark:bg-[#002B36] border border-emerald-200 dark:border-emerald-800/80 p-4 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-emerald-800 dark:text-emerald-400">正解のポイント・メカニズム解説</span>
                  <span id="card-ans-len" class="text-[10px] font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded"></span>
                </div>
                <p id="card-ans" class="text-sm sm:text-base leading-relaxed text-slate-900 dark:text-white font-medium whitespace-pre-wrap"></p>
                <div id="card-src" class="pt-2 border-t border-emerald-200 dark:border-emerald-800/50 text-[11px] text-slate-500 dark:text-slate-400"></div>
              </div>
            </div>

            <!-- 自己評価ボタン（SM-2忘却曲線アルゴリズム） -->
            <div class="pt-3 border-t border-slate-200 dark:border-blue-900">
              <div class="text-[11px] text-slate-600 dark:text-slate-300 font-bold mb-2">記憶の定着度を選択して次へ進む</div>
              <div class="grid grid-cols-3 gap-2">
                <button onclick="rateCard('forgot')" class="rounded-2xl border border-rose-300 dark:border-rose-900/80 bg-rose-50 dark:bg-rose-950/40 p-2.5 text-center active:scale-95 transition shadow-sm">
                  <span class="text-xs sm:text-sm font-extrabold text-rose-600 dark:text-rose-400 block">忘れていた</span>
                  <span class="text-[10px] text-rose-500 dark:text-rose-300">明日復習</span>
                </button>
                <button onclick="rateCard('review_3d')" class="rounded-2xl border border-amber-300 dark:border-amber-900/80 bg-amber-50 dark:bg-amber-950/40 p-2.5 text-center active:scale-95 transition shadow-sm">
                  <span class="text-xs sm:text-sm font-extrabold text-amber-600 dark:text-amber-400 block">やや曖昧</span>
                  <span class="text-[10px] text-amber-500 dark:text-amber-300">3日後復習</span>
                </button>
                <button onclick="rateCard('remembered')" class="rounded-2xl border border-emerald-300 dark:border-emerald-900/80 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 text-center active:scale-95 transition shadow-sm">
                  <span class="text-xs sm:text-sm font-extrabold text-emerald-700 dark:text-emerald-400 block">覚えている</span>
                  <span class="text-[10px] text-emerald-600 dark:text-emerald-300">7日後復習</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

      <!-- セッション完了画面 -->
      <div id="study-complete-area" class="hidden rounded-3xl border border-mdt-border dark:border-blue-900 bg-white dark:bg-[#001D44] p-6 sm:p-8 text-center space-y-6 shadow-xl">
        <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-mdt-primary text-white font-black text-2xl shadow-lg">
          ✓
        </div>
        <div>
          <h2 class="text-2xl font-extrabold text-slate-800 dark:text-white">学習セッション完了！</h2>
          <p class="text-xs sm:text-sm text-mdt-muted dark:text-blue-100 mt-1">自己評価に基づき、忘却曲線に従った次回出題スケジュールが自動保存されました。</p>
        </div>
        <div class="grid grid-cols-3 gap-2.5 text-left">
          <div class="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 p-3">
            <span class="text-[10px] font-bold text-rose-600 dark:text-rose-400">忘れていた</span>
            <div id="res-forgot" class="text-xl font-black text-rose-700 dark:text-rose-300 mt-1">0問</div>
          </div>
          <div class="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 p-3">
            <span class="text-[10px] font-bold text-amber-600 dark:text-amber-400">3日後復習</span>
            <div id="res-3d" class="text-xl font-black text-amber-700 dark:text-amber-300 mt-1">0問</div>
          </div>
          <div class="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30 p-3">
            <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">覚えている</span>
            <div id="res-rem" class="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-1">0問</div>
          </div>
        </div>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <button onclick="switchTab('dashboard')" class="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-6 py-3 text-sm font-bold text-slate-700 dark:text-slate-200">ホームに戻る</button>
          <button onclick="continueUnseen()" class="rounded-xl bg-mdt-primary hover:bg-blue-800 px-6 py-3 text-sm font-bold text-white shadow">続けて未学習15問を解く</button>
        </div>
      </div>
    </div>

    <!-- 3. 問題庫・検索タブ -->
    <div id="tab-questions" class="hidden space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-bold text-mdt-text dark:text-white">問題庫・検索一覧 (全239問)</h2>
          <p class="text-xs text-mdt-muted dark:text-blue-200">全問題を検索・絞り込み、個別にフラッシュカード学習が可能です</p>
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <input id="q-search" type="text" oninput="renderQuestionBank()" placeholder="キーワード検索（例: ATP, SVT, 0.035, PRロジック...）" class="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-mdt-border dark:border-slate-800 text-xs text-slate-800 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-mdt-primary" />
        <select id="q-cat-filter" onchange="renderQuestionBank()" class="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-mdt-border dark:border-slate-800 text-xs text-slate-800 dark:text-white shadow-sm"></select>
      </div>
      <div id="q-bank-list" class="space-y-2.5"></div>
    </div>

    <!-- 4. 統計・進捗分析タブ -->
    <div id="tab-stats" class="hidden space-y-5">
      <div>
        <h2 class="text-lg font-bold text-mdt-text dark:text-white">学習統計 & 定着分析</h2>
        <p class="text-xs text-mdt-muted dark:text-blue-200">あなたの記憶定着度と学習履歴の可視化</p>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="rounded-2xl border border-mdt-border dark:border-blue-900 bg-white dark:bg-[#00224A] p-4 text-center">
          <span class="text-[11px] font-bold text-mdt-muted dark:text-blue-200">総演習回数</span>
          <div id="stat-total-answers" class="text-2xl font-black text-mdt-primary dark:text-cyan-300 mt-1">0</div>
        </div>
        <div class="rounded-2xl border border-mdt-border dark:border-blue-900 bg-white dark:bg-[#00224A] p-4 text-center">
          <span class="text-[11px] font-bold text-mdt-muted dark:text-blue-200">定着済み (7日以上)</span>
          <div id="stat-mastered" class="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">0</div>
        </div>
        <div class="rounded-2xl border border-mdt-border dark:border-blue-900 bg-white dark:bg-[#00224A] p-4 text-center">
          <span class="text-[11px] font-bold text-mdt-muted dark:text-blue-200">復習待ち</span>
          <div id="stat-learning" class="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">0</div>
        </div>
        <div class="rounded-2xl border border-mdt-border dark:border-blue-900 bg-white dark:bg-[#00224A] p-4 text-center">
          <span class="text-[11px] font-bold text-mdt-muted dark:text-blue-200">未着手</span>
          <div id="stat-untouched" class="text-2xl font-black text-slate-500 dark:text-slate-400 mt-1">239</div>
        </div>
      </div>

      <!-- 分野別比較（CRT vs ICD） -->
      <div class="rounded-3xl border border-mdt-border dark:border-blue-900 bg-white dark:bg-[#001D44] p-5 space-y-4 shadow-sm">
        <h3 class="text-sm font-bold text-slate-800 dark:text-white">領域別マスター率</h3>
        <div class="space-y-3">
          <div>
            <div class="flex justify-between text-xs font-bold mb-1">
              <span class="text-mdt-primary dark:text-cyan-300">Medtronic CRT (全91問)</span>
              <span id="crt-rate" class="text-slate-700 dark:text-slate-300">0%</span>
            </div>
            <div class="h-2.5 w-full rounded-full bg-slate-100 dark:bg-blue-950 overflow-hidden">
              <div id="crt-bar" class="h-full bg-mdt-primary transition-all duration-300" style="width: 0%"></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between text-xs font-bold mb-1">
              <span class="text-mdt-primary dark:text-cyan-300">Medtronic ICD (全148問)</span>
              <span id="icd-rate" class="text-slate-700 dark:text-slate-300">0%</span>
            </div>
            <div class="h-2.5 w-full rounded-full bg-slate-100 dark:bg-blue-950 overflow-hidden">
              <div id="icd-bar" class="h-full bg-cyan-500 transition-all duration-300" style="width: 0%"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- データ管理 -->
      <div class="rounded-3xl border border-mdt-border dark:border-blue-900 bg-white dark:bg-[#001D44] p-5 space-y-3 shadow-sm">
        <h3 class="text-sm font-bold text-slate-800 dark:text-white">データ管理</h3>
        <p class="text-xs text-mdt-muted dark:text-blue-200">スマホ端末のブラウザ内に学習進捗が自動保存されます。他端末へのデータ移行も可能です。</p>
        <div class="flex flex-wrap gap-2 pt-1">
          <button onclick="exportData()" class="rounded-xl border border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 px-3.5 py-2 text-xs font-bold text-mdt-primary dark:text-cyan-300">データ書き出し (JSON)</button>
          <button onclick="document.getElementById('import-file').click()" class="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300">データ読み込み</button>
          <input type="file" id="import-file" onchange="importData(event)" class="hidden" accept=".json">
          <button onclick="resetData()" class="rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950 px-3.5 py-2 text-xs font-bold text-rose-600 dark:text-rose-400">進捗初期化</button>
        </div>
      </div>

    </div>

  </main>

  <!-- 問題選択モーダル -->
  <div id="select-modal" class="hidden fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 p-0 sm:p-4 backdrop-blur-sm">
    <div class="flex flex-col w-full max-w-2xl max-h-[88vh] rounded-t-3xl sm:rounded-3xl border border-mdt-border dark:border-blue-900 bg-white dark:bg-[#001D44] overflow-hidden shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-200 dark:border-blue-900 px-5 py-3.5">
        <div>
          <h3 id="modal-title" class="text-sm font-bold text-slate-800 dark:text-white">問題を選択</h3>
          <p id="modal-subtitle" class="text-[11px] text-mdt-muted dark:text-blue-200"></p>
        </div>
        <button onclick="closeSelectModal()" class="text-slate-400 hover:text-slate-700 dark:hover:text-white px-2 py-1 text-sm font-bold">✕</button>
      </div>
      <div class="border-b border-slate-200 dark:border-blue-900 bg-slate-50 dark:bg-[#001733] px-5 py-2.5 space-y-2">
        <select id="modal-cat-select" onchange="onModalCategoryChange()" class="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-mdt-border dark:border-slate-800 text-xs text-slate-800 dark:text-white"></select>
        <div class="flex flex-wrap gap-1.5 text-xs">
          <button onclick="modalSelectRandom(10)" class="rounded-lg bg-blue-100 dark:bg-blue-900/60 border border-blue-200 dark:border-blue-700 px-2.5 py-1 text-mdt-primary dark:text-cyan-300 font-bold">ランダム10問</button>
          <button onclick="modalSelectRandom(15)" class="rounded-lg bg-blue-100 dark:bg-blue-900/60 border border-blue-200 dark:border-blue-700 px-2.5 py-1 text-mdt-primary dark:text-cyan-300 font-bold">ランダム15問</button>
          <button onclick="modalSelectAll()" class="rounded-lg bg-slate-200 dark:bg-slate-800 px-2.5 py-1 text-slate-700 dark:text-slate-300">表示中を全選択</button>
          <button onclick="modalDeselectAll()" class="rounded-lg bg-slate-200 dark:bg-slate-800 px-2.5 py-1 text-slate-500 dark:text-slate-400">全解除</button>
        </div>
      </div>
      <div id="modal-list" class="flex-1 overflow-y-auto p-4 space-y-2 bg-white dark:bg-[#001D44]"></div>
      <div class="border-t border-slate-200 dark:border-blue-900 bg-slate-50 dark:bg-[#001D44] px-5 py-3.5 flex items-center justify-between safe-bottom">
        <span id="modal-selected-count" class="text-xs text-mdt-primary dark:text-cyan-300 font-bold">0問選択中</span>
        <button onclick="startModalSession()" class="rounded-xl bg-mdt-primary hover:bg-blue-800 px-5 py-2.5 text-xs font-bold text-white shadow">選択した問題で開始</button>
      </div>
    </div>
  </div>

  <!-- 下部固定タブナビゲーション（スマホ操作に最適化） -->
  <nav class="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#001229]/95 border-t border-mdt-border dark:border-blue-900 py-1.5 px-4 safe-bottom backdrop-blur-md shadow-lg">
    <div class="max-w-md mx-auto flex items-center justify-around text-xs">
      <button onclick="switchTab('dashboard')" id="nav-dashboard" class="flex flex-col items-center py-1 px-3 text-mdt-primary dark:text-cyan-300 font-bold transition">
        <i data-lucide="home" class="h-5 w-5 mb-0.5"></i>
        <span>ホーム</span>
      </button>
      <button onclick="quickStart()" id="nav-study" class="flex flex-col items-center py-1 px-3 text-slate-400 dark:text-slate-500 font-semibold transition">
        <i data-lucide="play-circle" class="h-5 w-5 mb-0.5"></i>
        <span>学習開始</span>
      </button>
      <button onclick="switchTab('questions')" id="nav-questions" class="flex flex-col items-center py-1 px-3 text-slate-400 dark:text-slate-500 font-semibold transition">
        <i data-lucide="book-open" class="h-5 w-5 mb-0.5"></i>
        <span>問題一覧</span>
      </button>
      <button onclick="switchTab('stats')" id="nav-stats" class="flex flex-col items-center py-1 px-3 text-slate-400 dark:text-slate-500 font-semibold transition">
        <i data-lucide="bar-chart-2" class="h-5 w-5 mb-0.5"></i>
        <span>統計</span>
      </button>
    </div>
  </nav>

  <!-- スクリプト部 -->
  <script>
    const QUESTIONS = ${questionsJsonString};

    // 学習管理データ構造（LocalStorage）
    const STORAGE_KEY = "mdt_highpower_progress_v1";
    const SESSION_KEY = "mdt_highpower_session_v1";

    let userProgress = {}; // { [qId]: { status: 'unseen'|'learning'|'mastered', nextDue: timestamp, intervalDays: num, lastAnswered: timestamp, history: [] } }
    let currentSession = null;
    let cardFlipped = false;

    function initData() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          userProgress = JSON.parse(saved);
        }
      } catch (e) {
        console.warn("Storage load failed", e);
      }
      checkResumeBanner();
      renderDashboard();
    }

    function saveProgress() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userProgress));
      } catch (e) {
        console.error("Storage save failed", e);
      }
    }

    function saveSessionState() {
      try {
        if (currentSession && currentSession.currentIndex < currentSession.questions.length) {
          localStorage.setItem(SESSION_KEY, JSON.stringify(currentSession));
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      } catch (e) {}
    }

    // テーマ切り替え
    function toggleDarkMode() {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('mdt_theme', isDark ? 'dark' : 'light');
      updateThemeIcon(isDark);
    }
    function updateThemeIcon(isDark) {
      const icon = document.getElementById('theme-icon');
      if (icon) {
        icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
        lucide.createIcons();
      }
    }
    if (localStorage.getItem('mdt_theme') === 'dark' || (!localStorage.getItem('mdt_theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }

    // タブ切り替え
    function switchTab(tabName) {
      document.getElementById('tab-dashboard').classList.add('hidden');
      document.getElementById('tab-study').classList.add('hidden');
      document.getElementById('tab-questions').classList.add('hidden');
      document.getElementById('tab-stats').classList.add('hidden');

      const tabs = ['dashboard', 'study', 'questions', 'stats'];
      tabs.forEach(t => {
        const nav = document.getElementById('nav-' + t);
        if (nav) {
          nav.className = "flex flex-col items-center py-1 px-3 text-slate-400 dark:text-slate-500 font-semibold transition";
        }
      });

      const activeTab = document.getElementById('tab-' + tabName);
      if (activeTab) activeTab.classList.remove('hidden');

      const activeNav = document.getElementById('nav-' + tabName);
      if (activeNav) {
        activeNav.className = "flex flex-col items-center py-1 px-3 text-mdt-primary dark:text-cyan-300 font-bold transition";
      }

      if (tabName === 'dashboard') {
        checkResumeBanner();
        renderDashboard();
      } else if (tabName === 'questions') {
        initQuestionBankFilter();
        renderQuestionBank();
      } else if (tabName === 'stats') {
        renderStats();
      }
      lucide.createIcons();
      window.scrollTo(0, 0);
    }

    // 中断セッション
    function checkResumeBanner() {
      const banner = document.getElementById('resume-banner');
      try {
        const savedSession = localStorage.getItem(SESSION_KEY);
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          if (parsed && parsed.currentIndex < parsed.questions.length) {
            banner.classList.remove('hidden');
            document.getElementById('resume-subtext').innerText =
              \`\${parsed.name || '前回の学習'}（\${parsed.currentIndex + 1} / \${parsed.questions.length} 問目から）\`;
            return;
          }
        }
      } catch (e) {}
      banner.classList.add('hidden');
    }

    function resumeSession() {
      try {
        const savedSession = localStorage.getItem(SESSION_KEY);
        if (savedSession) {
          currentSession = JSON.parse(savedSession);
          switchTab('study');
          loadCard();
          return;
        }
      } catch (e) {}
      quickStart();
    }

    function discardSession() {
      localStorage.removeItem(SESSION_KEY);
      currentSession = null;
      document.getElementById('resume-banner').classList.add('hidden');
    }

    // 統計計算
    function getStats() {
      const now = Date.now();
      let dueCount = 0;
      let unseenCount = 0;
      let todayAnswered = 0;
      let masteredCount = 0;
      let learningCount = 0;

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayMs = todayStart.getTime();

      QUESTIONS.forEach(q => {
        const p = userProgress[q.id];
        if (!p || p.status === 'unseen') {
          unseenCount++;
        } else {
          if (p.nextDue <= now) {
            dueCount++;
          }
          if (p.intervalDays >= 7) {
            masteredCount++;
          } else {
            learningCount++;
          }
          if (p.lastAnswered && p.lastAnswered >= todayMs) {
            todayAnswered++;
          }
        }
      });

      return { dueCount, unseenCount, todayAnswered, masteredCount, learningCount };
    }

    function renderDashboard() {
      const stats = getStats();
      document.getElementById('stat-due').innerText = stats.dueCount;
      document.getElementById('stat-unseen').innerText = stats.unseenCount;
      document.getElementById('stat-today').innerText = stats.todayAnswered;

      const learnedCount = QUESTIONS.length - stats.unseenCount;
      const rate = Math.round((learnedCount / QUESTIONS.length) * 100);
      document.getElementById('total-progress-pill').innerText = \`\${rate}% 習得 (\${learnedCount}/\${QUESTIONS.length})\`;

      const qLabel = document.getElementById('quick-start-label');
      if (stats.dueCount > 0) {
        qLabel.innerText = \`本日復習 \${stats.dueCount}問を開始\`;
      } else if (stats.unseenCount > 0) {
        qLabel.innerText = \`今すぐ未学習15問を開始\`;
      } else {
        qLabel.innerText = \`全問から15問シャッフル学習\`;
      }

      // カテゴリ別リストの描画
      const sourcesMap = {};
      QUESTIONS.forEach(q => {
        const cat = q.category;
        const src = q.source_title;
        if (!sourcesMap[cat]) sourcesMap[cat] = {};
        if (!sourcesMap[cat][src]) sourcesMap[cat][src] = { total: 0, learned: 0, due: 0 };
        sourcesMap[cat][src].total++;
        const p = userProgress[q.id];
        if (p && p.status !== 'unseen') {
          sourcesMap[cat][src].learned++;
          if (p.nextDue <= Date.now()) {
            sourcesMap[cat][src].due++;
          }
        }
      });

      const catListEl = document.getElementById('category-list');
      catListEl.innerHTML = '';

      Object.keys(sourcesMap).forEach(cat => {
        const catBox = document.createElement('div');
        catBox.className = "rounded-2xl border border-mdt-border dark:border-blue-800 bg-slate-50/50 dark:bg-[#00244C] p-3.5 space-y-2.5";

        let catTotal = 0, catLearned = 0, catDue = 0;
        Object.values(sourcesMap[cat]).forEach(v => {
          catTotal += v.total;
          catLearned += v.learned;
          catDue += v.due;
        });
        const catRate = Math.round((catLearned / catTotal) * 100);

        catBox.innerHTML = \`
          <div class="flex items-center justify-between cursor-pointer" onclick="openSelectModal('ALL', '\${cat}')">
            <div class="flex items-center space-x-2">
              <span class="h-2 w-2 rounded-full \${cat.includes('CRT') ? 'bg-mdt-primary' : 'bg-cyan-500'}"></span>
              <span class="text-sm font-bold text-slate-800 dark:text-white">\${cat}</span>
              <span class="text-xs text-mdt-muted dark:text-blue-200">(\${catLearned}/\${catTotal}問)</span>
            </div>
            <div class="flex items-center space-x-2">
              \${catDue > 0 ? \`<span class="rounded bg-rose-100 dark:bg-rose-950 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-300">復習 \${catDue}</span>\` : ''}
              <span class="text-xs font-black text-mdt-primary dark:text-cyan-300">\${catRate}%</span>
            </div>
          </div>
          <div class="h-1.5 w-full rounded-full bg-slate-200 dark:bg-blue-950 overflow-hidden">
            <div class="h-full bg-gradient-to-r from-mdt-primary to-cyan-500" style="width: \${catRate}%"></div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
            \${Object.keys(sourcesMap[cat]).map(src => {
              const item = sourcesMap[cat][src];
              const sRate = Math.round((item.learned / item.total) * 100);
              return \`
                <div onclick="openSelectModal('ALL', '\${src}')" class="cursor-pointer rounded-xl border border-slate-200 dark:border-blue-900/60 bg-white dark:bg-[#001D44] p-2 hover:border-blue-300 transition flex items-center justify-between text-xs">
                  <span class="truncate font-medium text-slate-700 dark:text-slate-300 pr-2">\${src}</span>
                  <div class="flex items-center space-x-1.5 shrink-0">
                    \${item.due > 0 ? \`<span class="text-[10px] text-rose-500 font-bold">\${item.due}復習</span>\` : ''}
                    <span class="text-[11px] font-bold text-mdt-muted dark:text-blue-200">\${item.learned}/\${item.total}</span>
                  </div>
                </div>
              \`;
            }).join('')}
          </div>
        \`;
        catListEl.appendChild(catBox);
      });
      lucide.createIcons();
    }

    // クイックスタート
    function quickStart() {
      const stats = getStats();
      let targetList = [];
      let modeName = "復習学習";

      if (stats.dueCount > 0) {
        targetList = QUESTIONS.filter(q => {
          const p = userProgress[q.id];
          return p && p.status !== 'unseen' && p.nextDue <= Date.now();
        });
        modeName = "本日復習";
      } else if (stats.unseenCount > 0) {
        targetList = QUESTIONS.filter(q => {
          const p = userProgress[q.id];
          return !p || p.status === 'unseen';
        });
        modeName = "未学習演習";
      } else {
        targetList = [...QUESTIONS];
        modeName = "総復習シャッフル";
      }

      // シャッフルして15問
      const shuffled = targetList.sort(() => Math.random() - 0.5).slice(0, 15);
      startSession(shuffled, modeName);
    }

    function startSession(questions, modeName = "演習") {
      if (!questions || questions.length === 0) {
        alert("該当する問題がありません。");
        return;
      }
      currentSession = {
        name: modeName,
        questions: questions,
        currentIndex: 0,
        results: { forgot: 0, review_3d: 0, remembered: 0 },
        startedAt: Date.now()
      };
      saveSessionState();
      switchTab('study');
      loadCard();
    }

    function loadCard() {
      cardFlipped = false;
      document.getElementById('card-front').classList.remove('hidden');
      document.getElementById('card-back').classList.add('hidden');
      document.getElementById('study-complete-area').classList.add('hidden');
      document.getElementById('study-active-area').classList.remove('hidden');

      if (!currentSession || currentSession.currentIndex >= currentSession.questions.length) {
        finishSession();
        return;
      }

      const q = currentSession.questions[currentSession.currentIndex];
      const total = currentSession.questions.length;
      const idx = currentSession.currentIndex + 1;

      document.getElementById('study-counter').innerText = \`問題 \${idx} / \${total}\`;
      document.getElementById('study-mode-badge').innerText = currentSession.name || '演習';
      const pct = Math.round(((idx - 1) / total) * 100);
      document.getElementById('study-bar').style.width = pct + '%';

      // 表面
      document.getElementById('card-cat').innerText = q.category;
      document.getElementById('card-subcat').innerText = q.subcategory || q.source_title;
      document.getElementById('card-stars').innerText = '★'.repeat(q.difficulty || 2);
      document.getElementById('card-q').innerText = q.question;

      // 裏面
      document.getElementById('card-q-back').innerText = q.question;
      document.getElementById('card-ans').innerText = q.answer;
      document.getElementById('card-ans-len').innerText = \`\${q.answer.length}文字\`;
      document.getElementById('card-src').innerText = \`講義出展: \${q.source_title}\`;

      lucide.createIcons();
    }

    function flipCard() {
      cardFlipped = !cardFlipped;
      if (cardFlipped) {
        document.getElementById('card-front').classList.add('hidden');
        document.getElementById('card-back').classList.remove('hidden');
      } else {
        document.getElementById('card-front').classList.remove('hidden');
        document.getElementById('card-back').classList.add('hidden');
      }
      lucide.createIcons();
    }

    // 自己評価 & 忘却曲線間隔更新
    function rateCard(rating) {
      if (!currentSession) return;
      const q = currentSession.questions[currentSession.currentIndex];
      const now = Date.now();
      const ONE_DAY = 24 * 60 * 60 * 1000;

      let prev = userProgress[q.id] || {
        status: 'unseen',
        intervalDays: 0,
        history: []
      };

      let intervalDays = 1;
      let newStatus = 'learning';

      if (rating === 'forgot') {
        intervalDays = 1; // 翌日復習
        newStatus = 'learning';
        currentSession.results.forgot++;
      } else if (rating === 'review_3d') {
        intervalDays = 3; // 3日後
        newStatus = 'learning';
        currentSession.results.review_3d++;
      } else if (rating === 'remembered') {
        if (prev.intervalDays >= 7) {
          intervalDays = 14;
        } else if (prev.intervalDays >= 3) {
          intervalDays = 7;
        } else {
          intervalDays = 7;
        }
        newStatus = 'mastered';
        currentSession.results.remembered++;
      }

      userProgress[q.id] = {
        status: newStatus,
        intervalDays: intervalDays,
        nextDue: now + intervalDays * ONE_DAY,
        lastAnswered: now,
        history: [...(prev.history || []), { rating, timestamp: now }]
      };

      saveProgress();

      currentSession.currentIndex++;
      saveSessionState();

      if (currentSession.currentIndex < currentSession.questions.length) {
        loadCard();
      } else {
        finishSession();
      }
    }

    function finishSession() {
      saveSessionState();
      document.getElementById('study-active-area').classList.add('hidden');
      const completeArea = document.getElementById('study-complete-area');
      completeArea.classList.remove('hidden');

      if (currentSession && currentSession.results) {
        document.getElementById('res-forgot').innerText = currentSession.results.forgot + '問';
        document.getElementById('res-3d').innerText = currentSession.results.review_3d + '問';
        document.getElementById('res-rem').innerText = currentSession.results.remembered + '問';
      }

      // 紙吹雪アニメーション
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#004B87', '#00A3E0', '#10B981', '#38BDF8']
        });
      } catch (e) {}

      localStorage.removeItem(SESSION_KEY);
      currentSession = null;
    }

    function continueUnseen() {
      const unseen = QUESTIONS.filter(q => {
        const p = userProgress[q.id];
        return !p || p.status === 'unseen';
      });
      if (unseen.length === 0) {
        alert("未学習の問題はすべて完了しました！お疲れ様でした。");
        switchTab('dashboard');
        return;
      }
      const nextBatch = unseen.slice(0, 15);
      startSession(nextBatch, "未学習継続");
    }

    // 問題選択モーダル
    let modalQuestionsList = [];
    let modalSelectedIds = new Set();

    function openSelectModal(mode, targetKey = 'ALL') {
      const modal = document.getElementById('select-modal');
      modal.classList.remove('hidden');
      modalSelectedIds.clear();

      // カテゴリセレクト初期化
      const catSelect = document.getElementById('modal-cat-select');
      catSelect.innerHTML = '<option value="ALL">全ての領域・教材</option>';
      const categories = [...new Set(QUESTIONS.map(q => q.category))];
      categories.forEach(c => {
        catSelect.innerHTML += \`<option value="\${c}">領域: \${c}</option>\`;
      });
      const sources = [...new Set(QUESTIONS.map(q => q.source_title))];
      sources.forEach(s => {
        catSelect.innerHTML += \`<option value="SRC:\${s}">教材: \${s}</option>\`;
      });

      if (targetKey !== 'ALL') {
        if (categories.includes(targetKey)) {
          catSelect.value = targetKey;
        } else if (sources.includes(targetKey)) {
          catSelect.value = 'SRC:' + targetKey;
        }
      }

      document.getElementById('modal-title').innerText = mode === 'due' ? '本日復習問題を選択' : (mode === 'unseen' ? '未学習問題を選択' : '教材・問題を選択');
      catSelect.dataset.mode = mode;
      filterModalQuestions();
    }

    function closeSelectModal() {
      document.getElementById('select-modal').classList.add('hidden');
    }

    function onModalCategoryChange() {
      filterModalQuestions();
    }

    function filterModalQuestions() {
      const catSelect = document.getElementById('modal-cat-select');
      const val = catSelect.value;
      const mode = catSelect.dataset.mode || 'ALL';
      const now = Date.now();

      modalQuestionsList = QUESTIONS.filter(q => {
        if (val.startsWith('SRC:')) {
          const src = val.replace('SRC:', '');
          if (q.source_title !== src) return false;
        } else if (val !== 'ALL') {
          if (q.category !== val) return false;
        }

        const p = userProgress[q.id];
        if (mode === 'due') {
          return p && p.status !== 'unseen' && p.nextDue <= now;
        } else if (mode === 'unseen') {
          return !p || p.status === 'unseen';
        }
        return true;
      });

      // デフォルトで全選択（上限20問）
      modalSelectedIds.clear();
      modalQuestionsList.slice(0, 15).forEach(q => modalSelectedIds.add(q.id));

      renderModalList();
    }

    function renderModalList() {
      const listEl = document.getElementById('modal-list');
      listEl.innerHTML = '';

      if (modalQuestionsList.length === 0) {
        listEl.innerHTML = '<div class="text-center py-8 text-xs text-slate-400">該当する問題がありません。</div>';
        updateModalCounter();
        return;
      }

      modalQuestionsList.forEach(q => {
        const isSelected = modalSelectedIds.has(q.id);
        const item = document.createElement('div');
        item.className = \`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition \${isSelected ? 'border-mdt-primary bg-blue-50/50 dark:bg-blue-950/40 dark:border-cyan-500' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'}\`;
        item.onclick = () => {
          if (modalSelectedIds.has(q.id)) {
            modalSelectedIds.delete(q.id);
          } else {
            modalSelectedIds.add(q.id);
          }
          renderModalList();
        };

        item.innerHTML = \`
          <input type="checkbox" \${isSelected ? 'checked' : ''} class="mt-0.5 rounded text-mdt-primary pointer-events-none" />
          <div class="flex-1 space-y-1">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="rounded bg-blue-100 dark:bg-blue-900/60 text-mdt-primary dark:text-cyan-300 px-1.5 py-0.5 text-[10px] font-bold">\${q.category}</span>
              <span class="text-[10px] text-slate-500 dark:text-slate-400">\${q.subcategory}</span>
            </div>
            <p class="font-medium text-slate-800 dark:text-white leading-relaxed">\${q.question}</p>
          </div>
        \`;
        listEl.appendChild(item);
      });

      updateModalCounter();
    }

    function updateModalCounter() {
      document.getElementById('modal-selected-count').innerText = \`\${modalSelectedIds.size}問 選択中\`;
    }

    function modalSelectRandom(count) {
      modalSelectedIds.clear();
      const shuffled = [...modalQuestionsList].sort(() => Math.random() - 0.5);
      shuffled.slice(0, count).forEach(q => modalSelectedIds.add(q.id));
      renderModalList();
    }

    function modalSelectAll() {
      modalQuestionsList.forEach(q => modalSelectedIds.add(q.id));
      renderModalList();
    }

    function modalDeselectAll() {
      modalSelectedIds.clear();
      renderModalList();
    }

    function startModalSession() {
      if (modalSelectedIds.size === 0) {
        alert("1問以上選択してください。");
        return;
      }
      const selected = modalQuestionsList.filter(q => modalSelectedIds.has(q.id));
      closeSelectModal();
      startSession(selected, "カスタム選択演習");
    }

    // 問題庫タブ
    function initQuestionBankFilter() {
      const catFilter = document.getElementById('q-cat-filter');
      catFilter.innerHTML = '<option value="ALL">すべての領域</option>';
      const categories = [...new Set(QUESTIONS.map(q => q.category))];
      categories.forEach(c => {
        catFilter.innerHTML += \`<option value="\${c}">領域: \${c}</option>\`;
      });
      const sources = [...new Set(QUESTIONS.map(q => q.source_title))];
      sources.forEach(s => {
        catFilter.innerHTML += \`<option value="SRC:\${s}">教材: \${s}</option>\`;
      });
    }

    function renderQuestionBank() {
      const searchWord = document.getElementById('q-search').value.toLowerCase().trim();
      const catVal = document.getElementById('q-cat-filter').value;
      const listEl = document.getElementById('q-bank-list');

      const filtered = QUESTIONS.filter(q => {
        if (catVal.startsWith('SRC:')) {
          if (q.source_title !== catVal.replace('SRC:', '')) return false;
        } else if (catVal !== 'ALL') {
          if (q.category !== catVal) return false;
        }

        if (searchWord) {
          const text = (q.question + ' ' + q.answer + ' ' + q.subcategory + ' ' + q.source_title).toLowerCase();
          if (!text.includes(searchWord)) return false;
        }
        return true;
      });

      listEl.innerHTML = '';
      if (filtered.length === 0) {
        listEl.innerHTML = '<div class="text-center py-10 text-xs text-slate-400">一致する問題が見つかりません。</div>';
        return;
      }

      filtered.forEach(q => {
        const p = userProgress[q.id];
        let statusBadge = '<span class="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-bold">未着手</span>';
        if (p && p.status !== 'unseen') {
          if (p.intervalDays >= 7) {
            statusBadge = '<span class="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-bold">定着済</span>';
          } else {
            statusBadge = '<span class="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded font-bold">復習中</span>';
          }
        }

        const card = document.createElement('div');
        card.className = "rounded-2xl border border-mdt-border dark:border-blue-900 bg-white dark:bg-[#001D44] p-4 space-y-2 shadow-sm";
        card.innerHTML = \`
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="rounded bg-blue-100 dark:bg-blue-900/60 text-mdt-primary dark:text-cyan-300 px-2 py-0.5 text-[10px] font-bold">\${q.category}</span>
              <span class="text-[10px] text-slate-500 dark:text-slate-400">\${q.subcategory}</span>
            </div>
            <div class="flex items-center gap-2">
              \${statusBadge}
              <button onclick="startSession([QUESTIONS.find(x => x.id === '\${q.id}')], '単問演習')" class="rounded-lg bg-mdt-primary text-white px-2 py-1 text-[11px] font-bold shadow-sm">今すぐ解く</button>
            </div>
          </div>
          <p class="text-xs sm:text-sm font-bold text-slate-800 dark:text-white leading-relaxed">\${q.question}</p>
          <details class="text-xs pt-1 border-t border-slate-100 dark:border-blue-900/60 cursor-pointer">
            <summary class="text-mdt-primary dark:text-cyan-300 font-semibold py-1">解答・解説を表示</summary>
            <div class="rounded-xl bg-slate-50 dark:bg-slate-900/60 p-3 mt-1 text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              \${q.answer}
              <div class="text-[10px] text-slate-400 mt-2 font-mono">文字数: \${q.answer.length}字 | 出典: \${q.source_title}</div>
            </div>
          </details>
        \`;
        listEl.appendChild(card);
      });
    }

    // 統計タブ
    function renderStats() {
      let totalAnswers = 0;
      let mastered = 0;
      let learning = 0;
      let untouched = 0;

      let crtTotal = 0, crtMastered = 0;
      let icdTotal = 0, icdMastered = 0;

      QUESTIONS.forEach(q => {
        const isCRT = q.category.includes('CRT');
        if (isCRT) crtTotal++; else icdTotal++;

        const p = userProgress[q.id];
        if (!p || p.status === 'unseen') {
          untouched++;
        } else {
          totalAnswers += (p.history ? p.history.length : 1);
          if (p.intervalDays >= 7) {
            mastered++;
            if (isCRT) crtMastered++; else icdMastered++;
          } else {
            learning++;
          }
        }
      });

      document.getElementById('stat-total-answers').innerText = totalAnswers;
      document.getElementById('stat-mastered').innerText = mastered;
      document.getElementById('stat-learning').innerText = learning;
      document.getElementById('stat-untouched').innerText = untouched;

      const crtRate = Math.round((crtMastered / crtTotal) * 100);
      const icdRate = Math.round((icdMastered / icdTotal) * 100);

      document.getElementById('crt-rate').innerText = \`\${crtRate}% (\${crtMastered}/\${crtTotal}問)\`;
      document.getElementById('crt-bar').style.width = crtRate + '%';

      document.getElementById('icd-rate').innerText = \`\${icdRate}% (\${icdMastered}/\${icdTotal}問)\`;
      document.getElementById('icd-bar').style.width = icdRate + '%';
    }

    // データエクスポート・インポート
    function exportData() {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userProgress, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "medtronic_academy_progress.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }

    function importData(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const parsed = JSON.parse(e.target.result);
          if (typeof parsed === 'object') {
            userProgress = parsed;
            saveProgress();
            alert("データを正常に復元しました。");
            renderDashboard();
            renderStats();
          }
        } catch (err) {
          alert("ファイルの読み込みに失敗しました。");
        }
      };
      reader.readAsText(file);
    }

    function resetData() {
      if (confirm("これまでの学習履歴をすべて消去して初期状態に戻しますか？")) {
        userProgress = {};
        saveProgress();
        localStorage.removeItem(SESSION_KEY);
        alert("学習データをリセットしました。");
        renderDashboard();
        renderStats();
      }
    }

    // 初期化とローディングアニメーションの解除
    window.addEventListener('DOMContentLoaded', () => {
      initData();
      setTimeout(() => {
        const overlay = document.getElementById('ecg-loading-overlay');
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 300);
      }, 700);
    });

    // キーボードショートカット (PC操作用)
    window.addEventListener('keydown', (e) => {
      const studyTab = document.getElementById('tab-study');
      if (studyTab.classList.contains('hidden')) return;

      if (e.code === 'Space') {
        e.preventDefault();
        flipCard();
      } else if (e.key === '1' && cardFlipped) {
        rateCard('forgot');
      } else if (e.key === '2' && cardFlipped) {
        rateCard('review_3d');
      } else if (e.key === '3' && cardFlipped) {
        rateCard('remembered');
      }
    });

    // Service Worker 登録 (PWA用)
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
      });
    }
  </script>
</body>
</html>`;

fs.writeFileSync(OUTPUT_HTML_ROOT, htmlTemplate, "utf-8");
fs.writeFileSync(OUTPUT_HTML_GAS, htmlTemplate, "utf-8");

console.log(`生成成功!`);
console.log(`ルート出力: ${OUTPUT_HTML_ROOT}`);
console.log(`GAS/スタンドアロン出力: ${OUTPUT_HTML_GAS}`);
