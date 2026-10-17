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
  <meta name="theme-color" content="#ffffff">
  <meta name="description" content="Medtronic Academy High Power 学習アプリ - CRT / ICD アクティブリコール問題集">
  <title>Medtronic Academy High Power | アクティブリコール学習アプリ</title>
  <link rel="manifest" href="./manifest.json">
  <link rel="apple-touch-icon" href="./icon-192.png">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            mdt: {
              primary: '#004B87',
              dark: '#002554',
              light: '#00A3E0',
              surface: '#F8FAFC',
              card: '#FFFFFF',
              border: '#E2E8F0',
              text: '#0F172A',
              muted: '#64748B'
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
      --safe-bottom: max(env(safe-area-inset-bottom, 0px), 8px);
    }
    html, body {
      background-color: #ffffff;
      color: #0f172a;
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
      user-select: none;
      overflow-x: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    .safe-bottom {
      padding-bottom: var(--safe-bottom);
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.2s ease-out forwards;
    }
    @keyframes ecgSweep {
      0% { stroke-dashoffset: 1000; opacity: 0.95; }
      75% { stroke-dashoffset: 0; opacity: 1; }
      100% { stroke-dashoffset: -1000; opacity: 0.25; }
    }
    .animate-ecg-trace {
      stroke-dasharray: 1000;
      stroke-dashoffset: 1000;
      animation: ecgSweep 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    }
  </style>
</head>
<body class="min-h-screen bg-white text-slate-900 flex flex-col antialiased selection:bg-blue-500/20 selection:text-slate-900">

  <!-- 心電図・モニター風ローディングオーバーレイ -->
  <div id="ecg-loading-overlay" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white px-4 transition-opacity duration-300">
    <div class="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xl space-y-4">
      <div class="flex items-center justify-between text-xs border-b border-slate-100 pb-3">
        <div class="flex items-center space-x-2">
          <span class="h-2.5 w-2.5 rounded-full bg-[#00A3E0] animate-ping"></span>
          <span class="font-mono font-bold text-mdt-primary tracking-wider">LEAD II</span>
          <span class="text-[11px] text-slate-500 font-mono">10mm/mV</span>
        </div>
        <div class="flex items-center space-x-1.5 font-mono text-mdt-primary">
          <span class="text-sm font-black">72</span>
          <span class="text-[10px] text-slate-500">BPM</span>
        </div>
      </div>
      <div class="relative h-32 sm:h-36 w-full overflow-hidden rounded-2xl border border-blue-200 bg-slate-950 shadow-inner">
        <div class="absolute inset-0 opacity-20" style="background-image: linear-gradient(to right, #00A3E0 1px, transparent 1px), linear-gradient(to bottom, #00A3E0 1px, transparent 1px); background-size: 16px 16px;"></div>
        <svg viewBox="0 0 600 130" class="relative z-10 h-full w-full" preserveAspectRatio="none">
          <path d="M 0,75 L 35,75 C 42,75 46,62 54,62 C 62,62 66,75 73,75 L 90,75 L 96,86 L 106,18 L 116,108 L 123,75 L 142,75 C 152,75 158,52 170,52 C 182,52 188,75 198,75 L 235,75 C 242,75 246,62 254,62 C 262,62 266,75 273,75 L 290,75 L 296,86 L 306,16 L 316,108 L 323,75 L 342,75 C 352,75 358,52 370,52 C 382,52 388,75 398,75 L 435,75 C 442,75 446,62 454,62 C 462,62 466,75 473,75 L 490,75 L 496,86 L 506,18 L 516,108 L 523,75 L 542,75 C 552,75 558,52 570,52 C 582,52 588,75 600,75" fill="none" stroke="#003566" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M 0,75 L 35,75 C 42,75 46,62 54,62 C 62,62 66,75 73,75 L 90,75 L 96,86 L 106,18 L 116,108 L 123,75 L 142,75 C 152,75 158,52 170,52 C 182,52 188,75 198,75 L 235,75 C 242,75 246,62 254,62 C 262,62 266,75 273,75 L 290,75 L 296,86 L 306,16 L 316,108 L 323,75 L 342,75 C 352,75 358,52 370,52 C 382,52 388,75 398,75 L 435,75 C 442,75 446,62 454,62 C 462,62 466,75 473,75 L 490,75 L 496,86 L 506,18 L 516,108 L 523,75 L 542,75 C 552,75 558,52 570,52 C 582,52 588,75 600,75" pathLength="1000" fill="none" stroke="#00A3E0" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" class="animate-ecg-trace" />
        </svg>
      </div>
      <div class="text-center space-y-1 pt-1">
        <p class="text-xs sm:text-sm font-bold text-slate-800 tracking-wide">Medtronic High Power 学習データを読込中...</p>
        <p class="text-[11px] font-mono text-mdt-primary">Normal Sinus Rhythm | HR 72 bpm | 25.0 mm/s</p>
      </div>
    </div>
  </div>

  <!-- 上部ヘッダー（シンプル・1行表示） -->
  <header class="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
    <div class="mx-auto flex h-14 sm:h-16 max-w-5xl items-center justify-between px-3.5 sm:px-6">
      <div class="flex items-center space-x-2.5 group min-w-0 cursor-pointer" onclick="switchTab('dashboard')">
        <div class="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-mdt-primary text-white shadow-sm border border-blue-500/30 group-hover:scale-105 transition-transform shrink-0">
          <i data-lucide="activity" class="h-5 w-5"></i>
        </div>
        <span class="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
          Medtronic Academy
        </span>
      </div>

      <div class="hidden sm:flex items-center gap-2">
        <button
          type="button"
          onclick="switchTab('questions')"
          class="px-3 py-1.5 text-slate-700 hover:text-mdt-primary hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors text-xs font-semibold flex items-center gap-1.5"
        >
          <i data-lucide="layers" class="w-4 h-4 text-mdt-primary"></i>
          <span>問題庫・検索</span>
        </button>
      </div>
    </div>
  </header>

  <!-- メインコンテンツ -->
  <main class="flex-1 flex flex-col pb-16 bg-white">

    <!-- 1. ダッシュボード -->
    <div id="tab-dashboard" class="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 py-6 sm:py-8 space-y-8 bg-white">

      <!-- 中断セッション復元バナー（あるときだけ表示） -->
      <div id="resume-banner" class="hidden rounded-2xl border border-blue-200 bg-blue-50/70 p-4 sm:p-5 shadow-sm">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center space-x-3.5">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-mdt-primary border border-blue-200">
              <i data-lucide="sparkles" class="h-5 w-5 animate-pulse"></i>
            </div>
            <div>
              <h4 class="text-sm font-bold text-slate-900">前回の学習を再開できます</h4>
              <p id="resume-subtext" class="text-xs text-slate-600"></p>
            </div>
          </div>
          <div class="flex items-center space-x-2 w-full sm:w-auto">
            <button
              type="button"
              onclick="discardSession()"
              class="flex-1 sm:flex-none rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              破棄
            </button>
            <button
              type="button"
              onclick="resumeSession()"
              class="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 rounded-xl bg-mdt-primary px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
            >
              <i data-lucide="play" class="h-3.5 w-3.5 fill-current"></i>
              <span>前回の学習を再開</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ヒーローセクション -->
      <div class="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/40 p-6 sm:p-8 shadow-sm">
        <div class="relative z-10 max-w-2xl">
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
            <span class="bg-gradient-to-r from-[#004B87] via-blue-600 to-[#00A3E0] bg-clip-text text-transparent">
              アクティブリコール学習
            </span>
          </h1>

          <div class="mt-5 flex flex-col gap-3">
            <div class="flex flex-wrap items-center gap-3">
              <!-- 本日の復習を開始（0問のときは非表示） -->
              <button
                id="btn-start-due"
                type="button"
                onclick="startDueSession()"
                class="hidden flex items-center space-x-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-rose-600/20 hover:from-rose-600 hover:to-rose-700 transition active:scale-[0.98]"
              >
                <i data-lucide="calendar-clock" class="h-4 w-4"></i>
                <span>本日の復習を開始</span>
              </button>

              <!-- 新規問題に取り組む（0問のときは非表示） -->
              <div id="unseen-action-group" class="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onclick="startUnseenSession()"
                  class="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-[#004B87] to-[#00A3E0] px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 hover:opacity-95 transition active:scale-[0.98]"
                >
                  <i data-lucide="play" class="h-4 w-4 fill-current"></i>
                  <span id="unseen-btn-label">新規問題に取り組む （10問）</span>
                </button>

                <!-- 隙間時間に合わせて自由に選べる出題数 -->
                <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                  <button type="button" onclick="setQuota(5)" id="quota-btn-5" class="px-2.5 py-1.5 rounded-lg font-bold transition-all text-slate-600 hover:text-slate-900">5問</button>
                  <button type="button" onclick="setQuota(10)" id="quota-btn-10" class="px-2.5 py-1.5 rounded-lg font-bold transition-all bg-white text-mdt-primary shadow-sm">10問</button>
                  <button type="button" onclick="setQuota(15)" id="quota-btn-15" class="px-2.5 py-1.5 rounded-lg font-bold transition-all text-slate-600 hover:text-slate-900">15問</button>
                  <button type="button" onclick="setQuota(30)" id="quota-btn-30" class="px-2.5 py-1.5 rounded-lg font-bold transition-all text-slate-600 hover:text-slate-900">30問</button>
                  <button type="button" onclick="setQuota(0)" id="quota-btn-0" class="px-2.5 py-1.5 rounded-lg font-bold transition-all text-slate-600 hover:text-slate-900">自由</button>
                </div>
              </div>

              <!-- すべて完了時のメッセージ -->
              <div id="all-completed-banner" class="hidden px-5 py-3 rounded-xl bg-emerald-50 text-emerald-800 text-sm font-bold border border-emerald-200">
                すべての問題の演習が完了しています
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 集計カード（3枚構成） -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <!-- 1. 本日復習カード -->
        <div
          onclick="openSelectModal('due', 'ALL')"
          class="group cursor-pointer relative overflow-hidden rounded-2xl border border-rose-200 bg-white p-5 shadow-sm transition hover:border-rose-400 hover:shadow-md"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-rose-600 uppercase tracking-wider">本日復習</span>
            <div class="rounded-lg bg-rose-50 p-2 text-rose-600 border border-rose-200 group-hover:scale-105 transition-transform">
              <i data-lucide="calendar-clock" class="h-5 w-5"></i>
            </div>
          </div>
          <div class="mt-4 flex items-baseline space-x-2">
            <span id="stat-due" class="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">0</span>
            <span class="text-xs text-slate-500">問が期日到来</span>
          </div>
          <p class="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>前日不正解・期日到来分</span>
            <span class="text-rose-600 font-semibold group-hover:underline inline-flex items-center text-[11px]">
              選択して開始 <i data-lucide="chevron-right" class="h-3 w-3 ml-0.5"></i>
            </span>
          </p>
        </div>

        <!-- 2. 未学習カード -->
        <div
          onclick="openSelectModal('unseen', 'ALL')"
          class="group cursor-pointer relative overflow-hidden rounded-2xl border border-blue-200 bg-white p-5 shadow-sm transition hover:border-blue-400 hover:shadow-md"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-mdt-primary uppercase tracking-wider">未学習</span>
            <div class="rounded-lg bg-blue-50 p-2 text-mdt-primary border border-blue-200 group-hover:scale-105 transition-transform">
              <i data-lucide="book-open" class="h-5 w-5"></i>
            </div>
          </div>
          <div class="mt-4 flex items-baseline space-x-2">
            <span id="stat-unseen" class="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">239</span>
            <span class="text-xs text-slate-500">問の新規問題</span>
          </div>
          <p class="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>未着手の専門問題集</span>
            <span class="text-mdt-primary font-semibold group-hover:underline inline-flex items-center text-[11px]">
              選択して開始 <i data-lucide="chevron-right" class="h-3 w-3 ml-0.5"></i>
            </span>
          </p>
        </div>

        <!-- 3. 本日解答数カード -->
        <div class="relative overflow-hidden rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-emerald-700 uppercase tracking-wider">本日解答数</span>
            <div class="rounded-lg bg-emerald-50 p-2 text-emerald-600 border border-emerald-200">
              <i data-lucide="award" class="h-5 w-5"></i>
            </div>
          </div>
          <div class="mt-4 flex items-baseline space-x-2">
            <span id="stat-today" class="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">0</span>
            <span class="text-xs text-slate-500">問演習完了</span>
          </div>
          <p class="mt-2 text-xs text-slate-500">
            本日の総演習実績（暦日 00:00〜現在）
          </p>
        </div>
      </div>

      <!-- 分野別 習得進捗リスト -->
      <div class="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-mdt-primary border border-blue-200">
              <i data-lucide="layers" class="h-5 w-5"></i>
            </div>
            <div>
              <h3 class="text-lg font-bold text-slate-900">分野別 習得進捗リスト</h3>
              <p class="text-xs text-slate-500">
                各単元をクリックすると、その単元の問題を選んで学習を開始できます
              </p>
            </div>
          </div>
        </div>
        <div id="category-list" class="space-y-3"></div>
      </div>

    </div>

    <!-- 2. 学習セッション画面 -->
    <div id="tab-study" class="hidden flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 py-5 sm:py-8 bg-white">
      <div id="study-active-area" class="space-y-5">

        <!-- 上部ヘッダー（進捗バー & 終了して結果確認 & 中断して保存） -->
        <div class="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-sm space-y-2.5">
          <div class="flex items-center justify-between gap-1.5 text-xs">
            <div class="flex items-center space-x-1 sm:space-x-1.5 shrink-0 whitespace-nowrap">
              <i data-lucide="target" class="h-3.5 w-3.5 text-mdt-primary shrink-0"></i>
              <span id="study-counter" class="font-bold text-slate-900 text-xs sm:text-sm">問題 1/10問</span>
              <span id="study-pct" class="text-slate-400 font-mono text-[11px] hidden md:inline ml-1">(0%)</span>
            </div>
            <div class="flex items-center space-x-1 sm:space-x-2 shrink-0 whitespace-nowrap">
              <button
                id="btn-finish-early"
                type="button"
                onclick="finishSessionEarly()"
                class="hidden flex items-center space-x-1 rounded-xl border border-blue-200 bg-blue-50 px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-mdt-primary hover:bg-blue-100 transition shadow-sm whitespace-nowrap"
              >
                <i data-lucide="sparkles" class="h-3.5 w-3.5 text-mdt-primary shrink-0"></i>
                <span class="hidden sm:inline">終了して結果確認</span>
                <span class="sm:hidden">結果確認</span>
              </button>
              <button
                type="button"
                onclick="switchTab('dashboard')"
                class="flex items-center space-x-1 rounded-xl border border-slate-200 bg-slate-50 px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition whitespace-nowrap"
              >
                <i data-lucide="log-out" class="h-3.5 w-3.5 shrink-0"></i>
                <span class="hidden sm:inline">中断して保存</span>
                <span class="sm:hidden">中断保存</span>
              </button>
            </div>
          </div>

          <div class="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div id="study-bar" class="h-full bg-gradient-to-r from-[#004B87] to-[#00A3E0] transition-all duration-300" style="width: 0%"></div>
          </div>
        </div>

        <!-- フラッシュカード本体 -->
        <div class="relative min-h-[380px] sm:min-h-[460px] w-full rounded-3xl border border-slate-200 bg-white shadow-lg overflow-hidden transition-all duration-300">
          
          <!-- 【表面】1問1答問題 -->
          <div id="card-front" onclick="flipCard()" class="flex flex-col justify-between p-5 sm:p-8 min-h-[380px] sm:min-h-[460px] cursor-pointer select-none active:bg-slate-50">
            <div>
              <!-- カード上部メタ情報 -->
              <div class="flex flex-wrap items-center justify-between gap-1.5 border-b border-slate-200 pb-3 sm:pb-4">
                <div class="flex flex-wrap items-center gap-1.5">
                  <span id="card-cat" class="rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] sm:text-xs font-bold text-mdt-primary border border-blue-200"></span>
                  <span id="card-subcat" class="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-slate-700 border border-slate-200"></span>
                  <span id="card-status-badge" class="rounded-lg px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold border bg-slate-100 text-slate-700 border-slate-300">未学習</span>
                </div>
              </div>

              <!-- 問題文 -->
              <div class="my-8 sm:my-12">
                <h2 id="card-q" class="text-base sm:text-xl lg:text-2xl font-bold text-slate-900 leading-relaxed tracking-wide"></h2>
              </div>
            </div>

            <!-- 反転ガイドボタン -->
            <div class="mt-6 pt-3 sm:pt-4 border-t border-slate-200">
              <button
                type="button"
                onclick="event.stopPropagation(); flipCard();"
                class="w-full flex items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-[#004B87] to-[#00A3E0] py-3.5 sm:py-4 px-4 text-sm font-bold text-white hover:opacity-95 active:scale-[0.98] shadow-md shadow-blue-600/20 transition"
              >
                <i data-lucide="rotate-cw" class="h-4 w-4 text-white"></i>
                <span>タップして解答・解説を表示</span>
              </button>
            </div>
          </div>

          <!-- 【裏面】150〜200文字の論理的解答・解説 & 3段階評価ボタン -->
          <div id="card-back" class="hidden flex-col justify-between p-4 sm:p-8 min-h-[400px] sm:min-h-[480px]">
            <div>
              <!-- カード上部メタ情報 -->
              <div class="flex items-center justify-between border-b border-slate-200 pb-3">
                <div class="flex flex-wrap items-center gap-1.5">
                  <span class="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                    解答・論理解説
                  </span>
                  <span id="card-cat-back" class="text-xs text-slate-500 truncate max-w-[180px] sm:max-w-none"></span>
                </div>
                <button
                  type="button"
                  onclick="flipCard()"
                  class="flex items-center space-x-1 text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 transition"
                >
                  <i data-lucide="rotate-cw" class="h-3.5 w-3.5"></i>
                  <span>問題に戻す</span>
                </button>
              </div>

              <!-- 設問の再掲 -->
              <div class="mt-3 rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5">
                <p id="card-q-back" class="text-xs sm:text-sm font-bold text-slate-800 leading-snug"></p>
              </div>

              <!-- 解答・解説ボックス -->
              <div class="mt-3 rounded-2xl bg-emerald-50/60 border border-emerald-200 p-4 sm:p-5 space-y-2.5">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-1.5 text-xs sm:text-sm font-bold text-emerald-800">
                    <i data-lucide="check-circle-2" class="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-emerald-600"></i>
                    <span>正解のポイント・メカニズム解説</span>
                  </div>
                  <span id="card-ans-len" class="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] sm:text-[11px] font-mono text-emerald-800 border border-emerald-200"></span>
                </div>
                <div id="card-ans" class="text-sm sm:text-lg leading-relaxed text-slate-900 whitespace-pre-wrap font-medium"></div>
                <div class="pt-2.5 border-t border-emerald-200/70 text-[11px] text-slate-500 flex items-center space-x-1.5">
                  <i data-lucide="bookmark-check" class="h-3.5 w-3.5 shrink-0 text-mdt-primary"></i>
                  <span id="card-src" class="truncate"></span>
                </div>
              </div>
            </div>

            <!-- スマホでもスクロール不要で親指タップできる3列評価ボタン -->
            <div class="mt-5 pt-4 border-t border-slate-200">
              <div class="mb-2.5 flex items-center justify-between text-[11px] sm:text-xs text-slate-500">
                <span class="font-semibold text-slate-700">記憶の定着度を選択して次へ</span>
                <span class="text-[10px] sm:text-[11px] text-slate-500">即座に自動保存</span>
              </div>

              <div class="grid grid-cols-3 gap-2 sm:gap-3">
                <button
                  type="button"
                  onclick="rateCard('forgot')"
                  class="group flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100/80 p-2.5 sm:p-3.5 text-center transition active:scale-95 hover:border-rose-400"
                >
                  <span class="text-xs sm:text-sm font-extrabold text-rose-700">忘れていた</span>
                  <span class="mt-0.5 text-[10px] sm:text-xs text-rose-600 font-medium">明日復習 (1日後)</span>
                </button>
                <button
                  type="button"
                  onclick="rateCard('review_3d')"
                  class="group flex flex-col items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 hover:bg-amber-100/80 p-2.5 sm:p-3.5 text-center transition active:scale-95 hover:border-amber-400"
                >
                  <span class="text-xs sm:text-sm font-extrabold text-amber-700">やや曖昧</span>
                  <span class="mt-0.5 text-[10px] sm:text-xs text-amber-600 font-medium">3日後復習</span>
                </button>
                <button
                  type="button"
                  onclick="rateCard('remembered')"
                  class="group flex flex-col items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100/80 p-2.5 sm:p-3.5 text-center transition active:scale-95 hover:border-emerald-400"
                >
                  <span class="text-xs sm:text-sm font-extrabold text-emerald-700">覚えている</span>
                  <span class="mt-0.5 text-[10px] sm:text-xs text-emerald-600 font-medium">7日後復習</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

      <!-- セッション完了画面 -->
      <div id="study-complete-area" class="hidden space-y-8 animate-fadeIn">
        <div class="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
          <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#004B87] to-[#00A3E0] text-white shadow-lg shadow-blue-500/25 mb-5">
            <i data-lucide="trophy" class="h-10 w-10 animate-bounce"></i>
          </div>

          <div class="inline-flex items-center space-x-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200 mb-3">
            <i data-lucide="sparkles" class="h-3.5 w-3.5"></i>
            <span>セッション完了</span>
          </div>

          <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900">
            セッションが完了しました！
          </h2>
          <p class="mt-2 text-sm text-slate-600">
            自己評価に基づき、次回出題スケジュール（翌日・3日後・7日後）が自動設定されました。
          </p>

          <div class="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <span class="text-[11px] font-bold text-slate-500 uppercase">解答数</span>
              <div class="mt-2 flex items-baseline space-x-1">
                <span id="res-total" class="text-2xl font-black text-slate-900">0</span>
                <span class="text-xs text-slate-500">問</span>
              </div>
            </div>
            <div class="rounded-2xl border border-rose-200 bg-rose-50/70 p-4">
              <span class="text-[11px] font-bold text-rose-600 uppercase">忘れていた</span>
              <div class="mt-2 flex items-baseline space-x-1">
                <span id="res-forgot" class="text-2xl font-black text-rose-700">0</span>
                <span class="text-xs text-rose-600/80">問 (翌日)</span>
              </div>
            </div>
            <div class="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
              <span class="text-[11px] font-bold text-amber-600 uppercase">3日後復習</span>
              <div class="mt-2 flex items-baseline space-x-1">
                <span id="res-3d" class="text-2xl font-black text-amber-700">0</span>
                <span class="text-xs text-amber-600/80">問</span>
              </div>
            </div>
            <div class="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
              <span class="text-[11px] font-bold text-emerald-600 uppercase">覚えている</span>
              <div class="mt-2 flex items-baseline space-x-1">
                <span id="res-rem" class="text-2xl font-black text-emerald-700">0</span>
                <span class="text-xs text-emerald-600/80">問 (7日後)</span>
              </div>
            </div>
          </div>

          <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onclick="backToHomeFromComplete()"
              class="w-full sm:w-auto flex items-center justify-center space-x-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition shadow-sm"
            >
              <i data-lucide="home" class="h-4 w-4"></i>
              <span>ホームに戻る</span>
            </button>
            <button
              id="btn-continue-unseen"
              type="button"
              onclick="continueUnseen()"
              class="w-full sm:w-auto flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-[#004B87] to-[#00A3E0] px-7 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 hover:opacity-95 transition"
            >
              <i data-lucide="book-open" class="h-4 w-4"></i>
              <span>続けて未学習15問を解く</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. 問題庫・検索タブ -->
    <div id="tab-questions" class="hidden flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 py-6 pb-24 space-y-6 bg-white">
      <div class="space-y-1">
        <h1 class="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
          <i data-lucide="layers" class="w-6 h-6 text-mdt-primary"></i>
          <span>収録問題・習得状況一覧</span>
        </h1>
        <p class="text-xs sm:text-sm text-slate-500">
          全 239 問のアクティブリコール問題と間隔反復ステータス
        </p>
      </div>
      <div class="bg-slate-50 rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input id="q-search" type="text" oninput="renderQuestionBank()" placeholder="キーワード検索（例: ATP, SVT, 0.035, PRロジック...）" class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-mdt-primary" />
          <select id="q-cat-filter" onchange="renderQuestionBank()" class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:border-mdt-primary"></select>
        </div>
      </div>
      <div id="q-bank-list" class="space-y-3"></div>
    </div>

    <!-- 4. 設定・統計タブ -->
    <div id="tab-stats" class="hidden flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 py-6 pb-24 space-y-6 bg-white">
      <div>
        <h2 class="text-xl sm:text-2xl font-black text-slate-900">学習統計 & データ管理</h2>
        <p class="text-xs sm:text-sm text-slate-500">記憶定着度の分析と学習データの管理</p>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <span class="text-[11px] font-bold text-slate-500">総演習回数</span>
          <div id="stat-total-answers" class="text-2xl font-black text-mdt-primary mt-1">0</div>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <span class="text-[11px] font-bold text-slate-500">定着済み (7日以上)</span>
          <div id="stat-mastered" class="text-2xl font-black text-emerald-600 mt-1">0</div>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <span class="text-[11px] font-bold text-slate-500">復習待ち</span>
          <div id="stat-learning" class="text-2xl font-black text-amber-600 mt-1">0</div>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <span class="text-[11px] font-bold text-slate-500">未着手</span>
          <div id="stat-untouched" class="text-2xl font-black text-slate-700 mt-1">239</div>
        </div>
      </div>

      <div class="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4 shadow-sm">
        <h3 class="text-sm font-bold text-slate-900">領域別マスター率</h3>
        <div class="space-y-3">
          <div>
            <div class="flex justify-between text-xs font-bold mb-1">
              <span class="text-mdt-primary">Medtronic CRT (全91問)</span>
              <span id="crt-rate" class="text-slate-700">0%</span>
            </div>
            <div class="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div id="crt-bar" class="h-full bg-mdt-primary transition-all duration-300" style="width: 0%"></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between text-xs font-bold mb-1">
              <span class="text-mdt-primary">Medtronic ICD (全148問)</span>
              <span id="icd-rate" class="text-slate-700">0%</span>
            </div>
            <div class="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div id="icd-bar" class="h-full bg-[#00A3E0] transition-all duration-300" style="width: 0%"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 space-y-3 shadow-sm">
        <h3 class="text-sm font-bold text-slate-900">データ管理</h3>
        <p class="text-xs text-slate-500">端末のブラウザ内に学習進捗が自動保存されます。他端末へのデータ移行も可能です。</p>
        <div class="flex flex-wrap gap-2 pt-1">
          <button onclick="exportData()" class="rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-bold text-mdt-primary">データ書き出し (JSON)</button>
          <button onclick="document.getElementById('import-file').click()" class="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700">データ読み込み</button>
          <input type="file" id="import-file" onchange="importData(event)" class="hidden" accept=".json">
          <button onclick="resetData()" class="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-600">進捗初期化</button>
        </div>
      </div>
    </div>

  </main>

  <!-- 問題選択モーダル -->
  <div id="select-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 sm:p-4 backdrop-blur-sm animate-fadeIn">
    <div class="relative flex flex-col w-full max-w-3xl max-h-[88vh] rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden text-slate-900">
      <div class="flex items-center justify-between border-b border-slate-200 px-5 sm:px-6 py-4 bg-white">
        <div class="flex items-center space-x-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-mdt-primary border border-blue-200">
            <i data-lucide="book-open" class="h-5 w-5"></i>
          </div>
          <div>
            <h3 id="modal-title" class="text-base font-bold text-slate-900">問題を選択</h3>
            <p id="modal-subtitle" class="text-xs text-slate-500"></p>
          </div>
        </div>
        <button onclick="closeSelectModal()" class="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition">✕</button>
      </div>
      <div class="border-b border-slate-200 bg-slate-50/80 px-5 sm:px-6 py-3 space-y-2.5">
        <select id="modal-cat-select" onchange="onModalCategoryChange()" class="w-full p-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-mdt-primary"></select>
        <div class="flex flex-wrap items-center gap-1.5 text-xs">
          <button onclick="modalSelectRandom(10)" class="rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1 text-mdt-primary font-semibold">ランダム10問</button>
          <button onclick="modalSelectRandom(15)" class="rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1 text-mdt-primary font-semibold">ランダム15問</button>
          <button onclick="modalSelectRandom(30)" class="rounded-lg bg-white border border-slate-300 px-2.5 py-1 text-slate-700 font-semibold">30問</button>
          <span class="text-slate-300 mx-0.5">|</span>
          <button onclick="modalSelectAll()" class="text-mdt-primary font-semibold px-1.5 py-0.5">表示中を全選択</button>
          <button onclick="modalDeselectAll()" class="text-slate-500 font-semibold px-1.5 py-0.5">全解除</button>
        </div>
      </div>
      <div id="modal-list" class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5 bg-white"></div>
      <div class="border-t border-slate-200 bg-white px-5 sm:px-6 py-4 flex items-center justify-between">
        <span id="modal-selected-count" class="text-xs text-slate-500">0問選択中</span>
        <div class="flex items-center space-x-3">
          <button onclick="closeSelectModal()" class="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition">キャンセル</button>
          <button onclick="startModalSession()" class="rounded-xl bg-gradient-to-r from-[#004B87] to-[#00A3E0] px-5 py-2.5 text-xs font-bold text-white shadow-md">選択した問題で開始</button>
        </div>
      </div>
    </div>
  </div>

  <!-- 下部固定ナビゲーション -->
  <nav class="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-4 safe-bottom">
    <div class="max-w-md mx-auto flex items-center justify-around">
      <button onclick="switchTab('dashboard')" id="nav-dashboard" class="flex flex-col items-center py-1 px-3 rounded-xl transition-all text-mdt-primary font-bold scale-105">
        <i data-lucide="home" class="w-5 h-5"></i>
        <span class="text-[11px] mt-0.5">ホーム</span>
      </button>
      <button onclick="quickStart()" id="nav-study" class="flex flex-col items-center py-1 px-3 rounded-xl transition-all text-slate-500 hover:text-slate-800 font-medium">
        <i data-lucide="play-circle" class="w-5 h-5"></i>
        <span class="text-[11px] mt-0.5">学習</span>
      </button>
      <button onclick="switchTab('questions')" id="nav-questions" class="flex flex-col items-center py-1 px-3 rounded-xl transition-all text-slate-500 hover:text-slate-800 font-medium">
        <i data-lucide="layers" class="w-5 h-5"></i>
        <span class="text-[11px] mt-0.5">問題庫</span>
      </button>
      <button onclick="switchTab('stats')" id="nav-stats" class="flex flex-col items-center py-1 px-3 rounded-xl transition-all text-slate-500 hover:text-slate-800 font-medium">
        <i data-lucide="user" class="w-5 h-5"></i>
        <span class="text-[11px] mt-0.5">設定</span>
      </button>
    </div>
  </nav>

  <!-- スクリプト部 -->
  <script>
    const QUESTIONS = ${questionsJsonString};

    const STORAGE_KEY = "mdt_highpower_progress_v1";
    const SESSION_KEY = "mdt_highpower_session_v1";

    let userProgress = {};
    let currentSession = null;
    let cardFlipped = false;
    let selectedQuota = 10;

    function initData() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          userProgress = JSON.parse(saved);
        }
      } catch (e) {
        console.warn("Storage load failed", e);
      }
      setQuota(10);
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

    function setQuota(num) {
      selectedQuota = num;
      [5, 10, 15, 30, 0].forEach(n => {
        const btn = document.getElementById('quota-btn-' + n);
        if (btn) {
          if (n === num) {
            btn.className = "px-2.5 py-1.5 rounded-lg font-bold transition-all bg-white text-mdt-primary shadow-sm";
          } else {
            btn.className = "px-2.5 py-1.5 rounded-lg font-bold transition-all text-slate-600 hover:text-slate-900";
          }
        }
      });
      const lbl = document.getElementById('unseen-btn-label');
      if (lbl) {
        lbl.innerText = '新規問題に取り組む ' + (num === 0 ? '（自由）' : \`（\${num}問）\`);
      }
    }

    function switchTab(tabName) {
      ['dashboard', 'study', 'questions', 'stats'].forEach(t => {
        document.getElementById('tab-' + t).classList.add('hidden');
        const nav = document.getElementById('nav-' + t);
        if (nav) {
          nav.className = "flex flex-col items-center py-1 px-3 rounded-xl transition-all text-slate-500 hover:text-slate-800 font-medium";
        }
      });

      const activeTab = document.getElementById('tab-' + tabName);
      if (activeTab) activeTab.classList.remove('hidden');

      const activeNav = document.getElementById('nav-' + tabName);
      if (activeNav) {
        activeNav.className = "flex flex-col items-center py-1 px-3 rounded-xl transition-all text-mdt-primary font-bold scale-105";
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

    function checkResumeBanner() {
      const banner = document.getElementById('resume-banner');
      try {
        const savedSession = localStorage.getItem(SESSION_KEY);
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          if (parsed && parsed.currentIndex < parsed.questions.length) {
            banner.classList.remove('hidden');
            document.getElementById('resume-subtext').innerText =
              \`全\${parsed.questions.length}問中、\${parsed.currentIndex + 1}問目から途中再開可能です\`;
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

      const btnDue = document.getElementById('btn-start-due');
      const unseenGroup = document.getElementById('unseen-action-group');
      const allCompleted = document.getElementById('all-completed-banner');

      if (stats.dueCount > 0) {
        btnDue.classList.remove('hidden');
      } else {
        btnDue.classList.add('hidden');
      }

      if (stats.unseenCount > 0) {
        unseenGroup.classList.remove('hidden');
      } else {
        unseenGroup.classList.add('hidden');
      }

      if (stats.dueCount === 0 && stats.unseenCount === 0) {
        allCompleted.classList.remove('hidden');
      } else {
        allCompleted.classList.add('hidden');
      }

      const sourcesMap = {};
      QUESTIONS.forEach(q => {
        const src = q.source_title || q.category;
        if (!sourcesMap[src]) sourcesMap[src] = { total: 0, learned: 0, mastered: 0, due: 0, category: q.category };
        sourcesMap[src].total++;
        const p = userProgress[q.id];
        if (p && p.status !== 'unseen') {
          sourcesMap[src].learned++;
          if (p.intervalDays >= 7) sourcesMap[src].mastered++;
          if (p.nextDue <= Date.now()) {
            sourcesMap[src].due++;
          }
        }
      });

      const catListEl = document.getElementById('category-list');
      catListEl.innerHTML = '';

      Object.keys(sourcesMap).forEach(src => {
        const item = sourcesMap[src];
        const percent = item.total > 0 ? Math.round((item.learned / item.total) * 100) : 0;
        const row = document.createElement('div');
        row.className = "cursor-pointer group rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-blue-400 hover:bg-blue-50/30";
        row.onclick = () => openSelectModal(item.due > 0 ? 'due' : 'unseen', src);
        row.innerHTML = \`
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
            <div class="flex items-center space-x-2">
              <span class="rounded bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-mdt-primary">\${item.category}</span>
              <span class="text-sm font-bold text-slate-800 group-hover:text-mdt-primary transition">\${src}</span>
              \${item.due > 0 ? \`<span class="rounded-md bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-600">復習 \${item.due}問</span>\` : ''}
            </div>
            <div class="flex items-center space-x-3 text-xs">
              <span class="text-slate-500">進捗: <span class="text-slate-900 font-semibold">\${item.learned}</span> / \${item.total} 問</span>
              <span class="text-emerald-600 font-semibold">(定着: \${item.mastered}問)</span>
              <span class="font-bold text-mdt-primary">\${percent}%</span>
              <i data-lucide="chevron-right" class="h-4 w-4 text-slate-400 group-hover:text-mdt-primary transition"></i>
            </div>
          </div>
          <div class="h-2 w-full overflow-hidden rounded-full bg-slate-200 flex">
            <div style="width: \${percent}%" class="bg-gradient-to-r from-[#004B87] to-[#00A3E0] transition-all duration-500"></div>
          </div>
        \`;
        catListEl.appendChild(row);
      });
      lucide.createIcons();
    }

    function startDueSession() {
      const dueList = QUESTIONS.filter(q => {
        const p = userProgress[q.id];
        return p && p.status !== 'unseen' && p.nextDue <= Date.now();
      }).sort(() => Math.random() - 0.5);
      if (dueList.length > 0) {
        startSession(dueList, "本日復習");
      }
    }

    function startUnseenSession() {
      let unseenList = QUESTIONS.filter(q => {
        const p = userProgress[q.id];
        return !p || p.status === 'unseen';
      }).sort(() => Math.random() - 0.5);
      if (selectedQuota > 0 && selectedQuota < unseenList.length) {
        unseenList = unseenList.slice(0, selectedQuota);
      }
      if (unseenList.length > 0) {
        startSession(unseenList, "未学習演習");
      }
    }

    function quickStart() {
      const stats = getStats();
      if (stats.dueCount > 0) {
        startDueSession();
      } else if (stats.unseenCount > 0) {
        startUnseenSession();
      } else {
        const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, selectedQuota > 0 ? selectedQuota : QUESTIONS.length);
        startSession(shuffled, "総復習");
      }
    }

    function startSession(questions, modeName = "演習") {
      if (!questions || questions.length === 0) return;
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
      document.getElementById('card-back').classList.remove('flex');
      document.getElementById('study-complete-area').classList.add('hidden');
      document.getElementById('study-active-area').classList.remove('hidden');

      if (!currentSession || currentSession.currentIndex >= currentSession.questions.length) {
        finishSession(false);
        return;
      }

      const q = currentSession.questions[currentSession.currentIndex];
      const total = currentSession.questions.length;
      const idx = currentSession.currentIndex + 1;
      const pct = Math.round((currentSession.currentIndex / total) * 100);

      document.getElementById('study-counter').innerText = \`問題 \${idx}/\${total}問\`;
      document.getElementById('study-pct').innerText = \`(\${pct}%)\`;
      document.getElementById('study-bar').style.width = pct + '%';

      const earlyBtn = document.getElementById('btn-finish-early');
      if (currentSession.currentIndex > 0) {
        earlyBtn.classList.remove('hidden');
      } else {
        earlyBtn.classList.add('hidden');
      }

      const p = userProgress[q.id];
      const badgeEl = document.getElementById('card-status-badge');
      if (!p || p.status === 'unseen') {
        badgeEl.innerText = '未学習';
        badgeEl.className = 'rounded-lg px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold border bg-slate-100 text-slate-700 border-slate-300';
      } else if (p.intervalDays >= 7) {
        badgeEl.innerText = '7日後待機 (定着中)';
        badgeEl.className = 'rounded-lg px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200';
      } else if (p.intervalDays === 3) {
        badgeEl.innerText = '3日後復習';
        badgeEl.className = 'rounded-lg px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold border bg-amber-50 text-amber-700 border-amber-200';
      } else {
        badgeEl.innerText = '翌日復習 (1日後)';
        badgeEl.className = 'rounded-lg px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold border bg-rose-50 text-rose-700 border-rose-200';
      }

      document.getElementById('card-cat').innerText = q.category;
      document.getElementById('card-subcat').innerText = q.subcategory || q.source_title;
      document.getElementById('card-q').innerText = q.question;

      document.getElementById('card-cat-back').innerText = q.category;
      document.getElementById('card-q-back').innerText = 'Q. ' + q.question;
      document.getElementById('card-ans').innerText = q.answer;
      document.getElementById('card-ans-len').innerText = \`\${q.answer.length}文字\`;
      document.getElementById('card-src').innerText = \`出典: \${q.source_title}\`;

      lucide.createIcons();
    }

    function flipCard() {
      cardFlipped = !cardFlipped;
      const front = document.getElementById('card-front');
      const back = document.getElementById('card-back');
      if (cardFlipped) {
        front.classList.add('hidden');
        back.classList.remove('hidden');
        back.classList.add('flex');
      } else {
        front.classList.remove('hidden');
        back.classList.add('hidden');
        back.classList.remove('flex');
      }
      lucide.createIcons();
    }

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
        intervalDays = 1;
        newStatus = 'learning';
        currentSession.results.forgot++;
      } else if (rating === 'review_3d') {
        intervalDays = 3;
        newStatus = 'learning';
        currentSession.results.review_3d++;
      } else if (rating === 'remembered') {
        intervalDays = prev.intervalDays >= 7 ? 14 : 7;
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
        finishSession(false);
      }
    }

    function finishSessionEarly() {
      finishSession(true);
    }

    function finishSession(isEarly = false) {
      document.getElementById('study-active-area').classList.add('hidden');
      const completeArea = document.getElementById('study-complete-area');
      completeArea.classList.remove('hidden');

      if (currentSession && currentSession.results) {
        const totalAns = currentSession.results.forgot + currentSession.results.review_3d + currentSession.results.remembered;
        document.getElementById('res-total').innerText = totalAns;
        document.getElementById('res-forgot').innerText = currentSession.results.forgot;
        document.getElementById('res-3d').innerText = currentSession.results.review_3d;
        document.getElementById('res-rem').innerText = currentSession.results.remembered;
      }

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
      lucide.createIcons();
    }

    function backToHomeFromComplete() {
      localStorage.removeItem(SESSION_KEY);
      currentSession = null;
      switchTab('dashboard');
    }

    function continueUnseen() {
      const unseen = QUESTIONS.filter(q => {
        const p = userProgress[q.id];
        return !p || p.status === 'unseen';
      }).sort(() => Math.random() - 0.5);
      if (unseen.length === 0) {
        switchTab('dashboard');
        return;
      }
      startSession(unseen.slice(0, 15), "未学習継続");
    }

    // 問題選択モーダル
    let modalQuestionsList = [];
    let modalSelectedIds = new Set();

    function openSelectModal(mode, targetKey = 'ALL') {
      const modal = document.getElementById('select-modal');
      modal.classList.remove('hidden');
      modalSelectedIds.clear();

      const catSelect = document.getElementById('modal-cat-select');
      catSelect.innerHTML = '<option value="ALL">すべての分野・教材</option>';
      const categories = [...new Set(QUESTIONS.map(q => q.category))];
      categories.forEach(c => {
        catSelect.innerHTML += \`<option value="\${c}">領域: \${c}</option>\`;
      });
      const sources = [...new Set(QUESTIONS.map(q => q.source_title))];
      sources.forEach(s => {
        catSelect.innerHTML += \`<option value="SRC:\${s}">単元: \${s}</option>\`;
      });

      if (targetKey !== 'ALL') {
        if (categories.includes(targetKey)) {
          catSelect.value = targetKey;
        } else if (sources.includes(targetKey)) {
          catSelect.value = 'SRC:' + targetKey;
        }
      }

      document.getElementById('modal-title').innerText = mode === 'due' ? '本日の復習問題を選択' : '未学習問題を選択';
      catSelect.dataset.mode = mode;
      filterModalQuestions();
      lucide.createIcons();
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

      modalSelectedIds.clear();
      const initialLimit = (mode === 'due' || modalQuestionsList.length <= 20) ? modalQuestionsList.length : 15;
      modalQuestionsList.slice(0, initialLimit).forEach(q => modalSelectedIds.add(q.id));

      renderModalList();
    }

    function renderModalList() {
      const listEl = document.getElementById('modal-list');
      listEl.innerHTML = '';
      document.getElementById('modal-subtitle').innerText = \`出題する問題を選択してください（表示対象 \${modalQuestionsList.length} 問）\`;

      if (modalQuestionsList.length === 0) {
        listEl.innerHTML = '<div class="text-center py-8 text-xs text-slate-400">条件に一致する問題がありません。</div>';
        updateModalCounter();
        return;
      }

      modalQuestionsList.forEach(q => {
        const isSelected = modalSelectedIds.has(q.id);
        const item = document.createElement('div');
        item.className = \`flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl border text-xs cursor-pointer transition \${isSelected ? 'border-mdt-primary bg-blue-50/50 text-slate-900 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}\`;
        item.onclick = () => {
          if (modalSelectedIds.has(q.id)) {
            modalSelectedIds.delete(q.id);
          } else {
            modalSelectedIds.add(q.id);
          }
          renderModalList();
        };

        item.innerHTML = \`
          <input type="checkbox" \${isSelected ? 'checked' : ''} class="mt-0.5 h-4 w-4 rounded text-mdt-primary pointer-events-none" />
          <div class="flex-1 space-y-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="rounded bg-blue-50 text-mdt-primary border border-blue-200 px-2 py-0.5 text-[11px] font-semibold">\${q.category}</span>
              <span class="rounded bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 text-[11px]">\${q.subcategory}</span>
            </div>
            <p class="text-sm font-medium text-slate-800 leading-snug">\${q.question}</p>
          </div>
        \`;
        listEl.appendChild(item);
      });

      updateModalCounter();
    }

    function updateModalCounter() {
      document.getElementById('modal-selected-count').innerText = \`選択中: \${modalSelectedIds.size} 問\`;
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
      if (modalSelectedIds.size === 0) return;
      const selected = modalQuestionsList.filter(q => modalSelectedIds.has(q.id));
      closeSelectModal();
      startSession(selected, "カスタム選択演習");
    }

    function initQuestionBankFilter() {
      const catFilter = document.getElementById('q-cat-filter');
      if (catFilter.options.length > 0) return;
      catFilter.innerHTML = '<option value="ALL">全分野 (239問)</option>';
      const categories = [...new Set(QUESTIONS.map(q => q.category))];
      categories.forEach(c => {
        catFilter.innerHTML += \`<option value="\${c}">領域: \${c}</option>\`;
      });
      const sources = [...new Set(QUESTIONS.map(q => q.source_title))];
      sources.forEach(s => {
        catFilter.innerHTML += \`<option value="SRC:\${s}">単元: \${s}</option>\`;
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
        let statusBadge = '<span class="text-[11px] bg-slate-100 border border-slate-300 text-slate-700 px-2 py-0.5 rounded-md font-bold">未学習</span>';
        if (p && p.status !== 'unseen') {
          if (p.intervalDays >= 7) {
            statusBadge = '<span class="text-[11px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-md font-bold">定着済</span>';
          } else {
            statusBadge = '<span class="text-[11px] bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-md font-bold">復習中</span>';
          }
        }

        const card = document.createElement('div');
        card.className = "rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-2.5 shadow-sm hover:border-blue-400 transition-all";
        card.innerHTML = \`
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="rounded-md bg-blue-50 text-mdt-primary border border-blue-200 px-2.5 py-0.5 text-[11px] font-semibold">\${q.category}</span>
              <span class="rounded-md bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 text-[11px]">\${q.subcategory}</span>
              \${statusBadge}
            </div>
          </div>
          <p class="text-sm sm:text-base font-bold text-slate-900 leading-snug">\${q.question}</p>
          <details class="text-xs sm:text-sm pt-1 border-t border-slate-200 cursor-pointer">
            <summary class="text-mdt-primary font-semibold py-1">解答・論理解説を表示</summary>
            <div class="rounded-xl bg-emerald-50/70 border border-emerald-200 p-4 mt-2 text-slate-800 leading-relaxed whitespace-pre-wrap">
              \${q.answer}
              <div class="text-[11px] text-slate-500 mt-2 font-mono">文字数: \${q.answer.length}文字 | 出典: \${q.source_title}</div>
            </div>
          </details>
        \`;
        listEl.appendChild(card);
      });
    }

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

    window.addEventListener('DOMContentLoaded', () => {
      initData();
      setTimeout(() => {
        const overlay = document.getElementById('ecg-loading-overlay');
        if (overlay) {
          overlay.style.opacity = '0';
          setTimeout(() => overlay.remove(), 300);
        }
      }, 700);
    });

    window.addEventListener('keydown', (e) => {
      const studyTab = document.getElementById('tab-study');
      if (studyTab.classList.contains('hidden')) return;

      if (e.code === 'Space' || e.key === 'Enter') {
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
