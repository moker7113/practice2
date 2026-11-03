// 這支 API 接收前端選好的年齡、性別、地區、興趣、預算，呼叫 OpenAI 分析後回傳推薦的禮物類型
export async function POST(request: Request) {
  // 解析前端送來的 JSON body，取出使用者選擇的各項條件
  const { ageRange, gender, region, interest, budget } = await request.json();

  // 逐一檢查每個條件是否都有選，任一缺少就回傳 400 錯誤
  const fields = { ageRange, gender, region, interest, budget };
  for (const [key, value] of Object.entries(fields)) {
    if (!value || typeof value !== "string" || !value.trim()) {
      return Response.json({ error: `請選擇${key}` }, { status: 400 });
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
    // 把前端選的條件組成一句話，當作使用者訊息送給 OpenAI
    const userContent = `收禮者條件：年齡層 ${ageRange}、性別 ${gender}、地區 ${region}、興趣 ${interest}、預算 ${budget}。請根據這些條件推薦合適的送禮類型。`;

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
              '你是一位送禮顧問。根據使用者提供的收禮者年齡層、性別、地區、興趣與預算，推薦最適合的送禮類型。只能用 JSON 物件回答，格式固定為 {"giftType": "最推薦的禮物類型", "reason": "一到兩句中文說明為什麼適合", "alternatives": ["其他可考慮的禮物類型，共三個"]}，不要有任何其他文字。',
          },
          {
            // user 訊息放使用者實際選擇的條件
            role: "user",
            content: userContent,
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

    // 把這段 JSON 字串轉成真正的 JavaScript 物件，例如 { giftType: "...", reason: "...", alternatives: [...] }
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
