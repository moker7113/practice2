"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// 折線圖的配色：淺色/深色模式各一組，數值本身只有一條線（單一序列不需要圖例）
const PALETTE = {
  light: {
    line: "#2a78d6",
    grid: "#e1e0d9",
    axis: "#898781",
    baseline: "#c3c2b7",
    tooltipBg: "#ffffff",
    tooltipBorder: "rgba(11,11,11,0.10)",
    textPrimary: "#0b0b0b",
    textSecondary: "#52514e",
  },
  dark: {
    line: "#3987e5",
    grid: "#2c2c2a",
    axis: "#898781",
    baseline: "#383835",
    tooltipBg: "#18181b",
    tooltipBorder: "rgba(255,255,255,0.10)",
    textPrimary: "#ffffff",
    textSecondary: "#c3c2b7",
  },
};

type DataPoint = {
  month: string;
  value: number;
};

// 產生一組假的月份資料（帶一點隨機波動，看起來比較像真實趨勢）
function generateFakeData(): DataPoint[] {
  const months = Array.from({ length: 12 }, (_, i) => `${i + 1}月`);
  let base = 50 + Math.random() * 30;

  return months.map((month) => {
    // 讓數值在前一個基準上下小幅波動，模擬有趨勢感的假資料
    base += (Math.random() - 0.45) * 20;
    base = Math.max(10, Math.min(100, base));
    return { month, value: Math.round(base) };
  });
}

// 自訂 Tooltip：數值用粗體大字當主角，月份當輔助說明，符合「數值先於標籤」的原則
function ChartTooltip({
  active,
  payload,
  label,
  colors,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  colors: typeof PALETTE.light;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: colors.tooltipBg,
        border: `1px solid ${colors.tooltipBorder}`,
        borderRadius: 8,
        padding: "8px 12px",
      }}
    >
      <div style={{ fontSize: 12, color: colors.textSecondary }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: colors.textPrimary }}>
        {payload[0].value}
      </div>
    </div>
  );
}

export default function ChartPage() {
  // 折線圖資料，一開始就先產生一組假資料
  const [data, setData] = useState<DataPoint[]>(() => generateFakeData());
  // 是否為深色模式，跟著作業系統設定走
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(mq.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  const colors = useMemo(() => (isDark ? PALETTE.dark : PALETTE.light), [isDark]);

  return (
    <div className="flex min-h-screen flex-col items-center gap-8 bg-zinc-50 p-8 dark:bg-black">
      <div className="w-full max-w-2xl">
        <h2 className="text-xl font-bold text-black dark:text-zinc-50">
          /chart 假資料折線圖（recharts）
        </h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          用 recharts 套件畫出一條折線圖，資料是前端隨機產生的假資料，滑鼠移到線上可以看到當月數值。
        </p>

        <div className="mt-4 flex items-center gap-4">
          <button
            onClick={() => setData(generateFakeData())}
            className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            重新產生假資料
          </button>
        </div>

        <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
              <CartesianGrid
                stroke={colors.grid}
                strokeDasharray="0"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                stroke={colors.baseline}
                tick={{ fill: colors.axis, fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                stroke={colors.baseline}
                tick={{ fill: colors.axis, fontSize: 12 }}
                tickLine={false}
                width={32}
              />
              <Tooltip
                cursor={{ stroke: colors.baseline, strokeWidth: 1 }}
                content={<ChartTooltip colors={colors} />}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={colors.line}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                dot={{ r: 4, fill: colors.line, stroke: colors.tooltipBg, strokeWidth: 2 }}
                activeDot={{ r: 6, fill: colors.line, stroke: colors.tooltipBg, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
