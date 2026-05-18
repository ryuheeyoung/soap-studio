import { getAllIngredients } from "@soap-studio/db/queries/ingredients";
import type { Ingredient, IngredientCategory } from "@soap-studio/types";
import { INGREDIENT_CATEGORY_LABELS, INGREDIENT_CATEGORY_ORDER } from "@soap-studio/types";

/**
 * @component
 * @description 재료 재고 현황 페이지. 카테고리별 그룹으로 재고량 표시
 */
export default async function IngredientsPage() {
  const ingredients = await getAllIngredients();

  // 카테고리별 그룹핑
  const grouped = new Map<IngredientCategory, Ingredient[]>();
  for (const ing of ingredients) {
    const list = grouped.get(ing.category) ?? [];
    list.push(ing);
    grouped.set(ing.category, list);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">재료</h1>

      {ingredients.length === 0 ? (
        <p className="text-sm text-zinc-500">등록된 재료가 없어요.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {INGREDIENT_CATEGORY_ORDER.filter((cat) => grouped.has(cat)).map((category) => (
            <section key={category}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {INGREDIENT_CATEGORY_LABELS[category]}
              </h2>
              <ul className="flex flex-col gap-1">
                {grouped.get(category)!.map((ing) => (
                  <li
                    key={ing.id}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 odd:bg-zinc-50 even:bg-white dark:odd:bg-zinc-900 dark:even:bg-zinc-950"
                  >
                    <span className="text-sm text-zinc-800 dark:text-zinc-200">{ing.name}</span>
                    <span
                      className={`text-sm font-medium tabular-nums ${
                        ing.stock === 0
                          ? "text-red-500"
                          : "text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      {ing.stock}
                      <span className="ml-0.5 text-xs font-normal text-zinc-400">{ing.unit}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
