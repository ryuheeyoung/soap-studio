import { getAllIngredients } from "@soap-studio/db/queries/ingredients";
import IngredientsFilter from "@/components/ingredients/IngredientsFilter";

/**
 * @component
 * @description 재료 재고 현황 페이지. 카테고리별 그룹으로 재고량 표시, 이름 검색 지원
 */
export default async function IngredientsPage() {
  const ingredients = await getAllIngredients();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">재료</h1>
      <IngredientsFilter ingredients={ingredients} />
    </div>
  );
}
