import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getIngredientById } from "@soap-studio/db/queries/ingredients";
import IngredientForm from "@/components/ingredients/IngredientForm";
import { updateIngredientAction } from "@/lib/actions/ingredients";

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * @component
 * @description 재료 수정 페이지. 기존 재료 데이터를 폼에 채워서 수정
 * @param {string} props.params.id - 수정할 재료 ID
 */
export default async function EditIngredientPage({ params }: Props) {
  noStore();
  const { id } = await params;
  const ingredient = await getIngredientById(id);

  if (!ingredient) notFound();

  // id를 바인딩한 수정 액션
  const updateAction = updateIngredientAction.bind(null, id);

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
        재료 수정
      </h1>

      <div className="max-w-md">
        <IngredientForm
          action={updateAction}
          defaultValues={ingredient}
          submitLabel="저장하기"
        />
      </div>
    </div>
  );
}
