// 제조 방식
export type ProcessType =
  | 'mp'  // Melt & Pour — 녹여붓기
  | 'cp'  // Cold Process — 숙성비누
  | 'hp'; // Hot Process — 열처리 (고체/액체 모두 가능)

// 재료 카테고리
export type IngredientCategory =
  | 'soap_base'     // 비누베이스 (약산성/투명/화이트 등)
  | 'oil'           // 오일류 (베이스오일, 클렌징 베이스 등)
  | 'butter'        // 버터류 (시어버터, 코코아버터 등)
  | 'lye'           // 가성소다(NaOH) / 가성가리(KOH)
  | 'water'         // 수분류 (정제수, 플로럴워터, 알로에 등)
  | 'surfactant'    // 계면활성제 (액체샴푸용)
  | 'emulsifier'    // 유화제
  | 'powder'        // 분말류 (병풀분말, 칼라민, 맥주효모 등)
  | 'additive'      // 첨가물 (판테놀, 비타민E, MSM 등)
  | 'essential_oil' // 에센셜오일 / 블렌딩오일 / 향료
  | 'colorant'      // 색소
  | 'other';        // 기타

// 수량 단위
export type Unit = 'g' | 'ml' | 'ea';

// 몰드 형태
export type MoldShape = 'rectangle' | 'circle' | 'other';

// 난이도
export type Difficulty = 'low' | 'medium' | 'high';

/**
 * @description 전역 공유 재료 풀. 모든 레시피가 이 목록을 참조함
 */
export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  unit: Unit;
  // 현재 보유 재고량
  stock: number;
  // TODO: 구매 단위 옵션 — 동일 재료가 5ml/10ml/20ml 등 여러 규격으로 판매되는 경우 대응 예정
  memo?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * @description 비누 몰드 정보. 한 칸 무게와 칸 수로 총 용량 결정
 */
export interface Mold {
  id: string;
  name: string;
  shape: MoldShape;
  // 한 칸당 무게 (g)
  weightPerCell: number;
  // 몰드 내 총 칸 수
  cellCount: number;
  // weightPerCell × cellCount (자동 계산)
  totalCapacity: number;
  memo?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * @description 레시피 내 단일 재료 사용 정보
 * - 고정 용량(fixedAmount) 또는 배치 대비 비율(ratio) 중 하나 사용
 * - 범위 표기(2~3g)는 amountMin/amountMax로 처리
 */
export interface RecipeIngredient {
  ingredientId: string;
  // 재료 그룹 레이블 — "비누베이스" | "첨가물" | "색상" | "1" 등 (없는 레시피도 있음)
  groupLabel?: string;
  // 고정 사용량 (g/ml)
  fixedAmount?: number;
  // 범위 표기용 최솟값 (예: 2~3g의 2)
  amountMin?: number;
  // 범위 표기용 최댓값 (예: 2~3g의 3)
  amountMax?: number;
  // 배치 총량 대비 비율 (%) — CP 레시피 등 비율 기반 계산 시 사용
  ratio?: number;
  // 소량·비정형 표기 ("약간", "내외", "40방울" 등)
  amountNote?: string;
  // 없어도 제작 가능한 선택 재료 여부
  isOptional: boolean;
  memo?: string;
}

/**
 * @description 특정 재료를 대체할 수 있는 재료 정보
 */
export interface RecipeSubstitute {
  // 대체 대상 원래 재료
  originalIngredientId: string;
  // 대신 사용할 재료 (공유 풀 참조)
  substituteIngredientId: string;
  // 대체 시 비율 조정값 (없으면 원래 값 그대로 적용)
  substituteRatio?: number;
  memo?: string;
}

/**
 * @description 응용 레시피 — 베이스 레시피에서 일부 재료만 달라지는 변형
 */
export interface RecipeVariation {
  // 변형 이름 (예: "얀한 갈색", "라벤더 향")
  label: string;
  description?: string;
  ingredients: RecipeIngredient[];
}

/**
 * @description 레시피. 제조방식과 제품유형을 분리해 모든 제품군에 범용 적용
 */
export interface Recipe {
  id: string;
  name: string;
  catchphrase?: string;
  // 제조 방식 (mp | cp | hp)
  processType: ProcessType;
  // 제품 유형 자유 텍스트 — "비누" | "샴푸바" | "물비누" | "클렌징오일" | "향초" 등
  productType: string;
  moldId?: string;
  // 1배치 기준 총 중량 (g)
  batchSize: number;
  difficulty?: Difficulty;
  // 소요 시간 텍스트 (예: "15분", "1시간")
  timeRequired?: string;
  // 적합 피부 타입 (예: ["모든 피부"] | ["지성", "트러블"])
  skinType?: string[];
  needsHeating: boolean;
  storageLocation?: string;
  // 준비물 목록
  tools?: string[];
  ingredients: RecipeIngredient[];
  substitutes: RecipeSubstitute[];
  // 응용 레시피 변형 목록
  variations?: RecipeVariation[];
  memo?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * @description 제작 세션 내 단일 레시피 항목
 */
export interface SessionRecipeItem {
  recipeId: string;
  // 배율 (0.5 = 절반, 1 = 기본, 2 = 두 배 등)
  scale: number;
  // 이 레시피에서 선택한 대체재료 (originalIngredientId → substituteIngredientId 매핑)
  selectedSubstitutes: Record<string, string>;
}

/**
 * @description 제작 세션. 여러 레시피를 묶어 재료 합산 및 부족량 계산
 */
export interface ProductionSession {
  id: string;
  name?: string;
  items: SessionRecipeItem[];
  createdAt: string;
  updatedAt: string;
}

/**
 * @description 계산기 결과 — 재료별 필요량, 보유량, 부족량
 * - shortage > 0 이면 부족, 0 이하면 충분
 * - toBuyUnits: 부족량을 구매 단위로 올림한 구매 필요 수량 (구매 단위 설계 확정 후 활성화)
 */
export interface CalculationResult {
  ingredientId: string;
  required: number;
  inStock: number;
  shortage: number;
  isSufficient: boolean;
  // TODO: 구매 단위 설계 확정 후 활성화
  // toBuyUnits?: number;
}
