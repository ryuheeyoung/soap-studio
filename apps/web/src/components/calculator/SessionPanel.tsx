"use client";

import { useState } from "react";
import { Trash2, X, Copy, Check } from "lucide-react";
import { useSessionStore } from "@/stores/session";
import { calculateRequirements, recommendMolds } from "@/lib/calculate";
import type { Recipe, Ingredient, Mold, IngredientCategory } from "@soap-studio/types";

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
  molds: Mold[];
}

/**
 * @component
 * @description 현재 세션에 담긴 레시피 목록 패널. 배율 조정, 삭제, 재료 소요량 및 추천 몰드를 카드 내에 표시
 * @param {Recipe[]} props.recipes - 전체 레시피 데이터
 * @param {Ingredient[]} props.ingredients - 전체 재료 데이터 (재고 포함)
 * @param {Mold[]} props.molds - 전체 몰드 목록
 */
export default function SessionPanel({ recipes, ingredients, molds }: Props) {
  const { items, setScale, removeRecipe, clearSession } = useSessionStore();
  // 소요량 복사 완료 상태
  const [copied, setCopied] = useState(false);

  async function handleCopyRequired() {
    const allResults = calculateRequirements(items, recipes, ingredients);
    const list = allResults.map((r) => ({
      ingredientId: r.ingredientId,
      name: r.name,
      unit: r.unit,
      deduct: r.required,
    }));
    await navigator.clipboard.writeText(JSON.stringify(list, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-center dark:border-zinc-700">
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          레시피 탭에서 계산기에 추가해보세요
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          선택된 레시피 {items.length}개
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyRequired}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
            {copied ? "복사됨!" : "소요량 복사"}
          </button>
          <button
            onClick={clearSession}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <Trash2 size={12} />
            전체 삭제
          </button>
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        {items.map((item) => {
          // 이 레시피 단독 기준 재료 계산
          const results = calculateRequirements([item], recipes, ingredients);
          const effectiveBatchSize = Math.round(item.batchSize * item.scale);
          // 최적 몰드 1개
          const topMold = recommendMolds(effectiveBatchSize, molds)[0];
          const hasShortage = results.some((r) => !r.isSufficient);

          return (
            <li
              key={item.recipeId}
              className={`rounded-xl border bg-white dark:bg-zinc-900 ${
                hasShortage
                  ? "border-red-200 dark:border-red-900"
                  : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              {/* 상단: 레시피명 + 배율 + 삭제 */}
              <div className="flex items-center gap-3 p-3">
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {item.recipeName}
                </span>

                {/* 배율 조정 */}
                <div className="flex items-center gap-1.5 text-sm">
                  <button
                    onClick={() =>
                      setScale(
                        item.recipeId,
                        Math.max(0.5, Math.round((item.scale - 0.5) * 10) / 10)
                      )
                    }
                    className="flex h-6 w-6 items-center justify-center rounded border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    −
                  </button>
                  <span className="w-10 text-center tabular-nums text-zinc-800 dark:text-zinc-200">
                    ×{item.scale}
                  </span>
                  <button
                    onClick={() =>
                      setScale(item.recipeId, Math.round((item.scale + 0.5) * 10) / 10)
                    }
                    className="flex h-6 w-6 items-center justify-center rounded border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    +
                  </button>
                </div>

                <span className="w-14 text-right text-xs tabular-nums text-zinc-400">
                  {effectiveBatchSize}g
                </span>

                <button
                  onClick={() => removeRecipe(item.recipeId)}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X size={14} />
                </button>
              </div>

              {/* 하단: 재료 소요량 + 추천 몰드 */}
              {results.length > 0 && (
                <div className="border-t border-zinc-100 px-3 pb-3 pt-2.5 dark:border-zinc-800">
                  <ul className="flex flex-col gap-1">
                    {results.map((r) => (
                      <li
                        key={r.ingredientId}
                        className="flex items-center justify-between gap-2"
                      >
                        <span
                          className={`truncate text-xs ${
                            r.isSufficient
                              ? "text-zinc-400 dark:text-zinc-500"
                              : "font-medium text-zinc-700 dark:text-zinc-300"
                          }`}
                        >
                          {r.name}
                          <span className="ml-1 text-zinc-300 dark:text-zinc-600">
                            {CATEGORY_LABEL[r.category as IngredientCategory] ?? r.category}
                          </span>
                        </span>
                        <span
                          className={`shrink-0 text-xs tabular-nums ${
                            r.isSufficient
                              ? "text-zinc-400 dark:text-zinc-500"
                              : "font-semibold text-red-500"
                          }`}
                        >
                          {r.required}
                          <span className="mx-0.5 text-zinc-300 dark:text-zinc-600">/</span>
                          {r.inStock}{r.unit}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* 추천 몰드 */}
                  {topMold && (
                    <div className="mt-2 flex items-center justify-between border-t border-zinc-100 pt-2 dark:border-zinc-800">
                      <span className="text-xs text-zinc-400">추천 몰드</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-zinc-600 dark:text-zinc-400">
                          {topMold.molds.map((m) => m.name).join(" + ")}
                        </span>
                        <span
                          className={`text-xs font-medium ${
                            Math.abs(topMold.remainder) <= 20
                              ? "text-emerald-600 dark:text-emerald-400"
                              : topMold.remainder < 0
                              ? "text-red-500"
                              : "text-zinc-400"
                          }`}
                        >
                          {Math.abs(topMold.remainder) <= 20
                            ? "딱 맞음"
                            : topMold.remainder < 0
                            ? `${Math.abs(topMold.remainder).toFixed(0)}g 초과`
                            : `${topMold.remainder.toFixed(0)}g 남음`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
