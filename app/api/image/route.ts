// 這支 API 接收前端傳來的圖片描述文字，呼叫 OpenAI 的文生圖 API 產生動漫卡通風格的圖片
export async function POST(request: Request) {
  // 解析前端送來的 JSON body，取出使用者輸入的圖片描述
  const { description } = await request.json();

  // 檢查描述是否存在、是不是字串、去除空白後是否為空，任一不符就回傳 400 錯誤
  if (!description || typeof description !== "string" || !description.trim()) {
    return Response.json({ error: "請輸入圖片描述" }, { status: 400 });
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
    const prompt = `${description}，動漫卡通風格，日系動畫插畫，鮮豔色彩，乾淨線條`;

    // 呼叫 OpenAI 的 Images API 產生圖片
    const openaiRes = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 用 Bearer Token 的方式帶入 API Key 做身份驗證
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        // 使用 OpenAI 的文生圖模型
        model: "gpt-image-2",
        prompt,
        size: "1024x1024",
        n: 1,
      }),
    });

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
