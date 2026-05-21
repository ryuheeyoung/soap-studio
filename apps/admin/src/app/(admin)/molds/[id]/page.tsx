import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getMoldById } from "@soap-studio/db/queries/molds";
import MoldForm from "@/components/molds/MoldForm";
import { updateMoldAction } from "@/lib/actions/molds";

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * @component
 * @description 몰드 수정 페이지
 * @param {string} props.params.id - 수정할 몰드 ID
 */
export default async function EditMoldPage({ params }: Props) {
  noStore();
  const { id } = await params;
  const mold = await getMoldById(id);

  if (!mold) notFound();

  const updateAction = updateMoldAction.bind(null, id);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <Link
        href="/molds"
        className="flex w-fit items-center gap-1 text-sm text-zinc-500 transition hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        <ChevronLeft size={16} />
        몰드 목록
      </Link>

      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">몰드 수정</h1>

      <div className="max-w-md">
        <MoldForm action={updateAction} defaultValues={mold} submitLabel="저장하기" />
      </div>
    </div>
  );
}
