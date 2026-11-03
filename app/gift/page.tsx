"use client";

import { useState } from "react";

// 分析結果的型別，對應後端 /api/gift 成功時回傳的 JSON 結構
type GiftResult = {
  giftType: string;
  reason: string;
  alternatives: string[];
};

// 各下拉選單的選項
const AGE_RANGES = ["10歲以下", "10-19歲", "20-29歲", "30-39歲", "40-49歲", "50-59歲", "60歲以上"];
const GENDERS = ["男性", "女性", "不限"];
const REGIONS = ["北部", "中部", "南部", "東部", "離島", "海外"];
const INTERESTS = ["閱讀", "運動", "遊戲", "音樂", "美妝保養", "烹飪美食", "科技3C", "旅遊", "手作", "寵物"];
const BUDGETS = ["500元以下", "500-1000元", "1000-3000元", "3000-5000元", "5000元以上"];

export default function GiftPage() {
  // 五個下拉選單目前選擇的值
  const [ageRange, setAgeRange] = useState("");
  const [gender, setGender] = useState("");
  const [region, setRegion] = useState("");
  const [interest, setInterest] = useState("");
  const [budget, setBudget] = useState("");

  // 是否正在打 API，用來讓按鈕顯示 loading 狀態並避免重複送出
  const [loading, setLoading] = useState(false);
  // 分析成功後的結果
  const [result, setResult] = useState<GiftResult | null>(null);
  // 錯誤訊息（例如沒選完全部條件、OpenAI 呼叫失敗等）
  const [error, setError] = useState("");

  // 是否所有下拉選單都已選擇
  const allSelected = ageRange && gender && region && interest && budget;

  const handleRecommend = async () => {
    // 送出前先清掉上一次的結果與錯誤訊息
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch("/api/gift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ageRange, gender, region, interest, budget }),
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
          /api/gift AI 禮物推薦
        </h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          選擇收禮者的年齡層、性別、地區、興趣與預算，按下按鈕後會打 /api/gift，由
          OpenAI 分析後推薦合適的送禮類型。
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select label="年齡層" value={ageRange} onChange={setAgeRange} options={AGE_RANGES} />
          <Select label="性別" value={gender} onChange={setGender} options={GENDERS} />
          <Select label="地區" value={region} onChange={setRegion} options={REGIONS} />
          <Select label="興趣" value={interest} onChange={setInterest} options={INTERESTS} />
          <Select label="預算" value={budget} onChange={setBudget} options={BUDGETS} />
        </div>

        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={handleRecommend}
            disabled={loading || !allSelected}
            className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {loading ? "推薦中…" : "推薦禮物"}
          </button>

          {error && (
            <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
          )}
        </div>

        {result && (
          <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="text-2xl font-bold text-black dark:text-zinc-50">
              🎁 {result.giftType}
            </div>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {result.reason}
            </p>

            {result.alternatives?.length > 0 && (
              <div className="mt-4">
                <span className="text-sm font-semibold text-black dark:text-zinc-50">
                  其他選擇：
                </span>
                <ul className="mt-1 list-inside list-disc text-sm text-zinc-600 dark:text-zinc-400">
                  {result.alternatives.map((alt) => (
                    <li key={alt}>{alt}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// 共用的下拉選單元件
function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-black dark:text-zinc-50">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
      >
        <option value="">請選擇</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
