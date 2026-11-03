// 定義這支 API 的 GET 方法
export async function GET() {
  // Math.random() 會產生 0 (含) 到 1 (不含) 之間的亂數
  // 小於 0.3 的機率是 30%，符合三成中獎率
  const win = Math.random() < 0.3;
  // 回傳 JSON，告訴前端這次抽獎是否中獎
  return Response.json({ win });
}
