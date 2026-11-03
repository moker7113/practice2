// 判定「在線」的存活時間：超過這個毫秒數沒有再打 API，就視為離線
const ONLINE_TTL_MS = 10_000;
// 用 Map 記錄每個使用者（clientId）最後一次出現的時間戳記
const lastSeen = new Map<string, number>();

// 定義這支 API 的 GET 方法，request 是這次 HTTP 請求的物件
export async function GET(request: Request) {
  // 從請求網址中取出 query string（例如 ?clientId=xxx）
  const { searchParams } = new URL(request.url);
  // 取得前端帶來的 clientId，用來識別是哪一個瀏覽器分頁
  const clientId = searchParams.get("clientId");

  // 沒有帶 clientId 的話，回傳 400 錯誤，因為沒辦法記錄是誰在線
  if (!clientId) {
    return Response.json({ error: "缺少 clientId" }, { status: 400 });
  }

  // 取得目前時間的毫秒數時間戳記
  const now = Date.now();
  // 把這個 clientId 的最後出現時間更新成現在，代表他還在線上
  lastSeen.set(clientId, now);

  // 走訪整個 Map，把太久沒更新（超過 TTL）的使用者視為離線並刪除
  for (const [id, seenAt] of lastSeen) {
    // 用現在時間減去最後出現時間，超過門檻就清掉
    if (now - seenAt > ONLINE_TTL_MS) {
      lastSeen.delete(id);
    }
  }

  // 回傳目前 Map 裡還剩下的人數，也就是即時線上人數
  return Response.json({ online: lastSeen.size });
}
