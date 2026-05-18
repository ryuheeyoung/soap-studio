"use client";

import { useActionState, useState } from "react";
import type { Mold } from "@soap-studio/types";
import { Button, Input, Select, Textarea, FormLabel } from "@soap-studio/ui";

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
        <FormLabel htmlFor="name">
          몰드명 <span className="text-red-500">*</span>
        </FormLabel>
        <Input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={defaultValues?.name}
          placeholder="예: 하트 4구 몰드"
        />
      </div>

      {/* 형태 */}
      <div className="flex flex-col gap-1.5">
        <FormLabel htmlFor="shape">
          형태 <span className="text-red-500">*</span>
        </FormLabel>
        <Select
          id="shape"
          name="shape"
          required
          defaultValue={defaultValues?.shape ?? "rectangle"}
        >
          {SHAPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Select>
      </div>

      {/* 칸당 무게 + 칸 수 */}
      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1.5">
          <FormLabel htmlFor="weightPerCell">
            칸당 용량 (g) <span className="text-red-500">*</span>
          </FormLabel>
          <Input
            id="weightPerCell"
            name="weightPerCell"
            type="number"
            min="1"
            step="0.1"
            required
            value={weightPerCell || ""}
            onChange={(e) => setWeightPerCell(parseFloat(e.target.value) || 0)}
            placeholder="예: 90"
          />
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          <FormLabel htmlFor="cellCount">
            칸 수 <span className="text-red-500">*</span>
          </FormLabel>
          <Input
            id="cellCount"
            name="cellCount"
            type="number"
            min="1"
            step="1"
            required
            value={cellCount || ""}
            onChange={(e) => setCellCount(parseInt(e.target.value, 10) || 0)}
            placeholder="예: 6"
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
        <FormLabel htmlFor="memo">메모</FormLabel>
        <Textarea
          id="memo"
          name="memo"
          rows={2}
          defaultValue={defaultValues?.memo}
          placeholder="재질, 구매처 등 자유롭게 입력"
        />
      </div>

      <Button type="submit" disabled={isPending} className="mt-1 w-full">
        {isPending ? "저장 중..." : submitLabel}
      </Button>
    </form>
  );
}
