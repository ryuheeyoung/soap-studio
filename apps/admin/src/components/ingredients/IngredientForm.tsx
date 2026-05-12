"use client";

import { useActionState } from "react";
import type { Ingredient } from "@soap-studio/types";

// 재료 카테고리 선택 옵션 목록
const CATEGORY_OPTIONS: { value: Ingredient["category"]; label: string }[] = [
  { value: "soap_base", label: "비누베이스" },
  { value: "oil", label: "오일류" },
  { value: "butter", label: "버터류" },
  { value: "lye", label: "가성소다/가성가리" },
  { value: "water", label: "수분류" },
  { value: "surfactant", label: "계면활성제" },
  { value: "emulsifier", label: "유화제" },
  { value: "powder", label: "분말류" },
  { value: "additive", label: "첨가물" },
  { value: "essential_oil", label: "에센셜오일/블렌딩오일" },
  { value: "colorant", label: "색소" },
  { value: "other", label: "기타" },
];

// 단위 선택 옵션 목록
const UNIT_OPTIONS: { value: Ingredient["unit"]; label: string }[] = [
  { value: "g", label: "g (그램)" },
  { value: "ml", label: "ml (밀리리터)" },
  { value: "ea", label: "ea (개)" },
];

interface Props {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: Partial<Ingredient>;
  submitLabel: string;
}

/**
 * @component
 * @description 재료 추가/수정 공용 폼 컴포넌트
 * @param {Function} props.action - 폼 제출 시 실행할 Server Action
 * @param {Partial<Ingredient>} props.defaultValues - 수정 시 기존 값 (추가 시 생략)
 * @param {string} props.submitLabel - 제출 버튼 텍스트
 */
export default function IngredientForm({
  action,
  defaultValues,
  submitLabel,
}: Props) {
  const [_state, formAction, isPending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      await action(formData);
    },
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* 재료명 */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          재료명 <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={defaultValues?.name}
          placeholder="예: 판테놀"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:ring-zinc-700"
        />
      </div>

      {/* 카테고리 */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="category" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          카테고리 <span className="text-red-500">*</span>
        </label>
        <select
          id="category"
          name="category"
          required
          defaultValue={defaultValues?.category ?? ""}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:ring-zinc-700"
        >
          <option value="" disabled>카테고리 선택</option>
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* 단위 + 현재 재고 */}
      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="unit" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            단위 <span className="text-red-500">*</span>
          </label>
          <select
            id="unit"
            name="unit"
            required
            defaultValue={defaultValues?.unit ?? "g"}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:ring-zinc-700"
          >
            {UNIT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="stock" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            현재 재고
          </label>
          <input
            id="stock"
            name="stock"
            type="number"
            min="0"
            step="0.1"
            defaultValue={defaultValues?.stock ?? 0}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:ring-zinc-700"
          />
        </div>
      </div>

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
          placeholder="보관 방법, 구매처 등 자유롭게 입력"
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
