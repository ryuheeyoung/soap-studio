import type { Difficulty, IngredientCategory, ProcessType, Unit } from "./index";

// 재료 카테고리 한글 표시 레이블 (배지·헤더 등 UI 표시용)
export const INGREDIENT_CATEGORY_LABELS: Record<IngredientCategory, string> = {
  soap_base: "비누베이스",
  oil: "오일",
  butter: "버터",
  lye: "가성소다/가성가리",
  water: "수분류",
  surfactant: "계면활성제",
  emulsifier: "유화제",
  powder: "분말류",
  additive: "첨가물",
  essential_oil: "에센셜오일",
  colorant: "색소",
  other: "기타",
};

// 카테고리 표시 순서 (재료 목록·계산기 그룹 정렬 기준)
export const INGREDIENT_CATEGORY_ORDER: IngredientCategory[] = [
  "soap_base",
  "oil",
  "butter",
  "lye",
  "water",
  "surfactant",
  "emulsifier",
  "powder",
  "additive",
  "essential_oil",
  "colorant",
  "other",
];

// 카테고리 선택 옵션 (폼 select용, 일부 레이블 보완)
export const INGREDIENT_CATEGORY_OPTIONS: { value: IngredientCategory; label: string }[] = [
  { value: "soap_base", label: "비누베이스" },
  { value: "oil", label: "오일류" },
  { value: "butter", label: "버터류" },
  { value: "lye", label: "가성소다/가성가리" },
  { value: "water", label: "수분류" },
  { value: "surfactant", label: "계면활성제" },
  { value: "emulsifier", label: "유화제" },
  { value: "powder", label: "분말류" },
  { value: "additive", label: "첨가물" },
  { value: "essential_oil", label: "에센셜오일/블렌딩오일" },
  { value: "colorant", label: "색소" },
  { value: "other", label: "기타" },
];

// 수량 단위 선택 옵션 (폼 select용)
export const INGREDIENT_UNIT_OPTIONS: { value: Unit; label: string }[] = [
  { value: "g", label: "g (그램)" },
  { value: "ml", label: "ml (밀리리터)" },
  { value: "ea", label: "ea (개)" },
];

// 제조 방식 한글 레이블
export const PROCESS_TYPE_LABELS: Record<ProcessType, string> = {
  mp: "MP — 녹여붓기",
  cp: "CP — 콜드프로세스",
  hp: "HP — 핫프로세스",
};

// 난이도 한글 레이블
export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  low: "쉬움",
  medium: "보통",
  high: "어려움",
};
