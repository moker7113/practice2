// 判斷一個數字是不是質數的輔助函式
function isPrime(n: number): boolean {
  // 質數必須是整數，且必須大於等於 2，不符合就直接回傳 false
  if (!Number.isInteger(n) || n < 2) return false;
  // 2 是最小的質數，特別處理直接回傳 true
  if (n === 2) return true;
  // 除了 2 以外的偶數都不是質數（能被 2 整除）
  if (n % 2 === 0) return false;
  // 從 3 開始，只需檢查到 sqrt(n)，每次加 2（只檢查奇數，因為偶數已排除）
  for (let i = 3; i * i <= n; i += 2) {
    // 如果 n 能被 i 整除，代表 n 不是質數
    if (n % i === 0) return false;
  }
  // 迴圈跑完都沒找到因數，代表是質數
  return true;
}

// 定義這支 API 的 GET 方法，request 是這次 HTTP 請求的物件
export async function GET(request: Request) {
  // 從請求網址中取出 query string（例如 ?number=17）
  const { searchParams } = new URL(request.url);
  // 取得 number 這個參數的原始字串值，沒有的話會是 null
  const raw = searchParams.get("number");

  // 檢查參數是否存在、是否為空字串、轉成數字後是否為 NaN，任一成立就回傳 400 錯誤
  if (raw === null || raw.trim() === "" || Number.isNaN(Number(raw))) {
    return Response.json({ error: "請提供有效的數字" }, { status: 400 });
  }

  // 把字串轉成數字型別，方便後續運算
  const number = Number(raw);
  // 回傳原始數字，以及呼叫 isPrime 判斷後的結果
  return Response.json({ number, isPrime: isPrime(number) });
}
