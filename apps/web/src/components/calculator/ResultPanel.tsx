"use client";

import { useSessionStore } from "@/stores/session";
import { calculateRequirements } from "@/lib/calculate";
import type { Recipe, Ingredient, IngredientCategory } from "@soap-studio/types";

// 카테고리 한글 레이블
const CATEGORY_LABEL: Record<IngredientCategory, string> = {
  soap_base: "비누베이스",
  oil: "오일",
  butter: "버터",
  lye: "가성소다/가성가리",
  water: "수분류",
  surfactant: "계면활성제",
  emulsifier: "유화제",
  powder: "분말류",
  additive: "첨가물",
  essential_oil: "에센셜오일",
  colorant: "색소",
  other: "기타",
};

interface Props {
  recipes: Recipe[];
  ingredients: Ingredient[];
}

/**
 * @component
 * @description 재료별 필요량 / 재고 / 부족량 결과 패널. 세션 항목 기반 실시간 계산
 * @param {Recipe[]} props.recipes - 전체 레시피 데이터
 * @param {Ingredient[]} props.ingredients - 전체 재료 데이터 (재고 포함)
 */
export default function ResultPanel({ recipes, ingredients }: Props) {
  const { items } = useSessionStore();

  if (items.length === 0) return null;

  const results = calculateRequirements(items, recipes, ingredients);

  if (results.length === 0) {
    return (
      <p className="text-sm text-zinc-500">계산할 재료 데이터가 없어요.</p>
    );
  }

  // 부족/충분 그룹 분리
  const insufficient = results.filter((r) => !r.isSufficient);
  const sufficient = results.filter((r) => r.isSufficient);

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">재료 소요량</h2>

      {/* 부족 재료 */}
      {insufficient.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-red-500">
            부족 ({insufficient.length}가지)
          </p>
          <ul className="flex flex-col gap-1">
            {insufficient.map((r) => (
              <li
                key={r.ingredientId}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-2 rounded-lg bg-red-50 px-3 py-2 dark:bg-red-950"
              >
                <div>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {r.name}
                  </span>
                  <span className="ml-1.5 text-xs text-zinc-400">
                    {CATEGORY_LABEL[r.category as IngredientCategory] ?? r.category}
                  </span>
                </div>
                <div className="text-right text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="tabular-nums">{r.required}{r.unit}</span>
                  <span className="mx-1 text-zinc-300 dark:text-zinc-600">/</span>
                  <span className="tabular-nums">{r.inStock}{r.unit}</span>
                </div>
                <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-red-600 dark:bg-red-900 dark:text-red-400">
                  -{r.shortage}{r.unit}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 충분한 재료 */}
      {sufficient.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-zinc-400 dark:text-zinc-500">
            충분 ({sufficient.length}가지)
          </p>
          <ul className="flex flex-col gap-1">
            {sufficient.map((r) => (
              <li
                key={r.ingredientId}
                className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-lg px-3 py-2 odd:bg-zinc-50 dark:odd:bg-zinc-900"
              >
                <div>
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">{r.name}</span>
                  <span className="ml-1.5 text-xs text-zinc-400">
                    {CATEGORY_LABEL[r.category as IngredientCategory] ?? r.category}
                  </span>
                </div>
                <span className="text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                  {r.required}{r.unit}
                  <span className="mx-1 text-zinc-300 dark:text-zinc-600">/</span>
                  {r.inStock}{r.unit}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
