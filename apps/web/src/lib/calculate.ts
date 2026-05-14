import type { Recipe, Ingredient, Mold } from "@soap-studio/types";
import type { SessionItem } from "@/stores/session";

// 재료별 계산 결과
export interface IngredientResult {
  ingredientId: string;
  name: string;
  unit: string;
  category: string;
  required: number;
  inStock: number;
  shortage: number;
  isSufficient: boolean;
}

// 몰드 추천 결과 (단일 또는 조합)
export interface MoldRecommendation {
  molds: Mold[];
  fillRatio: number;
  remainder: number;
}

/**
 * @function
 * @description 레시피 재료 항목의 유효 사용량 계산. 범위는 최솟값 기준
 * @param {Recipe["ingredients"][number]} ing - 레시피 재료 항목
 * @returns {number | null} 계산 가능한 사용량, 메모 전용이면 null
 */
function getEffectiveAmount(ing: Recipe["ingredients"][number]): number | null {
  if (ing.fixedAmount != null) return ing.fixedAmount;
  if (ing.amountMin != null) return ing.amountMin;
  if (ing.amountMax != null) return ing.amountMax;
  return null;
}

/**
 * @function
 * @description 세션 항목들의 재료별 필요량을 합산하고 재고와 비교
 * @param {SessionItem[]} items - 세션에 담긴 레시피 목록 (배율 포함)
 * @param {Recipe[]} recipes - 전체 레시피 데이터
 * @param {Ingredient[]} ingredients - 전체 재료 데이터 (재고 포함)
 * @returns {IngredientResult[]} 재료별 계산 결과 (부족한 것 우선 정렬)
 */
export function calculateRequirements(
  items: SessionItem[],
  recipes: Recipe[],
  ingredients: Ingredient[]
): IngredientResult[] {
  const recipeMap = new Map(recipes.map((r) => [r.id, r]));
  const ingredientMap = new Map(ingredients.map((i) => [i.id, i]));
  const required = new Map<string, number>();

  for (const item of items) {
    const recipe = recipeMap.get(item.recipeId);
    if (!recipe) continue;

    for (const ing of recipe.ingredients) {
      const amount = getEffectiveAmount(ing);
      if (amount == null) continue;
      const scaled = amount * item.scale;
      required.set(ing.ingredientId, (required.get(ing.ingredientId) ?? 0) + scaled);
    }
  }

  const results: IngredientResult[] = [];

  for (const [ingredientId, requiredAmount] of required) {
    const ingredient = ingredientMap.get(ingredientId);
    if (!ingredient) continue;

    const inStock = ingredient.stock;
    const shortage = requiredAmount - inStock;

    results.push({
      ingredientId,
      name: ingredient.name,
      unit: ingredient.unit,
      category: ingredient.category,
      required: Math.round(requiredAmount * 100) / 100,
      inStock,
      shortage: Math.round(Math.max(0, shortage) * 100) / 100,
      isSufficient: shortage <= 0,
    });
  }

  return results.sort((a, b) => {
    if (a.isSufficient !== b.isSufficient) return a.isSufficient ? 1 : -1;
    return a.name.localeCompare(b.name, "ko");
  });
}

// 배열에서 k개 조합 생성
function getCombinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  const result: T[][] = [];
  for (let i = 0; i <= arr.length - k; i++) {
    for (const combo of getCombinations(arr.slice(i + 1), k - 1)) {
      result.push([arr[i], ...combo]);
    }
  }
  return result;
}

/**
 * @function
 * @description 배치 용량 기준 몰드 조합 추천. 단일 몰드부터 최대 3개 조합까지 순서대로 시도하며 딱 맞는 조합 우선 반환
 * @param {number} totalBatchSize - 배치 총 용량 (g)
 * @param {Mold[]} molds - 전체 몰드 목록
 * @returns {MoldRecommendation[]} 잔량 기준 정렬된 추천 목록
 */
export function recommendMolds(totalBatchSize: number, molds: Mold[]): MoldRecommendation[] {
  if (totalBatchSize <= 0 || molds.length === 0) return [];

  const maxK = Math.min(3, molds.length);

  for (let k = 1; k <= maxK; k++) {
    const combos = getCombinations(molds, k).map((moldGroup) => {
      const totalCapacity = moldGroup.reduce((sum, m) => sum + m.totalCapacity, 0);
      return {
        molds: moldGroup,
        fillRatio: totalCapacity / totalBatchSize,
        remainder: totalCapacity - totalBatchSize,
      };
    });

    const fitting = combos
      .filter((r) => r.remainder >= 0)
      .sort((a, b) => a.remainder - b.remainder);

    if (fitting.length > 0) {
      // 이 단계에서 맞는 조합 발견 — 단일 몰드 초과분도 참고용으로 뒤에 붙임
      if (k === 1) {
        const overflowing = combos
          .filter((r) => r.remainder < 0)
          .sort((a, b) => b.remainder - a.remainder);
        return [...fitting, ...overflowing];
      }
      return fitting;
    }
  }

  // 3개 조합까지 맞는 게 없으면 단일 몰드 중 가장 근접한 것만 반환
  return molds
    .map((mold) => ({
      molds: [mold],
      fillRatio: mold.totalCapacity / totalBatchSize,
      remainder: mold.totalCapacity - totalBatchSize,
    }))
    .sort((a, b) => b.remainder - a.remainder);
}

/**
 * @function
 * @description 세션의 총 배치 용량 계산 (레시피 batchSize × 배율 합산)
 * @param {SessionItem[]} items - 세션 항목 목록
 * @returns {number} 총 배치 용량 (g)
 */
export function calcTotalBatchSize(items: SessionItem[]): number {
  return items.reduce((sum, item) => sum + item.batchSize * item.scale, 0);
}
