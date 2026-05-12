"use client";

import { useActionState, useState } from "react";
import type { Mold } from "@soap-studio/types";

// 몰드 형태 선택 옵션
const SHAPE_OPTIONS: { value: Mold["shape"]; label: string }[] = [
  { value: "rectangle", label: "직사각형" },
  { value: "circle", label: "원형" },
  { value: "other", label: "기타" },
];

interface Props {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: Partial<Mold>;
  submitLabel: string;
}

/**
 * @component
 * @description 몰드 추가/수정 공용 폼. 칸당 무게 × 칸 수 = 총 용량 실시간 미리보기 포함
 * @param {Function} props.action - 폼 제출 Server Action
 * @param {Partial<Mold>} props.defaultValues - 수정 시 기존 값
 * @param {string} props.submitLabel - 제출 버튼 텍스트
 */
export default function MoldForm({ action, defaultValues, submitLabel }: Props) {
  // 총 용량 실시간 미리보기용 상태
  const [weightPerCell, setWeightPerCell] = useState(defaultValues?.weightPerCell ?? 0);
  const [cellCount, setCellCount] = useState(defaultValues?.cellCount ?? 1);

  const totalCapacity = weightPerCell * cellCount;

  const [_state, formAction, isPending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      await action(formData);
    },
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* 몰드명 */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          몰드명 <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={defaultValues?.name}
          placeholder="예: 하트 4구 몰드"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:ring-zinc-700"
        />
      </div>

      {/* 형태 */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="shape" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          형태 <span className="text-red-500">*</span>
        </label>
        <select
          id="shape"
          name="shape"
          required
          defaultValue={defaultValues?.shape ?? "rectangle"}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:ring-zinc-700"
        >
          {SHAPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* 칸당 무게 + 칸 수 */}
      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="weightPerCell" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            칸당 용량 (g) <span className="text-red-500">*</span>
          </label>
          <input
            id="weightPerCell"
            name="weightPerCell"
            type="number"
            min="1"
            step="0.1"
            required
            value={weightPerCell || ""}
            onChange={(e) => setWeightPerCell(parseFloat(e.target.value) || 0)}
            placeholder="예: 90"
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:ring-zinc-700"
          />
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="cellCount" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            칸 수 <span className="text-red-500">*</span>
          </label>
          <input
            id="cellCount"
            name="cellCount"
            type="number"
            min="1"
            step="1"
            required
            value={cellCount || ""}
            onChange={(e) => setCellCount(parseInt(e.target.value, 10) || 0)}
            placeholder="예: 6"
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:ring-zinc-700"
          />
        </div>
      </div>

      {/* 총 용량 미리보기 */}
      {totalCapacity > 0 && (
        <div className="rounded-lg bg-zinc-50 px-4 py-3 dark:bg-zinc-800">
          <p className="text-sm text-zinc-500">
            총 용량:{" "}
            <span className="font-semibold text-zinc-900 dark:text-zinc-50">
              {totalCapacity.toLocaleString()}g
            </span>
            <span className="ml-2 text-zinc-400">
              ({weightPerCell}g × {cellCount}칸)
            </span>
          </p>
        </div>
      )}

      {/* 메모 */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="memo" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          메모
        </label>
        <textarea
          id="memo"
          name="memo"
          rows={2}
          defaultValue={defaultValues?.memo}
          placeholder="재질, 구매처 등 자유롭게 입력"
          className="resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:ring-zinc-700"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-1 rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {isPending ? "저장 중..." : submitLabel}
      </button>
    </form>
  );
}
