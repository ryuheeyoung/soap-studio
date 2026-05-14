import Link from "next/link";
import { Plus, Package, PackagePlus, PackageMinus } from "lucide-react";
import { getAllIngredients } from "@soap-studio/db/queries/ingredients";
import { deleteIngredientAction } from "@/lib/actions/ingredients";
import type { Ingredient } from "@soap-studio/types";

// 카테고리 한글 레이블 매핑
const CATEGORY_LABELS: Record<Ingredient["category"], string> = {
  soap_base: "비누베이스",
  oil: "오일류",
  butter: "버터류",
  lye: "가성소다/가성가리",
  water: "수분류",
  surfactant: "계면활성제",
  emulsifier: "유화제",
  powder: "분말류",
  additive: "첨가물",
  essential_oil: "에센셜오일",
  colorant: "색소",
  other: "기타",
};

/**
 * @component
 * @description 재료 목록 페이지. 전체 재료를 테이블로 표시하고 추가/수정/삭제 제공
 */
export default async function IngredientsPage() {
  const ingredients = await getAllIngredients();

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          재료 관리
        </h1>
        <div className="flex items-center gap-2">
          <Link
            href="/ingredients/stock-deduct"
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            <PackageMinus size={15} />
            재고 차감
          </Link>
          <Link
            href="/ingredients/stock-adjust"
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            <PackagePlus size={15} />
            재고 추가
          </Link>
          <Link
            href="/ingredients/new"
            className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <Plus size={15} />
            재료 추가
          </Link>
        </div>
      </div>

      {/* 재료 없을 때 */}
      {ingredients.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
          <Package size={32} className="text-zinc-300 dark:text-zinc-600" />
          <p className="text-sm text-zinc-500">등록된 재료가 없어요.</p>
          <Link
            href="/ingredients/new"
            className="text-sm font-medium text-zinc-700 underline underline-offset-2 dark:text-zinc-300"
          >
            첫 번째 재료 추가하기
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                <th className="px-4 py-3 text-left font-medium text-zinc-500">재료명</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">카테고리</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-500">재고</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">메모</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ingredient) => (
                <tr
                  key={ingredient.id}
                  className="border-b border-zinc-50 last:border-0 dark:border-zinc-800"
                >
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                    {ingredient.name}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {CATEGORY_LABELS[ingredient.category]}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                    {ingredient.stock.toLocaleString()} {ingredient.unit}
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-zinc-400">
                    {ingredient.memo ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/ingredients/${ingredient.id}`}
                        className="rounded-md px-2.5 py-1 text-xs font-medium text-zinc-500 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        수정
                      </Link>
                      <form
                        action={async () => {
                          "use server";
                          await deleteIngredientAction(ingredient.id);
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
