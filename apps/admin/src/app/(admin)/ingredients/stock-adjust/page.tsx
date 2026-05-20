import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAllIngredients } from "@soap-studio/db/queries/ingredients";
import StockAdjustPanel from "@/components/ingredients/StockAdjustPanel";

/**
 * @component
 * @description 구매목록 JSON 붙여넣기 → 재고 일괄 추가 페이지
 */
export default async function StockAdjustPage() {
  const ingredients = await getAllIngredients();

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <Link
          href="/ingredients"
          className="text-zinc-400 transition hover:text-zinc-600 dark:hover:text-zinc-200"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">재고 추가</h1>
      </div>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        사용자 화면 계산기의 <strong className="text-zinc-700 dark:text-zinc-300">구매목록 복사 (JSON)</strong> 버튼으로 복사한 내용을 붙여넣으면 재고를 한 번에 추가할 수 있어요.
      </p>

      <StockAdjustPanel ingredients={ingredients} />
    </div>
  );
}
