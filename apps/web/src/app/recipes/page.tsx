import { getAllRecipes } from "@soap-studio/db/queries/recipes";
import AddToSessionButton from "@/components/recipes/AddToSessionButton";
import type { Recipe } from "@soap-studio/types";

// 제조 방식 뱃지 레이블 및 색상
const PROCESS_BADGE: Record<Recipe["processType"], { label: string; className: string }> = {
  mp: { label: "M&P", className: "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300" },
  cp: { label: "CP", className: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
  hp: { label: "HP", className: "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300" },
};

// 난이도 한글 레이블
const DIFFICULTY_LABEL: Record<string, string> = {
  low: "쉬움",
  medium: "보통",
  high: "어려움",
};

/**
 * @component
 * @description 레시피 목록 페이지. 전체 레시피를 카드 형태로 표시하고 계산기 세션 추가 버튼 제공
 */
export default async function RecipesPage() {
  const recipes = await getAllRecipes();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">레시피</h1>

      {recipes.length === 0 ? (
        <p className="text-sm text-zinc-500">등록된 레시피가 없어요.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {recipes.map((recipe) => {
            const badge = PROCESS_BADGE[recipe.processType];
            return (
              <li
                key={recipe.id}
                className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                {/* 상단: 뱃지 + 제품 유형 */}
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs font-semibold ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                  <span className="text-xs text-zinc-500">{recipe.productType}</span>
                </div>

                {/* 레시피 이름 */}
                <p className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  {recipe.name}
                </p>

                {/* 캐치프레이즈 */}
                {recipe.catchphrase && (
                  <p className="mt-0.5 text-sm text-zinc-500 line-clamp-1">
                    {recipe.catchphrase}
                  </p>
                )}

                {/* 메타 정보 + 추가 버튼 */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
                    <span>{recipe.batchSize}g</span>
                    <span>·</span>
                    <span>재료 {recipe.ingredients.length}가지</span>
                    {recipe.difficulty && (
                      <>
                        <span>·</span>
                        <span>{DIFFICULTY_LABEL[recipe.difficulty]}</span>
                      </>
                    )}
                  </div>
                  <AddToSessionButton
                    recipeId={recipe.id}
                    recipeName={recipe.name}
                    batchSize={recipe.batchSize}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
