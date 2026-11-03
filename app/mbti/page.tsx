"use client";

import { useState } from "react";

// 分析結果的型別，對應後端 /api/mbti 成功時回傳的 JSON 結構
type MbtiResult = {
  mbti: string;
  reason: string;
};

export default function MbtiPage() {
  // 使用者輸入的個性描述
  const [description, setDescription] = useState("");
  // 是否正在打 API，用來讓按鈕顯示 loading 狀態並避免重複送出
  const [loading, setLoading] = useState(false);
  // 分析成功後的結果
  const [result, setResult] = useState<MbtiResult | null>(null);
  // 錯誤訊息（例如沒輸入文字、OpenAI 呼叫失敗等）
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    // 送出前先清掉上一次的結果與錯誤訊息
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch("/api/mbti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "發生錯誤");
        return;
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生未知錯誤");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center gap-8 bg-zinc-50 p-8 dark:bg-black">
      <div className="w-full max-w-xl">
        <h2 className="text-xl font-bold text-black dark:text-zinc-50">
          /api/mbti AI 性格分析
        </h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          用文字描述一下自己的個性，按下按鈕後會打 /api/mbti，由 OpenAI
          分析後回傳最符合的 MBTI 十六型人格。
        </p>

        <div className="mt-4 flex flex-col gap-4">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="例如：我喜歡獨處思考，做決定前會反覆分析利弊，不太擅長臨場社交..."
            rows={5}
            className="w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          />

          <div className="flex items-center gap-4">
            <button
              onClick={handleAnalyze}
              disabled={loading || !description.trim()}
              className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              {loading ? "分析中…" : "開始分析"}
            </button>

            {error && (
              <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
            )}
          </div>

          {result && (
            <div className="mt-2 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="text-2xl font-bold text-black dark:text-zinc-50">
                {result.mbti}
              </div>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {result.reason}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
