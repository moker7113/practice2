"use client";

import { useEffect, useRef, useState } from "react";
import { DEFAULT_STYLE_ID, IMAGE_STYLES, type ImageStyleId } from "@/app/lib/image-styles";

// 允許上傳的圖片格式與大小上限（需與 /api/image 後端一致）
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

// 文生圖區塊：首頁與 /image 頁共用
// 可只輸入文字，也可再上傳一張參考圖片，讓 AI 以圖片為基礎結合文字生成
export default function ImageGenerator() {
  // 使用者輸入的圖片描述
  const [description, setDescription] = useState("");
  // 使用者選擇的圖片風格
  const [style, setStyle] = useState<ImageStyleId>(DEFAULT_STYLE_ID);
  // 使用者上傳的參考圖片（可選）
  const [refImage, setRefImage] = useState<File | null>(null);
  // 參考圖片的預覽網址（用 URL.createObjectURL 產生）
  const [previewUrl, setPreviewUrl] = useState("");
  // 是否有檔案正被拖曳到上傳區上方，用來改變框線顏色
  const [dragging, setDragging] = useState(false);
  // 是否正在打 API，用來讓按鈕顯示 loading 狀態並避免重複送出（圖片生成通常比較久）
  const [loading, setLoading] = useState(false);
  // 生成成功後的圖片網址（可能是 data URL 或一般 URL）
  const [imageUrl, setImageUrl] = useState("");
  // 錯誤訊息（例如沒輸入文字、圖片格式不對、OpenAI 呼叫失敗等）
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 預覽網址換掉或元件卸載時，釋放舊的 object URL，避免記憶體洩漏
  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  // 選擇（或拖入）圖片後先在前端檢查格式與大小，通過才設為參考圖片
  const selectFile = (file: File | undefined) => {
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("只支援 PNG、JPG、WebP 圖片");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("圖片不能超過 10MB");
      return;
    }
    setError("");
    setRefImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // 移除參考圖片，回到純文字生圖
  const removeFile = () => {
    setRefImage(null);
    setPreviewUrl("");
    // 清掉 input 的值，這樣重新選同一張圖也會觸發 onChange
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGenerate = async () => {
    // 送出前先清掉上一次的結果與錯誤訊息
    setError("");
    setImageUrl("");
    setLoading(true);

    try {
      // 用 FormData 才能同時送出文字與圖片檔
      const body = new FormData();
      body.append("description", description);
      body.append("style", style);
      if (refImage) body.append("image", refImage);

      const res = await fetch("/api/image", { method: "POST", body });

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
        /api/image AI 繪圖
      </h2>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        描述一段你想要的畫面並選擇風格，也可以再放一張參考圖片，AI 會以圖片為基礎結合你的文字
        生成圖片（生成需要一點時間，請耐心等候）。
      </p>

      <div className="mt-4 flex flex-col gap-4">
        {/* 風格選擇 */}
        <div role="radiogroup" aria-label="圖片風格" className="flex flex-wrap gap-2">
          {IMAGE_STYLES.map((s) => (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={style === s.id}
              onClick={() => setStyle(s.id)}
              disabled={loading}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors disabled:opacity-50 ${
                style === s.id
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={
            refImage
              ? "例如：把照片裡的人變成魔法師，背景換成城堡"
              : "例如：一隻戴著帽子的橘貓坐在窗邊看夕陽"
          }
          rows={4}
          className="w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
        />

        {/* 參考圖片：已選擇時顯示預覽，否則顯示可點擊/拖曳的上傳區 */}
        {previewUrl ? (
          <div className="flex items-center gap-4 rounded-lg border border-zinc-300 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
            {/* eslint-disable-next-line @next/next/no-img-element -- 本機預覽用的 object URL，不需要 next/image */}
            <img
              src={previewUrl}
              alt="參考圖片預覽"
              className="h-20 w-20 rounded-md object-cover"
            />
            <div className="min-w-0 flex-1 text-sm">
              <p className="truncate font-medium text-black dark:text-zinc-50">
                {refImage?.name}
              </p>
              <p className="text-zinc-500 dark:text-zinc-400">
                參考圖片（{((refImage?.size ?? 0) / 1024 / 1024).toFixed(1)} MB）
              </p>
            </div>
            <button
              onClick={removeFile}
              disabled={loading}
              className="rounded-lg px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              移除
            </button>
          </div>
        ) : (
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              selectFile(e.dataTransfer.files[0]);
            }}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center text-sm transition-colors ${
              dragging
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                : "border-zinc-300 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-600"
            }`}
          >
            <span className="font-medium text-black dark:text-zinc-50">
              點擊或拖曳圖片到這裡（可選）
            </span>
            <span className="mt-1 text-zinc-500 dark:text-zinc-400">
              支援 PNG、JPG、WebP，最大 10MB
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_TYPES.join(",")}
              onChange={(e) => selectFile(e.target.files?.[0])}
              className="sr-only"
            />
          </label>
        )}

        <div className="flex items-center gap-4">
          <button
            onClick={handleGenerate}
            disabled={loading || !description.trim()}
            className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {loading ? "生成中…" : refImage ? "以圖片＋文字生成" : "產生圖片"}
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
