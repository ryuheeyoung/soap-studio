/**
 * @component
 * @description 재료 재고 현황 페이지 — M2에서 구현 예정
 */
export default function IngredientsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        재료
      </h1>
      <p className="text-sm text-zinc-500">보유 재료 목록과 현재 재고량이 여기에 표시돼요.</p>
    </div>
  );
}
