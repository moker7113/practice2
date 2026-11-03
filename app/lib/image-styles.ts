// 圖片風格清單（前後端共用）
// 前端只送出 id，後端再依 id 查出對應的提示詞，避免使用者從前端塞入任意提示詞
export const IMAGE_STYLES = [
  {
    id: "anime",
    label: "動漫風",
    prompt: "動漫卡通風格，日系動畫插畫，鮮豔色彩，乾淨線條",
  },
  {
    id: "modern",
    label: "現代風",
    prompt: "現代簡約風格，俐落幾何線條，大量留白，中性色調搭配少量亮色點綴，時尚設計感",
  },
  {
    id: "muji",
    label: "無印風",
    prompt: "無印良品風格，自然素材質感，原木與米白、淺灰的低飽和色調，柔和自然光，簡樸寧靜",
  },
  {
    id: "cute",
    label: "可愛風",
    prompt: "可愛風格，圓潤造型，粉嫩馬卡龍色系，Q 版比例，柔和陰影，療癒感",
  },
  {
    id: "colorful",
    label: "繽紛風格",
    prompt: "繽紛多彩風格，高飽和撞色，活潑的色塊與圖案，充滿能量與歡樂氛圍",
  },
  {
    id: "luxury",
    label: "華麗風格",
    prompt: "華麗奢華風格，金色與深色寶石色調，精緻繁複的裝飾細節，戲劇性光影，高貴典雅",
  },
] as const;

export type ImageStyleId = (typeof IMAGE_STYLES)[number]["id"];

export const DEFAULT_STYLE_ID: ImageStyleId = "anime";

// 依 id 找出風格，找不到時回傳 undefined
export function findImageStyle(id: string) {
  return IMAGE_STYLES.find((s) => s.id === id);
}
