/**
 * @component
 * @description 대시보드 홈 — 재고 요약 및 최근 세션 (M2~M5 이후 구현 예정)
 */
export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        홈
      </h1>
      <p className="text-sm text-zinc-500">재고 요약과 최근 제작 세션이 여기에 표시돼요.</p>
    </div>
  );
}
