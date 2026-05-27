"use client";

import { trpc } from "@/lib/trpc/client";
import IngredientsFilter from "@/components/ingredients/IngredientsFilter";
import type { Recipe } from "@soap-studio/types";

/**
 * @function
 * @description 레시피 목록에서 재료 ID별 최소 필요량 맵 계산
 * @param {Recipe[]} recipes - 전체 레시피 목록
 * @returns {Record<string, number>} 재료 ID → 최소 필요량
 */
function buildMinRequiredMap(recipes: Recipe[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const recipe of recipes) {
    for (const ing of recipe.ingredients) {
      const min = ing.amountMin ?? ing.fixedAmount;
      if (min == null) continue;
      const prev = map[ing.ingredientId];
      map[ing.ingredientId] = prev == null ? min : Math.min(prev, min);
    }
  }
  return map;
}

/**
 * @component
 * @description 재료 재고 현황 페이지. 카테고리별 그룹으로 재고량 표시, 이름 검색 지원
 */
export default function IngredientsPage() {
  const { data: ingredients = [] } = trpc.ingredients.getAll.useQuery();
  const { data: recipes = [] } = trpc.recipes.getAll.useQuery();

  const minRequiredMap = buildMinRequiredMap(recipes);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">재료</h1>
      <IngredientsFilter ingredients={ingredients} minRequiredMap={minRequiredMap} />
    </div>
  );
}
