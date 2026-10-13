import fs from "fs";
import path from "path";

const API_KEY = "AIzaSyAA9MGvzk1bRstLBd1MXjat-vG4aTlU8n8";

const PROGRESS_JSON_PATH = path.resolve(
  process.cwd(),
  "output/medtronic_generated_progress.json"
);
const FINAL_QUESTIONS_PATH = path.resolve(
  process.cwd(),
  "output/medtronic_questions.json"
);

const LECTURE_DIRS = [
  { category: "Medtronic CRT", dir: "Medtronic CRT" },
  { category: "Medtronic ICD", dir: "Medtronic ICD" },
];

function getAllLectureFiles() {
  const files = [];
  for (const { category, dir } of LECTURE_DIRS) {
    const fullDir = path.resolve(process.cwd(), dir);
    if (!fs.existsSync(fullDir)) continue;
    const entries = fs.readdirSync(fullDir);
    for (const entry of entries) {
      if (entry.endsWith(".txt")) {
        const fullPath = path.join(fullDir, entry);
        const text = fs.readFileSync(fullPath, "utf-8").trim();
        const baseTitle = entry.replace(/_01_intro\.txt$/, "").replace(/\.txt$/, "");
        files.push({
          category,
          fileName: entry,
          filePath: fullPath,
          title: baseTitle,
          text,
          charCount: text.length,
        });
      }
    }
  }
  return files;
}

async function callGemini(promptText, modelName = "gemini-2.5-flash") {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;
  const body = {
    contents: [{ parts: [{ text: promptText }] }],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.25,
      thinkingConfig: {
        thinkingBudget: 0,
      },
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Empty response from Gemini");
  }
  return JSON.parse(text);
}

function buildPrompt(item, targetCount = 12) {
  return `あなたは不整脈治療専門臨床工学技士および医療系国家試験・専門資格対策のエキスパートです。
以下の【講義テキスト】を読み込み、アクティブリコール（自力想起訓練）に最適な「1問1答形式（選択肢なし）」の問題データを【必ず${targetCount}問】作成してください。

【厳格な出力要件】
1. 出題数: このテキストの重要ポイントを網羅して【必ず${targetCount}問】作成すること。
2. 問題文（question）:
   - 選択肢に頼らず頭の中で知識・根拠・数値を思い出させる「自力想起（アクティブリコール）」形式にすること。
   - 曖昧な問い方を排除し、「〇〇の解剖学的特徴と臨床的意義について説明せよ。」「〇〇が生じるメカニズムと具体的な対処法を述べよ。」「〇〇の基準値とその根拠を答えよ。」など、脳に負荷をかける明確で具体的な問いかけにすること。
3. 解答・解説（answer）:
   - 文字数は【必ず150文字〜200文字程度（厳密に145〜210文字の範囲内）】で作成すること。短すぎても長すぎてもいけません。
   - 単なる結論の単語だけでなく、「なぜそうなるのか（電気生理学的・解剖学的メカニズム、具体的な数値・基準値、臨床上の注意点）」を論理的に凝縮して記述すること。
   - 強調記号のアスタリスク2つは無効なため一切使用しないこと。
4. サブカテゴリ（subcategory）と難易度（difficulty）:
   - subcategory: 設問の具体的なテーマ（例: 右房拡大とガイディングカテーテル選択）
   - difficulty: 1（基礎）、2（標準）、3（発展）の数値

【出力フォーマット】
以下のJSON配列のみを出力してください:
[
  {
    "subcategory": "詳細テーマ",
    "difficulty": 2,
    "question": "問題文",
    "answer": "150〜200文字の論理的な解答・解説"
  }
]

【講義テキスト (${item.title})】:
${item.text}`;
}

function cleanAnswerText(ans) {
  let cleaned = ans.replace(/\*\*/g, "").replace(/\*/g, "").trim();
  return cleaned;
}

async function processAll() {
  const lectureFiles = getAllLectureFiles();
  console.log(`講義ファイル総数: ${lectureFiles.length}`);

  let progressMap = {};
  if (fs.existsSync(PROGRESS_JSON_PATH)) {
    try {
      progressMap = JSON.parse(fs.readFileSync(PROGRESS_JSON_PATH, "utf-8"));
      console.log(`既存の進捗をロード: ${Object.keys(progressMap).length}件完了済`);
    } catch (e) {
      console.log("既存進捗の読み込みエラー、新規作成します");
    }
  }

  let totalQuestionsCount = 0;

  for (let i = 0; i < lectureFiles.length; i++) {
    const item = lectureFiles[i];
    const key = `${item.category}__${item.fileName}`;

    if (progressMap[key] && progressMap[key].questions && progressMap[key].questions.length > 0) {
      console.log(`[スキップ ${i + 1}/${lectureFiles.length}] 既に生成済み: ${item.title}`);
      totalQuestionsCount += progressMap[key].questions.length;
      continue;
    }

    let targetCount = 12;
    if (item.charCount < 1800) targetCount = 8;
    else if (item.charCount < 3000) targetCount = 10;
    else if (item.charCount > 7000) targetCount = 15;
    else if (item.charCount > 5000) targetCount = 13;

    console.log(`[生成開始 ${i + 1}/${lectureFiles.length}] ${item.title} (文字数: ${item.charCount}, 目標出題数: ${targetCount})`);

    const prompt = buildPrompt(item, targetCount);
    let success = false;
    let questions = [];

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const rawResult = await callGemini(prompt);
        if (Array.isArray(rawResult) && rawResult.length > 0) {
          questions = rawResult.map((q, idx) => ({
            id: `MD_${item.category.includes("CRT") ? "CRT" : "ICD"}_${String(i + 1).padStart(2, "0")}_${String(idx + 1).padStart(2, "0")}`,
            category: item.category,
            source_title: item.title,
            subcategory: q.subcategory || item.title,
            difficulty: q.difficulty || 2,
            question: q.question.trim(),
            answer: cleanAnswerText(q.answer),
          }));
          success = true;
          break;
        }
      } catch (err) {
        console.warn(`試行 ${attempt} 失敗: ${err.message}`);
        await new Promise((res) => setTimeout(res, 2000));
      }
    }

    if (!success) {
      console.error(`エラー: ${item.title} の問題生成に失敗しました`);
      continue;
    }

    progressMap[key] = {
      category: item.category,
      title: item.title,
      questions,
    };

    fs.writeFileSync(PROGRESS_JSON_PATH, JSON.stringify(progressMap, null, 2), "utf-8");
    totalQuestionsCount += questions.length;
    console.log(`  -> 成功: ${questions.length}問生成完了 (累計: ${totalQuestionsCount}問)`);

    // レートリミット対策で1秒待機
    await new Promise((res) => setTimeout(res, 1000));
  }

  // 全問題をフラット化してまとめる
  const allFinalQuestions = [];
  for (const k of Object.keys(progressMap)) {
    if (progressMap[k].questions) {
      allFinalQuestions.push(...progressMap[k].questions);
    }
  }

  // IDの重複がないか再採番
  const formattedQuestions = allFinalQuestions.map((q, idx) => ({
    ...q,
    id: `MQ_${String(idx + 1).padStart(4, "0")}`,
  }));

  fs.writeFileSync(FINAL_QUESTIONS_PATH, JSON.stringify(formattedQuestions, null, 2), "utf-8");
  console.log(`\n===========================================`);
  console.log(`全処理完了! 生成問題数: ${formattedQuestions.length}問`);
  console.log(`保存先: ${FINAL_QUESTIONS_PATH}`);
  console.log(`===========================================\n`);
}

processAll().catch(console.error);
