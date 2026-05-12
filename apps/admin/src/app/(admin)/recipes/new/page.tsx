import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getAllIngredients } from "@soap-studio/db/queries/ingredients";
import RecipeForm from "@/components/recipes/RecipeForm";
import { createRecipeAction } from "@/lib/actions/recipes";

/**
 * @component
 * @description 레시피 추가 페이지
 */
export default async function NewRecipePage() {
  const allIngredients = await getAllIngredients();

  return (
    <div className="flex flex-col gap-6 p-6">
      <Link
        href="/recipes"
        className="flex w-fit items-center gap-1 text-sm text-zinc-500 transition hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        <ChevronLeft size={16} />
        레시피 목록
      </Link>

      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">레시피 추가</h1>

      <div className="max-w-2xl">
        <RecipeForm
          action={createRecipeAction}
          allIngredients={allIngredients}
          submitLabel="추가하기"
        />
      </div>
    </div>
  );
}
