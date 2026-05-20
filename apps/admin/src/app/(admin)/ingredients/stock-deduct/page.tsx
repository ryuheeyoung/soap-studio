import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAllIngredients } from "@soap-studio/db/queries/ingredients";
import StockDeductPanel from "@/components/ingredients/StockDeductPanel";

/**
 * @component
 * @description 소요량 JSON 붙여넣기 → 재고 일괄 차감 페이지
 */
export default async function StockDeductPage() {
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
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">재고 차감</h1>
      </div>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        사용자 화면 계산기의 <strong className="text-zinc-700 dark:text-zinc-300">소요량 복사</strong> 버튼으로 복사한 내용을 붙여넣으면 비누 제작 후 사용된 재료를 한 번에 차감할 수 있어요.
      </p>

      <StockDeductPanel ingredients={ingredients} />
    </div>
  );
}
