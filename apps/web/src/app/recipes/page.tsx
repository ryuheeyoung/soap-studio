"use client";

import { trpc } from "@/lib/trpc/client";
import RecipesFilter from "@/components/recipes/RecipesFilter";

/**
 * @component
 * @description 레시피 목록 페이지. 카드 형태로 표시하고 계산기 세션 추가 및 이름 검색 지원
 */
export default function RecipesPage() {
  const { data: recipes = [] } = trpc.recipes.getAll.useQuery();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">레시피</h1>
      <RecipesFilter recipes={recipes} />
    </div>
  );
}
