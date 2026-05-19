import Link from "next/link";
import { Plus, Layers } from "lucide-react";
import { getAllMolds } from "@soap-studio/db/queries/molds";
import MoldsTable from "@/components/molds/MoldsTable";

/**
 * @component
 * @description 몰드 목록 페이지. 이름 검색 및 형태 필터, 추가/수정/삭제 제공
 */
export default async function MoldsPage() {
  const molds = await getAllMolds();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">몰드 관리</h1>
        <Link
          href="/molds/new"
          className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <Plus size={15} />
          몰드 추가
        </Link>
      </div>

      {molds.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
          <Layers size={32} className="text-zinc-300 dark:text-zinc-600" />
          <p className="text-sm text-zinc-500">등록된 몰드가 없어요.</p>
          <Link
            href="/molds/new"
            className="text-sm font-medium text-zinc-700 underline underline-offset-2 dark:text-zinc-300"
          >
            첫 번째 몰드 추가하기
          </Link>
        </div>
      ) : (
        <MoldsTable molds={molds} />
      )}
    </div>
  );
}
