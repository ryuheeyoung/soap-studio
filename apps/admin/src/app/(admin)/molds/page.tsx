import Link from "next/link";
import { Plus, Layers } from "lucide-react";
import { getAllMolds } from "@soap-studio/db/queries/molds";
import { deleteMoldAction } from "@/lib/actions/molds";

/**
 * @component
 * @description 몰드 목록 페이지. 칸당 용량과 총 용량을 함께 표시
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
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                <th className="px-4 py-3 text-left font-medium text-zinc-500">몰드명</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">형태</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-500">칸당 용량</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-500">칸 수</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-500">총 용량</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {molds.map((mold) => (
                <tr key={mold.id} className="border-b border-zinc-50 last:border-0 dark:border-zinc-800">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                    {mold.name}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {{ rectangle: "직사각형", circle: "원형", other: "기타" }[mold.shape]}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                    {mold.weightPerCell}g
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                    {mold.cellCount}칸
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium text-zinc-900 dark:text-zinc-50">
                    {mold.totalCapacity.toLocaleString()}g
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/molds/${mold.id}`}
                        className="rounded-md px-2.5 py-1 text-xs font-medium text-zinc-500 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        수정
                      </Link>
                      <form
                        action={async () => {
                          "use server";
                          await deleteMoldAction(mold.id);
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
