// 這支 API 接收前端傳來的個性描述文字，呼叫 OpenAI 分析後回傳 MBTI 結果
export async function POST(request: Request) {
  // 解析前端送來的 JSON body，取出使用者輸入的個性描述
  const { description } = await request.json();

  // 檢查描述是否存在、是不是字串、去除空白後是否為空，任一不符就回傳 400 錯誤
  if (!description || typeof description !== "string" || !description.trim()) {
    return Response.json({ error: "請輸入個性描述" }, { status: 400 });
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
    // 呼叫 OpenAI 的 Chat Completions API
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 用 Bearer Token 的方式帶入 API Key 做身份驗證
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        // 使用的模型
        model: "gpt-4o-mini",
        // 要求 OpenAI 一定要回傳合法的 JSON 物件
        response_format: { type: "json_object" },
        messages: [
          {
            // system 訊息用來設定 AI 的角色與輸出規則
            role: "system",
            content:
              '你是一位 MBTI 性格分析師。根據使用者描述自己的文字，判斷最符合的 MBTI 十六型人格之一。只能用 JSON 物件回答，格式固定為 {"mbti": "四個字母的型別", "reason": "一到兩句中文說明為什麼"}，不要有任何其他文字。',
          },
          {
            // user 訊息放使用者實際輸入的個性描述
            role: "user",
            content: description,
          },
        ],
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

    // 取出模型實際生成的文字內容（因為要求 json_object，這裡會是一段 JSON 字串）
    const content = openaiData.choices?.[0]?.message?.content;

    // 把這段 JSON 字串轉成真正的 JavaScript 物件，例如 { mbti: "INTJ", reason: "..." }
    const result = JSON.parse(content);

    // 把分析結果回傳給前端
    return Response.json(result);
  } catch (err) {
    // 任何過程中發生的錯誤（網路問題、JSON 解析失敗等）都在這裡統一處理
    return Response.json(
      { error: err instanceof Error ? err.message : "發生未知錯誤" },
      { status: 500 },
    );
  }
}
