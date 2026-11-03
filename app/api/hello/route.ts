// 模組層級的變數，伺服器啟動後會一直存在記憶體中，直到重啟才會歸零
let count = 0;

// 定義這支 API 的 GET 方法（對應瀏覽器或 fetch 送出的 GET 請求）
export async function GET() {
  // 每被呼叫一次，計數器就加 1
  count += 1;
  // 用 Response.json 回傳 JSON 格式的回應，內含歡迎訊息與目前累計次數
  return Response.json({ message: "歡迎來到這門課", count });
}
