"use client";

import { useState, useActionState } from "react";
import { Plus, Trash2 } from "lucide-react";
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

// 폼 내 구매옵션 행 타입 (key는 클라이언트 임시 식별자)
interface OptionRow {
  key: string;
  size: string;
}

interface Props {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: Partial<Ingredient>;
  submitLabel: string;
}

/**
 * @component
 * @description 재료 추가/수정 공용 폼. 기본 정보 및 구매옵션 동적 목록 포함
 * @param {Function} props.action - 폼 제출 시 실행할 Server Action
 * @param {Partial<Ingredient>} props.defaultValues - 수정 시 기존 값
 * @param {string} props.submitLabel - 제출 버튼 텍스트
 */
export default function IngredientForm({ action, defaultValues, submitLabel }: Props) {
  // 현재 선택된 단위 (구매옵션 표시에 사용)
  const [unit, setUnit] = useState<string>(defaultValues?.unit ?? "g");

  // 구매옵션 행 상태 (기존 값으로 초기화)
  const [options, setOptions] = useState<OptionRow[]>(
    () =>
      defaultValues?.purchaseOptions?.map((o) => ({
        key: o.id,
        size: String(o.size),
      })) ?? []
  );

  const [_state, formAction, isPending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      // size만으로 label 자동 생성 ("30ml", "500g" 등)
      const currentUnit = formData.get("unit") as string;
      formData.set(
        "purchaseOptions",
        JSON.stringify(
          options.map((o) => ({ label: `${o.size}${currentUnit}`, size: o.size }))
        )
      );
      await action(formData);
    },
    null
  );

  function addOption() {
    setOptions((prev) => [...prev, { key: crypto.randomUUID(), size: "" }]);
  }

  function removeOption(key: string) {
    setOptions((prev) => prev.filter((o) => o.key !== key));
  }

  function updateSize(key: string, value: string) {
    setOptions((prev) => prev.map((o) => (o.key === key ? { ...o, size: value } : o)));
  }

  const inputClass =
    "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:ring-zinc-700";

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
          className={inputClass}
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
          className={inputClass}
        >
          <option value="" disabled>카테고리 선택</option>
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
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
            onChange={(e) => setUnit(e.target.value)}
            className={inputClass}
          >
            {UNIT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
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
            className={inputClass}
          />
        </div>
      </div>

      {/* 구매 옵션 */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            구매 옵션
          </span>
          <button
            type="button"
            onClick={addOption}
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            <Plus size={13} />
            옵션 추가
          </button>
        </div>

        {options.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-200 px-3 py-3 text-center text-xs text-zinc-400 dark:border-zinc-700">
            구매 옵션 없음
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {options.map((opt) => (
              <li key={opt.key} className="flex items-center gap-2">
                <input
                  type="number"
                  value={opt.size}
                  onChange={(e) => updateSize(opt.key, e.target.value)}
                  placeholder="0"
                  min="0"
                  step="any"
                  className={`w-32 ${inputClass}`}
                />
                <span className="text-sm text-zinc-500">{unit}</span>
                <button
                  type="button"
                  onClick={() => removeOption(opt.key)}
                  className="ml-auto text-zinc-400 hover:text-red-500"
                >
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-zinc-400">
          구매 가능한 용량 단위를 추가하세요. 예: 30, 50, 100 ({unit})
        </p>
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
          className={`resize-none ${inputClass}`}
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
