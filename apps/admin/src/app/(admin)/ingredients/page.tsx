import Link from "next/link";
import { Plus, Package, PackagePlus, PackageMinus } from "lucide-react";
import { getAllIngredients } from "@soap-studio/db/queries/ingredients";
import IngredientsTable from "@/components/ingredients/IngredientsTable";

/**
 * @component
 * @description 재료 목록 페이지. 이름 검색 및 카테고리 필터, 추가/수정/삭제 제공
 */
export default async function IngredientsPage() {
  const ingredients = await getAllIngredients();

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* 헤더 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">재료 관리</h1>
        <div className="flex flex-wrap items-center gap-2">
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
        <IngredientsTable ingredients={ingredients} />
      )}
    </div>
  );
}
