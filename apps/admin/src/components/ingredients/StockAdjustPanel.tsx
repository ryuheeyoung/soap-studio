"use client";

import { useState, useTransition } from "react";
import { ClipboardPaste, Check, AlertCircle } from "lucide-react";
import { batchAdjustStockAction } from "@/lib/actions/ingredients";
import type { Ingredient } from "@soap-studio/types";

// 구매목록 JSON 항목 타입 (ResultPanel에서 복사한 형식)
interface PurchaseItem {
  ingredientId: string;
  name: string;
  unit: string;
  shortage: number;
  add: number;
  optionLabel?: string;
  qty?: number;
}

// 프리뷰 행 — 현재 재고 + 추가량 + 적용 후 재고
interface PreviewRow extends PurchaseItem {
  currentStock: number;
  afterStock: number;
  found: boolean;
}

interface Props {
  ingredients: Ingredient[];
}

/**
 * @component
 * @description 구매목록 JSON 붙여넣기 → 재고 변경 미리보기 → 일괄 적용 패널
 * @param {Ingredient[]} props.ingredients - 현재 재고 조회용 전체 재료 목록
 */
export default function StockAdjustPanel({ ingredients }: Props) {
  // 붙여넣은 JSON 원문
  const [raw, setRaw] = useState("");
  // 파싱된 미리보기 행 목록
  const [preview, setPreview] = useState<PreviewRow[] | null>(null);
  // 파싱 오류 메시지
  const [parseError, setParseError] = useState<string | null>(null);
  // 적용 완료 여부
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const ingredientMap = new Map(ingredients.map((i) => [i.id, i]));

  function handleParse() {
    setDone(false);
    setParseError(null);

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw.trim());
    } catch {
      setParseError("JSON 형식이 올바르지 않아요. 계산기에서 복사한 값을 그대로 붙여넣어 주세요.");
      setPreview(null);
      return;
    }

    if (!Array.isArray(parsed)) {
      setParseError("배열 형식이어야 해요. [ ] 로 감싸진 JSON인지 확인해 주세요.");
      setPreview(null);
      return;
    }

    const rows: PreviewRow[] = (parsed as PurchaseItem[]).map((item) => {
      const ing = ingredientMap.get(item.ingredientId);
      return {
        ...item,
        currentStock: ing?.stock ?? 0,
        afterStock: (ing?.stock ?? 0) + (item.add ?? 0),
        found: !!ing,
      };
    });

    setPreview(rows);
  }

  function handleApply() {
    if (!preview) return;
    const items = preview
      .filter((r) => r.found && r.add > 0)
      .map((r) => ({ ingredientId: r.ingredientId, add: r.add }));

    startTransition(async () => {
      await batchAdjustStockAction(items);
      setDone(true);
      setRaw("");
      setPreview(null);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* JSON 입력 영역 */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          구매목록 JSON 붙여넣기
        </label>
        <textarea
          value={raw}
          onChange={(e) => { setRaw(e.target.value); setPreview(null); setParseError(null); setDone(false); }}
          rows={6}
          placeholder={'[\n  { "ingredientId": "...", "name": "...", "add": 100, ... }\n]'}
          className="resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 font-mono text-xs text-zinc-800 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:focus:ring-zinc-800"
        />

        {parseError && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 dark:border-red-900 dark:bg-red-950">
            <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-500" />
            <p className="text-xs text-red-600 dark:text-red-400">{parseError}</p>
          </div>
        )}

        <button
          type="button"
          onClick={handleParse}
          disabled={!raw.trim()}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          <ClipboardPaste size={14} />
          미리보기
        </button>
      </div>

      {/* 적용 완료 메시지 */}
      {done && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900 dark:bg-emerald-950">
          <Check size={15} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">재고가 업데이트됐어요!</p>
        </div>
      )}

      {/* 미리보기 테이블 */}
      {preview && preview.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            변경 미리보기
            <span className="ml-1.5 font-normal text-zinc-400">{preview.length}개 재료</span>
          </h2>

          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">재료명</th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-500">현재 재고</th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-500">추가량</th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-500">적용 후</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row) => (
                  <tr
                    key={row.ingredientId}
                    className={`border-b border-zinc-50 last:border-0 dark:border-zinc-800 ${
                      !row.found ? "opacity-40" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-zinc-900 dark:text-zinc-50">{row.name}</span>
                      {!row.found && (
                        <span className="ml-2 text-xs text-red-400">미등록 재료</span>
                      )}
                      {row.optionLabel && (
                        <span className="ml-2 text-xs text-zinc-400">{row.optionLabel} × {row.qty}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-500">
                      {row.currentStock.toLocaleString()} {row.unit}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium text-emerald-600 dark:text-emerald-400">
                      +{row.add.toLocaleString()} {row.unit}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-zinc-900 dark:text-zinc-50">
                      {row.afterStock.toLocaleString()} {row.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={handleApply}
            disabled={isPending || preview.every((r) => !r.found)}
            className="rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {isPending ? "적용 중..." : "재고 일괄 적용"}
          </button>
        </div>
      )}
    </div>
  );
}
