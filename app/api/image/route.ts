// 這支 API 接收前端傳來的圖片描述文字（以及可選的參考圖片），呼叫 OpenAI 產生動漫卡通風格的圖片
// - 只有文字：呼叫文生圖 API（/v1/images/generations）
// - 文字 + 圖片：呼叫圖片編輯 API（/v1/images/edits），以上傳的圖片為基礎結合文字描述生成

// 使用的 OpenAI 圖片模型
const MODEL = "gpt-image-2";
// 允許上傳的圖片格式（OpenAI 圖片編輯 API 支援 png / jpg / webp）
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
// 上傳圖片大小上限：10MB（OpenAI 上限為 25MB，這裡保守一點避免上傳過久）
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export async function POST(request: Request) {
  // 前端以 multipart/form-data 送出，才能同時帶文字與圖片檔
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "請求格式錯誤" }, { status: 400 });
  }

  // 取出使用者輸入的圖片描述
  const description = form.get("description");
  // 取出使用者上傳的圖片（沒上傳時會是 null）
  const image = form.get("image");

  // 檢查描述是否存在、是不是字串、去除空白後是否為空，任一不符就回傳 400 錯誤
  if (typeof description !== "string" || !description.trim()) {
    return Response.json({ error: "請輸入圖片描述" }, { status: 400 });
  }

  // 有上傳圖片的話，檢查格式與大小
  const hasImage = image instanceof File && image.size > 0;
  if (hasImage) {
    if (!ALLOWED_TYPES.includes(image.type)) {
      return Response.json({ error: "只支援 PNG、JPG、WebP 圖片" }, { status: 400 });
    }
    if (image.size > MAX_IMAGE_BYTES) {
      return Response.json({ error: "圖片不能超過 10MB" }, { status: 400 });
    }
  }

  // 從環境變數讀取 OpenAI 的 API Key（放在 .env.local，不會外流到前端）
  const apiKey = process.env.OPENAI_API_KEY;

  // 沒有設定 Key 的話直接回傳 500，提醒開發者去設定
  if (!apiKey) {
    return Response.json(
      { error: "伺服器尚未設定 OPENAI_API_KEY，請在 .env.local 中設定" },
      { status: 500 },
    );
  }

  try {
    // 在使用者描述後面統一加上風格指定，讓每次生成都是動漫卡通風格
    const prompt = hasImage
      ? `以這張圖片為基礎：${description}，動漫卡通風格，日系動畫插畫，鮮豔色彩，乾淨線條`
      : `${description}，動漫卡通風格，日系動畫插畫，鮮豔色彩，乾淨線條`;

    let openaiRes: Response;

    if (hasImage) {
      // 有圖片：呼叫圖片編輯 API，必須用 multipart/form-data 上傳圖片檔
      const body = new FormData();
      body.append("model", MODEL);
      body.append("prompt", prompt);
      body.append("size", "1024x1024");
      body.append("n", "1");
      body.append("image", image, image.name);

      openaiRes = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        // 不要手動設定 Content-Type，讓 fetch 自動帶上 multipart 的 boundary
        headers: { Authorization: `Bearer ${apiKey}` },
        body,
      });
    } else {
      // 沒有圖片：呼叫原本的文生圖 API
      openaiRes = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 用 Bearer Token 的方式帶入 API Key 做身份驗證
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model: MODEL, prompt, size: "1024x1024", n: 1 }),
      });
    }

    // 把 OpenAI 回傳的內容解析成 JSON
    const openaiData = await openaiRes.json();

    // 如果 OpenAI 回應失敗（例如 Key 錯誤、額度不足），把錯誤訊息轉傳給前端
    if (!openaiRes.ok) {
      return Response.json(
        { error: openaiData?.error?.message || "呼叫 OpenAI 失敗" },
        { status: openaiRes.status },
      );
    }

    // 這個環境的 Images API 不接受 response_format 參數，直接看回傳內容是 b64_json 還是 url
    const b64 = openaiData.data?.[0]?.b64_json;
    // 保留 url 當作備援（有些版本預設會回傳可直接存取的圖片網址）
    const url = openaiData.data?.[0]?.url;

    if (!b64 && !url) {
      return Response.json({ error: "OpenAI 沒有回傳圖片內容" }, { status: 500 });
    }

    // 把 base64 組成可以直接放進 <img src> 的 data URL；若是回傳 url 就直接使用
    const imageUrl = b64 ? `data:image/png;base64,${b64}` : url;

    // 把圖片網址回傳給前端
    return Response.json({ imageUrl });
  } catch (err) {
    // 任何過程中發生的錯誤（網路問題、額度不足等）都在這裡統一處理
    return Response.json(
      { error: err instanceof Error ? err.message : "發生未知錯誤" },
      { status: 500 },
    );
  }
}
