"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function QrcodePage() {
  // 使用者輸入的網址
  const [url, setUrl] = useState("");
  // 按下按鈕後才會更新這個值，QR Code 只根據這個值產生（不是每打一個字就重畫）
  const [qrValue, setQrValue] = useState("");
  // 輸入格式錯誤時顯示的訊息
  const [error, setError] = useState("");

  const handleGenerate = () => {
    const trimmed = url.trim();

    if (!trimmed) {
      setError("請輸入網址");
      setQrValue("");
      return;
    }

    // 簡單檢查是否為合法網址，避免產生出沒有意義的 QR Code
    try {
      new URL(trimmed);
    } catch {
      setError("請輸入有效的網址，例如 https://example.com");
      setQrValue("");
      return;
    }

    setError("");
    setQrValue(trimmed);
  };

  return (
    <div className="flex min-h-screen flex-col items-center gap-8 bg-zinc-50 p-8 dark:bg-black">
      <div className="w-full max-w-xl">
        <h2 className="text-xl font-bold text-black dark:text-zinc-50">
          /qrcode QR Code 產生器
        </h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          輸入一個網址，按下按鈕後會在前端直接產生對應的 QR Code（使用
          qrcode.react 套件，不需要打後端 API）。
        </p>

        <div className="mt-4 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              placeholder="例如：https://example.com"
              className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />

            <button
              onClick={handleGenerate}
              disabled={!url.trim()}
              className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              產生 QR Code
            </button>
          </div>

          {error && (
            <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
          )}

          {qrValue && (
            <div className="mt-2 flex flex-col items-center gap-3 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <QRCodeSVG value={qrValue} size={200} />
              <span className="max-w-full break-all text-center text-sm text-zinc-500 dark:text-zinc-400">
                {qrValue}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
