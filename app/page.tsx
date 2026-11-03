"use client";

import { useEffect, useState } from "react";
import ImageGenerator from "./components/image-generator";

export default function Home() {
  const [count, setCount] = useState<number | null>(null);
  const [counting, setCounting] = useState(false);

  const [onlineCount, setOnlineCount] = useState<number | null>(null);

  const [win, setWin] = useState<boolean | null>(null);
  const [drawing, setDrawing] = useState(false);

  const [numberInput, setNumberInput] = useState("");
  const [primeResult, setPrimeResult] = useState<boolean | null>(null);
  const [primeError, setPrimeError] = useState("");
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const clientId = crypto.randomUUID();
    let active = true;

    const ping = async () => {
      try {
        const res = await fetch(`/api/online?clientId=${clientId}`);
        const data = await res.json();
        if (active) setOnlineCount(data.online);
      } catch {
        // heartbeat 失敗就先忽略，下一次還會再打
      }
    };

    ping();
    const interval = setInterval(ping, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const handleHit = async () => {
    setCounting(true);
    try {
      const res = await fetch("/api/hello");
      const data = await res.json();
      setCount(data.count);
    } finally {
      setCounting(false);
    }
  };

  const handleDraw = async () => {
    setDrawing(true);
    try {
      const res = await fetch("/api/lottery");
      const data = await res.json();
      setWin(data.win);
    } finally {
      setDrawing(false);
    }
  };

  const handleCheckPrime = async () => {
    setChecking(true);
    setPrimeError("");
    setPrimeResult(null);
    try {
      const res = await fetch(`/api/prime?number=${encodeURIComponent(numberInput)}`);
      const data = await res.json();
      if (!res.ok) {
        setPrimeError(data.error ?? "發生錯誤");
        return;
      }
      setPrimeResult(data.isPrime);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center gap-8 bg-zinc-50 p-8 dark:bg-black">
      <ImageGenerator />

      <div className="w-full max-w-xl border-t border-zinc-200 pt-8 dark:border-zinc-800">
        <h2 className="text-xl font-bold text-black dark:text-zinc-50">
          /api/online 即時線上人數
        </h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          一進頁面就會打一次 /api/online，之後每 5 秒自動再打一次維持在線，超過 10
          秒沒動靜就會被視為離線並從人數中扣掉。
        </p>

        <div className="mt-4">
          <span className="text-lg font-semibold text-black dark:text-zinc-50">
            目前線上人數：{onlineCount ?? "-"}
          </span>
        </div>
      </div>

      <div className="w-full max-w-xl border-t border-zinc-200 pt-8 dark:border-zinc-800">
        <h2 className="text-xl font-bold text-black dark:text-zinc-50">
          /api/hello 按鈕計數器
        </h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          每按一次都會打一次 /api/hello，次數由伺服器計算並回傳。
        </p>

        <div className="mt-4 flex items-center gap-4">
          <button
            onClick={handleHit}
            disabled={counting}
            className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {counting ? "打 API 中…" : "打 /api/hello"}
          </button>

          <span className="text-lg font-semibold text-black dark:text-zinc-50">
            次數：{count ?? "-"}
          </span>
        </div>
      </div>

      <div className="w-full max-w-xl border-t border-zinc-200 pt-8 dark:border-zinc-800">
        <h2 className="text-xl font-bold text-black dark:text-zinc-50">
          /api/lottery 抽獎（中獎機率 30%）
        </h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          每按一次都會打一次 /api/lottery，由伺服器判定是否中獎。
        </p>

        <div className="mt-4 flex items-center gap-4">
          <button
            onClick={handleDraw}
            disabled={drawing}
            className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {drawing ? "抽獎中…" : "抽獎"}
          </button>

          {win !== null && (
            <span
              className={`text-lg font-semibold ${
                win ? "text-green-600 dark:text-green-400" : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              {win ? "🎉 中獎！" : "銘謝惠顧"}
            </span>
          )}
        </div>
      </div>

      <div className="w-full max-w-xl border-t border-zinc-200 pt-8 dark:border-zinc-800">
        <h2 className="text-xl font-bold text-black dark:text-zinc-50">
          /api/prime 質數判斷
        </h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          輸入一個數字，打 /api/prime 判斷是不是質數。
        </p>

        <div className="mt-4 flex items-center gap-4">
          <input
            type="text"
            value={numberInput}
            onChange={(e) => setNumberInput(e.target.value)}
            placeholder="例如：17"
            className="w-32 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          />

          <button
            onClick={handleCheckPrime}
            disabled={checking || !numberInput.trim()}
            className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {checking ? "檢查中…" : "檢查"}
          </button>

          {primeError && (
            <span className="text-sm text-red-600 dark:text-red-400">{primeError}</span>
          )}

          {primeResult !== null && (
            <span
              className={`text-lg font-semibold ${
                primeResult ? "text-green-600 dark:text-green-400" : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              {primeResult ? "是質數 ✓" : "不是質數"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
