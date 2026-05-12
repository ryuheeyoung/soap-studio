/**
 * @component
 * @description 제작 계산기 페이지 — M5에서 구현 예정
 */
export default function CalculatorPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        계산기
      </h1>
      <p className="text-sm text-zinc-500">레시피를 선택하고 필요한 재료를 계산해요.</p>
    </div>
  );
}
