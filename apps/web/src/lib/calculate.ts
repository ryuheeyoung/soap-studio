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

// 몰드 추천 결과
export interface MoldRecommendation {
  mold: Mold;
  // 총 용량 대비 몰드 용량 비율 (1.0 = 딱 맞음)
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
  // recipeId → Recipe 맵
  const recipeMap = new Map(recipes.map((r) => [r.id, r]));
  // ingredientId → Ingredient 맵
  const ingredientMap = new Map(ingredients.map((i) => [i.id, i]));

  // 재료별 필요량 합산
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

  // 재고와 비교하여 결과 생성
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

  // 부족한 재료 → 충분한 재료 순, 같은 그룹 내에선 이름 순
  return results.sort((a, b) => {
    if (a.isSufficient !== b.isSufficient) return a.isSufficient ? 1 : -1;
    return a.name.localeCompare(b.name, "ko");
  });
}

/**
 * @function
 * @description 총 배치 용량 기준으로 몰드 적합도 계산 및 추천 목록 반환
 * @param {number} totalBatchSize - 세션 전체 총 배치 용량 (g)
 * @param {Mold[]} molds - 전체 몰드 목록
 * @returns {MoldRecommendation[]} 잔량 절댓값 기준 오름차순 정렬된 추천 목록
 */
export function recommendMolds(
  totalBatchSize: number,
  molds: Mold[]
): MoldRecommendation[] {
  if (totalBatchSize <= 0) return [];

  return molds
    .map((mold) => ({
      mold,
      fillRatio: mold.totalCapacity / totalBatchSize,
      remainder: mold.totalCapacity - totalBatchSize,
    }))
    .sort((a, b) => Math.abs(a.remainder) - Math.abs(b.remainder));
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
