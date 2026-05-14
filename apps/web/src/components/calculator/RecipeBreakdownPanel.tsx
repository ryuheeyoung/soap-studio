"use client";

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
 * @description 레시피별 소요 재료 및 몰드 추천 패널. 각 레시피의 배율 적용 후 재료 충족 여부와 적합 몰드를 표시
 * @param {Recipe[]} props.recipes - 전체 레시피 데이터
 * @param {Ingredient[]} props.ingredients - 전체 재료 데이터 (재고 포함)
 * @param {Mold[]} props.molds - 전체 몰드 목록
 */
export default function RecipeBreakdownPanel({ recipes, ingredients, molds }: Props) {
  const { items } = useSessionStore();

  if (items.length === 0) return null;

  const recipeMap = new Map(recipes.map((r) => [r.id, r]));

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">레시피별 소요량</h2>

      {items.map((item) => {
        const recipe = recipeMap.get(item.recipeId);
        if (!recipe) return null;

        // 이 레시피 단독 기준으로 재료 계산
        const results = calculateRequirements([item], recipes, ingredients);
        const effectiveBatchSize = Math.round(item.batchSize * item.scale);
        // 몰드 추천 상위 2개
        const moldRecs = recommendMolds(effectiveBatchSize, molds).slice(0, 2);
        const hasShortage = results.some((r) => !r.isSufficient);

        return (
          <div
            key={item.recipeId}
            className={`rounded-xl border bg-white p-4 dark:bg-zinc-900 ${
              hasShortage
                ? "border-red-200 dark:border-red-900"
                : "border-zinc-200 dark:border-zinc-800"
            }`}
          >
            {/* 레시피명 + 배치 용량 */}
            <div className="mb-3 flex items-baseline justify-between">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                {item.recipeName}
              </h3>
              <span className="text-xs tabular-nums text-zinc-400">{effectiveBatchSize}g</span>
            </div>

            {/* 재료 목록 */}
            {results.length > 0 ? (
              <ul className="mb-3 flex flex-col gap-1.5">
                {results.map((r) => (
                  <li
                    key={r.ingredientId}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    {/* 재료명 + 카테고리 */}
                    <div className="min-w-0 flex-1">
                      <span
                        className={
                          r.isSufficient
                            ? "text-zinc-600 dark:text-zinc-400"
                            : "font-medium text-zinc-900 dark:text-zinc-50"
                        }
                      >
                        {r.name}
                      </span>
                      <span className="ml-1.5 text-xs text-zinc-400">
                        {CATEGORY_LABEL[r.category as IngredientCategory] ?? r.category}
                      </span>
                    </div>

                    {/* 필요량 / 재고 */}
                    <span
                      className={`shrink-0 tabular-nums ${
                        r.isSufficient
                          ? "text-zinc-400 dark:text-zinc-500"
                          : "font-semibold text-red-500"
                      }`}
                    >
                      {r.required}
                      <span className="mx-0.5 text-zinc-300 dark:text-zinc-600">/</span>
                      {r.inStock}
                      <span className="ml-0.5 text-xs font-normal">{r.unit}</span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mb-3 text-xs text-zinc-400">재료 정보 없음</p>
            )}

            {/* 몰드 추천 */}
            {moldRecs.length > 0 && (
              <div className="border-t border-zinc-100 pt-3 dark:border-zinc-800">
                <p className="mb-2 text-xs text-zinc-400">추천 몰드</p>
                <ul className="flex flex-col gap-1.5">
                  {moldRecs.map(({ molds, remainder, fillRatio }) => {
                    const isFit = Math.abs(remainder) <= 20;
                    const isOver = remainder < 0;
                    const pct = Math.round(fillRatio * 100);
                    const totalCapacity = molds.reduce((s, m) => s + m.totalCapacity, 0);
                    const key = molds.map((m) => m.id).join("-");

                    return (
                      <li key={key} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-zinc-700 dark:text-zinc-300">
                            {molds.map((m) => m.name).join(" + ")}
                          </span>
                          <span
                            className={`text-xs font-medium ${
                              isFit
                                ? "text-emerald-600 dark:text-emerald-400"
                                : isOver
                                ? "text-red-500"
                                : "text-zinc-400"
                            }`}
                          >
                            {isFit
                              ? "딱 맞음"
                              : isOver
                              ? `${Math.abs(remainder).toFixed(0)}g 초과`
                              : `${remainder.toFixed(0)}g 남음`}
                          </span>
                        </div>
                        {/* 채움 비율 바 */}
                        <div className="flex items-center gap-2">
                          <div className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                            <div
                              className={`h-full rounded-full ${
                                isFit ? "bg-emerald-500" : isOver ? "bg-red-400" : "bg-zinc-400"
                              }`}
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>
                          <span className="shrink-0 text-xs tabular-nums text-zinc-400">
                            {totalCapacity}g · {pct}%
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
