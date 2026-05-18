import { getAllRecipes } from "@soap-studio/db/queries/recipes";
import AddToSessionButton from "@/components/recipes/AddToSessionButton";
import type { Recipe } from "@soap-studio/types";
import { DIFFICULTY_LABELS } from "@soap-studio/types";
import { Badge, Card } from "@soap-studio/ui";

// 제조 방식 배지 레이블 (Badge 컴포넌트 variant와 대응)
const PROCESS_LABEL: Record<Recipe["processType"], string> = {
  mp: "M&P",
  cp: "CP",
  hp: "HP",
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
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <Card className="p-4">
                {/* 상단: 뱃지 + 제품 유형 */}
                <div className="mb-1 flex items-center gap-2">
                  <Badge variant={recipe.processType}>
                    {PROCESS_LABEL[recipe.processType]}
                  </Badge>
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
                        <span>{DIFFICULTY_LABELS[recipe.difficulty]}</span>
                      </>
                    )}
                  </div>
                  <AddToSessionButton
                    recipeId={recipe.id}
                    recipeName={recipe.name}
                    batchSize={recipe.batchSize}
                  />
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
