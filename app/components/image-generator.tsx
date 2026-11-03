"use client";

import { useState } from "react";

// 文生圖區塊：首頁與 /image 頁共用
export default function ImageGenerator() {
  // 使用者輸入的圖片描述
  const [description, setDescription] = useState("");
  // 是否正在打 API，用來讓按鈕顯示 loading 狀態並避免重複送出（圖片生成通常比較久）
  const [loading, setLoading] = useState(false);
  // 生成成功後的圖片網址（可能是 data URL 或一般 URL）
  const [imageUrl, setImageUrl] = useState("");
  // 錯誤訊息（例如沒輸入文字、OpenAI 呼叫失敗等）
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    // 送出前先清掉上一次的結果與錯誤訊息
    setError("");
    setImageUrl("");
    setLoading(true);

    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "發生錯誤");
        return;
      }

      setImageUrl(data.imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生未知錯誤");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl">
      <h2 className="text-xl font-bold text-black dark:text-zinc-50">
        /api/image AI 動漫風格繪圖
      </h2>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        描述一段你想要的畫面，按下按鈕後會打 /api/image，由 OpenAI
        生成一張動漫卡通風格的圖片（生成需要一點時間，請耐心等候）。
      </p>

      <div className="mt-4 flex flex-col gap-4">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="例如：一隻戴著帽子的橘貓坐在窗邊看夕陽"
          rows={4}
          className="w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
        />

        <div className="flex items-center gap-4">
          <button
            onClick={handleGenerate}
            disabled={loading || !description.trim()}
            className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {loading ? "生成中…" : "產生圖片"}
          </button>

          {error && (
            <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
          )}
        </div>

        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- data URL 來自 base64，不需要 next/image 的最佳化
          <img
            src={imageUrl}
            alt={description}
            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800"
          />
        )}
      </div>
    </div>
  );
}
