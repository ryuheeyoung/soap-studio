import Link from "next/link";
import { Plus, BookOpen } from "lucide-react";
import { getAllRecipes } from "@soap-studio/db/queries/recipes";
import { deleteRecipeAction } from "@/lib/actions/recipes";

// 제조 방식 레이블
const PROCESS_LABELS: Record<string, string> = {
  mp: "MP",
  cp: "CP",
  hp: "HP",
};

/**
 * @component
 * @description 레시피 목록 페이지. 제조 방식, 제품 유형, 배치 크기, 재료 수 표시
 */
export default async function RecipesPage() {
  const recipes = await getAllRecipes();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">레시피 관리</h1>
        <Link
          href="/recipes/new"
          className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <Plus size={15} />
          레시피 추가
        </Link>
      </div>

      {recipes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
          <BookOpen size={32} className="text-zinc-300 dark:text-zinc-600" />
          <p className="text-sm text-zinc-500">등록된 레시피가 없어요.</p>
          <Link
            href="/recipes/new"
            className="text-sm font-medium text-zinc-700 underline underline-offset-2 dark:text-zinc-300"
          >
            첫 번째 레시피 추가하기
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                <th className="px-4 py-3 text-left font-medium text-zinc-500">레시피명</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">제조 방식</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">제품 유형</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-500">배치 크기</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-500">재료 수</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {recipes.map((recipe) => (
                <tr key={recipe.id} className="border-b border-zinc-50 last:border-0 dark:border-zinc-800">
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-900 dark:text-zinc-50">{recipe.name}</div>
                    {recipe.catchphrase && (
                      <div className="mt-0.5 text-xs text-zinc-400">{recipe.catchphrase}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      {PROCESS_LABELS[recipe.processType] ?? recipe.processType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{recipe.productType}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                    {recipe.batchSize.toLocaleString()}g
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                    {recipe.ingredients.length}개
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/recipes/${recipe.id}`}
                        className="rounded-md px-2.5 py-1 text-xs font-medium text-zinc-500 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        수정
                      </Link>
                      <form
                        action={async () => {
                          "use server";
                          await deleteRecipeAction(recipe.id);
                        }}
                      >
                        <button
                          type="submit"
                          className="rounded-md px-2.5 py-1 text-xs font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          삭제
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
