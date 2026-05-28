import type { Recipe, Ingredient, Mold } from "@soap-studio/types";
import type { SessionItem } from "@/stores/session";

// 재료별 계산 결과
export interface IngredientResult {
  ingredientId: string;
  // 대체재료 선택 시 원래 재료 ID (UI 컨트롤 렌더링 기준)
  originalIngredientId?: string;
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

// 레시피별 몰드 선택 옵션 (단일 또는 2개 조합)
export interface MoldOption {
  // 단일이면 1개, 조합이면 2개
  molds: Mold[];
  // 몰드 ID별 필요 칸 수
  cellsMap: Record<string, number>;
  // 다른 레시피 선택 반영 후 사용 가능 여부
  isAvailable: boolean;
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

  // effectiveIngredientId → { requiredAmount, originalIngredientId }
  const required = new Map<string, { amount: number; originalId?: string }>();

  for (const item of items) {
    const recipe = recipeMap.get(item.recipeId);
    if (!recipe) continue;

    // originalIngredientId → RecipeSubstitute 맵
    const substituteMap = new Map(
      recipe.substitutes.map((s) => [s.originalIngredientId, s])
    );

    for (const ing of recipe.ingredients) {
      // 대체재료 선택 여부 확인
      const selectedSubId = item.selectedSubstitutes?.[ing.ingredientId];
      const substitute = substituteMap.get(ing.ingredientId);
      const effectiveIngId = selectedSubId ?? ing.ingredientId;
      const isSubstitute = !!selectedSubId;

      // 사용량: 오버라이드 → 기본값 순
      let amount = item.amountOverrides?.[ing.ingredientId] ?? getEffectiveAmount(ing);
      if (amount == null) continue;

      // 대체재료에 비율 조정값이 있으면 적용
      if (isSubstitute && substitute?.substituteRatio != null) {
        amount = amount * substitute.substituteRatio;
      }

      const scaled = amount * item.scale;
      const prev = required.get(effectiveIngId);
      required.set(effectiveIngId, {
        amount: (prev?.amount ?? 0) + scaled,
        // 대체재료면 원본 ID 기록, 아니면 이전 값 유지 (동일 재료가 합산될 때 덮어쓰기 방지)
        originalId: isSubstitute ? ing.ingredientId : prev?.originalId,
      });
    }
  }

  const results: IngredientResult[] = [];

  for (const [ingredientId, { amount: requiredAmount, originalId }] of required) {
    const ingredient = ingredientMap.get(ingredientId);
    if (!ingredient) continue;

    const inStock = ingredient.stock;
    const shortage = requiredAmount - inStock;

    results.push({
      ingredientId,
      originalIngredientId: originalId,
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

/**
 * @function
 * @description 레시피 배치 용량 기준으로 사용 가능한 몰드 목록 반환. 단위중량 큰 순 정렬, 잔여 칸 부족 시 비활성 표시
 * @param {number} batchSize - 이 레시피의 배치 용량 (g)
 * @param {Mold[]} molds - 전체 몰드 목록
 * @param {Record<string, number>} availableCells - 몰드 ID별 현재 잔여 칸 수 (다른 레시피 선택 반영)
 * @returns {MoldOption[]} 단위중량 큰 순으로 정렬된 몰드 옵션 목록
 */
export function filterMoldsForRecipe(
  batchSize: number,
  molds: Mold[],
  availableCells: Record<string, number>
): MoldOption[] {
  const results: MoldOption[] = [];

  // 단일 몰드: 칸 수가 충분한 것만
  for (const mold of molds) {
    const cellsNeeded = Math.ceil(batchSize / mold.weightPerCell);
    if (cellsNeeded > mold.cellCount) continue;
    const remaining = availableCells[mold.id] ?? mold.cellCount;
    results.push({
      molds: [mold],
      cellsMap: { [mold.id]: cellsNeeded },
      isAvailable: cellsNeeded <= remaining,
    });
  }

  // 단일 몰드가 하나라도 있으면 조합 불필요
  if (results.length > 0) return results;

  // 2개 조합: 첫 번째 몰드(큰 칸) 전체 사용 후 나머지를 두 번째 몰드로 처리
  for (let i = 0; i < molds.length; i++) {
    for (let j = i + 1; j < molds.length; j++) {
      // 단위중량 큰 쪽을 first로 정렬
      const [first, second] =
        molds[i].weightPerCell >= molds[j].weightPerCell
          ? [molds[i], molds[j]]
          : [molds[j], molds[i]];

      // first 몰드 전체 사용
      const firstCapacity = first.cellCount * first.weightPerCell;
      const remainder = batchSize - firstCapacity;

      // first만으로 충분하면 단일 케이스와 중복 — 조합 불필요
      if (remainder <= 0) continue;

      const secondCellsNeeded = Math.ceil(remainder / second.weightPerCell);
      if (secondCellsNeeded > second.cellCount) continue;

      const firstRemaining = availableCells[first.id] ?? first.cellCount;
      const secondRemaining = availableCells[second.id] ?? second.cellCount;

      results.push({
        molds: [first, second],
        cellsMap: { [first.id]: first.cellCount, [second.id]: secondCellsNeeded },
        isAvailable:
          first.cellCount <= firstRemaining && secondCellsNeeded <= secondRemaining,
      });
    }
  }

  // 단위중량 큰 순 정렬 (조합은 가장 큰 몰드 기준), 조합은 상위 3개만
  const sorted = results.sort(
    (a, b) => b.molds[0].weightPerCell - a.molds[0].weightPerCell
  );

  const hasCombination = sorted.some((r) => r.molds.length > 1);
  return hasCombination ? sorted.slice(0, 3) : sorted;
}
