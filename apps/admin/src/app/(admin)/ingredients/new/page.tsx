
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import IngredientForm from "@/components/ingredients/IngredientForm";
import { createIngredientAction } from "@/lib/actions/ingredients";

/**
 * @component
 * @description 재료 추가 페이지
 */
export default function NewIngredientPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center gap-2">
        <Link
          href="/ingredients"
          className="flex items-center gap-1 text-sm text-zinc-500 transition hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          <ChevronLeft size={16} />
          재료 목록
        </Link>
      </div>

      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        재료 추가
      </h1>

      <div className="max-w-md">
        <IngredientForm action={createIngredientAction} submitLabel="추가하기" />
      </div>
    </div>
  );
}
