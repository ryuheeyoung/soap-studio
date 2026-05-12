import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getRecipeById } from "@soap-studio/db/queries/recipes";
import { getAllIngredients } from "@soap-studio/db/queries/ingredients";
import RecipeForm from "@/components/recipes/RecipeForm";
import { updateRecipeAction } from "@/lib/actions/recipes";

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * @component
 * @description 레시피 수정 페이지
 * @param {string} props.params.id - 수정할 레시피 ID
 */
export default async function EditRecipePage({ params }: Props) {
  const { id } = await params;
  const [recipe, allIngredients] = await Promise.all([
    getRecipeById(id),
    getAllIngredients(),
  ]);

  if (!recipe) notFound();
  const updateAction = updateRecipeAction.bind(null, id);

  return (
    <div className="flex flex-col gap-6 p-6">
      <Link
        href="/recipes"
        className="flex w-fit items-center gap-1 text-sm text-zinc-500 transition hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        <ChevronLeft size={16} />
        레시피 목록
      </Link>

      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">레시피 수정</h1>

      <div className="max-w-2xl">
        <RecipeForm
          action={updateAction}
          defaultValues={recipe}
          allIngredients={allIngredients}
          submitLabel="저장하기"
        />
      </div>
    </div>
  );
}
