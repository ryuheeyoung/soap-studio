"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { useSessionStore } from "@/stores/session";
import { calculateRequirements } from "@/lib/calculate";
import type { Recipe, Ingredient, IngredientCategory, PurchaseOption } from "@soap-studio/types";
import { INGREDIENT_CATEGORY_LABELS } from "@soap-studio/types";

// 부족량을 최소량으로 커버하는 최적 옵션
function findBestOption(options: PurchaseOption[], shortage: number): PurchaseOption | null {
  if (options.length === 0) return null;
  return options.reduce((best, opt) => {
    const bestTotal = Math.ceil(shortage / best.size) * best.size;
    const optTotal = Math.ceil(shortage / opt.size) * opt.size;
    return optTotal < bestTotal ? opt : best;
  });
}

// 재료별 구매 선택 상태
interface Selection {
  optionId: string;
  qty: number;
}

interface Props {
  recipes: Recipe[];
  ingredients: Ingredient[];
}

/**
 * @component
 * @description 총 부족 재료 패널. 구매옵션·수량 선택(추천값 기본) 및 JSON 복사 기능 포함
 * @param {Recipe[]} props.recipes - 전체 레시피 데이터
 * @param {Ingredient[]} props.ingredients - 전체 재료 데이터 (구매옵션 포함)
 */
export default function ResultPanel({ recipes, ingredients }: Props) {
  const { items } = useSessionStore();
  // ingredientId → { optionId, qty }
  const [selections, setSelections] = useState<Record<string, Selection>>({});
  const [copied, setCopied] = useState(false);

  if (items.length === 0) return null;

  const results = calculateRequirements(items, recipes, ingredients);
  const insufficient = results.filter((r) => !r.isSufficient);
  const ingredientMap = new Map(ingredients.map((i) => [i.id, i]));

  if (insufficient.length === 0) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900 dark:bg-emerald-950">
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">모든 재료 충분</p>
        <p className="text-xs text-emerald-600 dark:text-emerald-500">
          선택한 레시피를 모두 제작할 수 있어요
        </p>
      </div>
    );
  }

  // 수동 선택이 없으면 추천값(최적 옵션 + 자동 수량) 반환
  function getSelection(ingredientId: string, options: PurchaseOption[], shortage: number): Selection | null {
    const manual = selections[ingredientId];
    if (manual) return manual;
    const best = findBestOption(options, shortage);
    if (!best) return null;
    return { optionId: best.id, qty: Math.ceil(shortage / best.size) };
  }

  // 옵션 변경 → 수량 재계산
  function handleOptionChange(ingredientId: string, opt: PurchaseOption, shortage: number) {
    setSelections((prev) => ({
      ...prev,
      [ingredientId]: { optionId: opt.id, qty: Math.ceil(shortage / opt.size) },
    }));
  }

  // 수량만 수정 (옵션 유지)
  function handleQtyChange(ingredientId: string, optionId: string, qty: number) {
    setSelections((prev) => ({
      ...prev,
      [ingredientId]: { optionId, qty: Math.max(1, qty) },
    }));
  }

  async function handleCopy() {
    const list = insufficient.map((r) => {
      const ing = ingredientMap.get(r.ingredientId);
      const options = ing?.purchaseOptions ?? [];
      const sel = getSelection(r.ingredientId, options, r.shortage);
      const opt = sel ? options.find((o) => o.id === sel.optionId) : null;
      const add = opt && sel ? sel.qty * opt.size : r.shortage;
      return {
        ingredientId: r.ingredientId,
        name: r.name,
        unit: r.unit,
        shortage: r.shortage,
        add,
        ...(opt && sel ? { optionLabel: opt.label, qty: sel.qty } : {}),
      };
    });

    await navigator.clipboard.writeText(JSON.stringify(list, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        총 부족 재료
        <span className="ml-1.5 text-xs font-normal text-red-500">{insufficient.length}가지</span>
      </h2>

      <ul className="flex flex-col gap-2">
        {insufficient.map((r) => {
          const ing = ingredientMap.get(r.ingredientId);
          const options = ing?.purchaseOptions ?? [];
          const sel = getSelection(r.ingredientId, options, r.shortage);
          const selectedOpt = sel ? options.find((o) => o.id === sel.optionId) : null;
          const totalAdd = selectedOpt && sel ? sel.qty * selectedOpt.size : null;

          return (
            <li
              key={r.ingredientId}
              className="rounded-xl border border-red-100 bg-red-50 px-3 py-3 dark:border-red-900 dark:bg-red-950"
            >
              {/* 재료명 + 부족량 */}
              <div className="mb-2.5 flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{r.name}</span>
                  <span className="ml-1.5 text-xs text-zinc-400">
                    {INGREDIENT_CATEGORY_LABELS[r.category as IngredientCategory] ?? r.category}
                  </span>
                </div>
                <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-bold tabular-nums text-red-600 dark:bg-red-900 dark:text-red-400">
                  -{r.shortage}{r.unit}
                </span>
              </div>

              {options.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {/* 옵션 선택 */}
                  <div className="flex flex-wrap gap-1.5">
                    {options.map((opt) => {
                      const isSelected = sel?.optionId === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleOptionChange(r.ingredientId, opt, r.shortage)}
                          className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                            isSelected
                              ? "border-zinc-800 bg-zinc-900 text-white dark:border-zinc-200 dark:bg-zinc-50 dark:text-zinc-900"
                              : "border-zinc-200 text-zinc-500 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400"
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* 수량 입력 + 합계 */}
                  {sel && selectedOpt && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400">수량</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleQtyChange(r.ingredientId, sel.optionId, sel.qty - 1)}
                          className="flex h-6 w-6 items-center justify-center rounded border border-zinc-200 text-zinc-500 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={sel.qty}
                          onChange={(e) =>
                            handleQtyChange(r.ingredientId, sel.optionId, parseInt(e.target.value) || 1)
                          }
                          className="w-12 rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-center text-xs tabular-nums dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                        />
                        <button
                          type="button"
                          onClick={() => handleQtyChange(r.ingredientId, sel.optionId, sel.qty + 1)}
                          className="flex h-6 w-6 items-center justify-center rounded border border-zinc-200 text-zinc-500 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs text-zinc-400">개</span>
                      <span className="ml-auto text-xs font-medium text-zinc-600 dark:text-zinc-300">
                        +{totalAdd}{r.unit}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-zinc-400">구매 옵션 미등록 — 부족량({r.shortage}{r.unit}) 그대로 반영됩니다</p>
              )}
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
      >
        {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
        {copied ? "복사됐어요!" : "구매목록 복사 (JSON)"}
      </button>
    </div>
  );
}
