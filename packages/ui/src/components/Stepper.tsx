/**
 * @component
 * @description 증감 버튼 + 값 표시 스테퍼. 배율 조정·수량 입력 등 공통 사용
 * @param {number} props.value - 현재 값
 * @param {(value: number) => void} props.onChange - 값 변경 콜백
 * @param {number} props.min - 최솟값 (기본 0)
 * @param {number} props.max - 최댓값 (선택)
 * @param {number} props.step - 증감 단위 (기본 1)
 * @param {(value: number) => string} props.format - 중앙 텍스트 포맷터 (기본: 숫자 그대로)
 * @param {boolean} props.editable - true면 중앙을 직접 입력 가능한 input으로 렌더링
 * @param {string} props.className - 래퍼 추가 클래스
 */
export interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  format?: (value: number) => string;
  editable?: boolean;
  className?: string;
}

const btnClass =
  "flex h-6 w-6 shrink-0 items-center justify-center rounded border border-zinc-200 text-sm text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800";

export function Stepper({
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  format,
  editable = false,
  className = "",
}: StepperProps) {
  const decrease = () => {
    const next = Math.round((value - step) * 1000) / 1000;
    if (next >= min) onChange(next);
  };

  const increase = () => {
    const next = Math.round((value + step) * 1000) / 1000;
    if (max == null || next <= max) onChange(next);
  };

  const displayText = format ? format(value) : String(value);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button type="button" onClick={decrease} disabled={value <= min} className={btnClass}>
        −
      </button>

      {editable ? (
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const parsed = parseFloat(e.target.value);
            if (!isNaN(parsed) && parsed >= min && (max == null || parsed <= max)) {
              onChange(parsed);
            }
          }}
          className="w-10 rounded border border-zinc-200 bg-transparent px-1 py-0.5 text-center text-xs tabular-nums outline-none transition focus:border-zinc-400 dark:border-zinc-700 dark:text-zinc-200 dark:focus:border-zinc-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
      ) : (
        <span className="min-w-[2.5rem] text-center text-sm tabular-nums text-zinc-800 dark:text-zinc-200">
          {displayText}
        </span>
      )}

      <button type="button" onClick={increase} disabled={max != null && value >= max} className={btnClass}>
        +
      </button>
    </div>
  );
}
