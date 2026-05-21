import { unstable_noStore as noStore } from "next/cache";
import { getAllIngredients } from "@soap-studio/db/queries/ingredients";
import { getAllRecipes } from "@soap-studio/db/queries/recipes";
import IngredientsFilter from "@/components/ingredients/IngredientsFilter";

/**
 * @component
 * @description 재료 재고 현황 페이지. 카테고리별 그룹으로 재고량 표시, 이름 검색 지원
 */
export default async function IngredientsPage() {
  noStore();
  const [ingredients, recipes] = await Promise.all([
    getAllIngredients(),
    getAllRecipes(),
  ]);

  // 재료 ID별 최소 필요량 맵 — 모든 레시피에서 해당 재료의 amountMin(또는 fixedAmount) 최솟값
  const minRequiredMap: Record<string, number> = {};
  for (const recipe of recipes) {
    for (const ing of recipe.ingredients) {
      const min = ing.amountMin ?? ing.fixedAmount;
      if (min == null) continue;
      const prev = minRequiredMap[ing.ingredientId];
      minRequiredMap[ing.ingredientId] = prev == null ? min : Math.min(prev, min);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">재료</h1>
      <IngredientsFilter ingredients={ingredients} minRequiredMap={minRequiredMap} />
    </div>
  );
}
