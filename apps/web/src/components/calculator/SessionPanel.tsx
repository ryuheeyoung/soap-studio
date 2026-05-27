"use client";

import { useState } from "react";
import { Trash2, X, Copy, Check } from "lucide-react";
import { useSessionStore } from "@/stores/session";
import { calculateRequirements, filterMoldsForRecipe } from "@/lib/calculate";
import type { Recipe, Ingredient, Mold, IngredientCategory } from "@soap-studio/types";
import { INGREDIENT_CATEGORY_LABELS } from "@soap-studio/types";
import { Button, Card } from "@soap-studio/ui";

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
  // 레시피별 선택된 몰드 ID
  const [moldSelections, setMoldSelections] = useState<Record<string, string | null>>({});
  // 레시피 ID → Recipe 조회용 맵
  const recipeMap = new Map(recipes.map((r) => [r.id, r]));

  /**
   * @function
   * @description 특정 레시피를 제외한 나머지 선택 기준으로 몰드별 잔여 칸 계산
   * @param {string} excludeRecipeId - 계산에서 제외할 레시피 ID (현재 레시피 자신)
   * @returns {Record<string, number>} 몰드 ID별 잔여 칸 수
   */
  function getAvailableCells(excludeRecipeId: string): Record<string, number> {
    const available: Record<string, number> = Object.fromEntries(
      molds.map((m) => [m.id, m.cellCount])
    );
    for (const [recipeId, optionKey] of Object.entries(moldSelections)) {
      if (recipeId === excludeRecipeId || !optionKey) continue;
      const item = items.find((i) => i.recipeId === recipeId);
      if (!item) continue;
      const batchSize = Math.round(item.batchSize * item.scale);
      // optionKey는 단일 moldId 또는 "moldId1+moldId2" 형태
      const moldIds = optionKey.split("+");
      const selectedMolds = moldIds.map((id) => molds.find((m) => m.id === id)).filter((m): m is Mold => !!m);
      if (selectedMolds.length === 0) continue;

      if (selectedMolds.length === 1) {
        const mold = selectedMolds[0];
        const cellsUsed = Math.ceil(batchSize / mold.weightPerCell);
        available[mold.id] = Math.max(0, (available[mold.id] ?? mold.cellCount) - cellsUsed);
      } else {
        // 조합: 첫 번째 몰드 전체 사용, 나머지를 두 번째로
        const [first, second] = selectedMolds;
        available[first.id] = Math.max(0, (available[first.id] ?? first.cellCount) - first.cellCount);
        const remainder = batchSize - first.cellCount * first.weightPerCell;
        if (remainder > 0) {
          const secondCellsUsed = Math.ceil(remainder / second.weightPerCell);
          available[second.id] = Math.max(0, (available[second.id] ?? second.cellCount) - secondCellsUsed);
        }
      }
    }
    return available;
  }

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
          <Button variant="text" onClick={handleCopyRequired}>
            {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
            {copied ? "복사됨!" : "소요량 복사"}
          </Button>
          <Button variant="text" onClick={clearSession}>
            <Trash2 size={12} />
            전체 삭제
          </Button>
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        {items.map((item) => {
          // 이 레시피 단독 기준 재료 계산
          const results = calculateRequirements([item], recipes, ingredients);
          const effectiveBatchSize = Math.round(item.batchSize * item.scale);
          const recipe = recipeMap.get(item.recipeId);
          // 다른 레시피 선택을 반영한 잔여 칸 기준 몰드 옵션
          const moldOptions = filterMoldsForRecipe(
            effectiveBatchSize,
            molds,
            getAvailableCells(item.recipeId)
          );
          const selectedMoldId = moldSelections[item.recipeId] ?? null;
          const hasShortage = results.some((r) => !r.isSufficient);

          return (
            <li key={item.recipeId}>
              <Card borderColor={hasShortage ? "border-red-200 dark:border-red-900" : undefined}>
              {/* 상단: 레시피명 + 배율 + 삭제 */}
              <div className="flex items-center gap-3 p-3">
                <span className="min-w-0 flex-1 block truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
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

              {/* 메모: 전체 너비, 줄바꿈 유지 */}
              {recipe?.memo && (
                <div className="px-3 pb-2">
                  <p className="text-xs leading-snug text-zinc-400 whitespace-pre-line dark:text-zinc-500">
                    {recipe.memo}
                  </p>
                </div>
              )}

              {/* 하단: 재료 소요량 + 추천 몰드 */}
              {results.length > 0 && (
                <div className="border-t border-zinc-100 px-3 pb-3 pt-2.5 dark:border-zinc-800">
                  <ul className="flex flex-col gap-1.5">
                    {results.map((r) => (
                      <li key={r.ingredientId} className="flex items-center justify-between gap-2">
                        <span
                          className={`truncate text-xs ${
                            r.isSufficient
                              ? "text-zinc-400 dark:text-zinc-500"
                              : "font-medium text-zinc-700 dark:text-zinc-300"
                          }`}
                        >
                          {r.name}
                          <span className="ml-1 text-zinc-300 dark:text-zinc-600">
                            {INGREDIENT_CATEGORY_LABELS[r.category as IngredientCategory] ?? r.category}
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

                  {/* 몰드 선택 */}
                  {moldOptions.length > 0 && (
                    <div className="mt-2 flex items-start gap-2 border-t border-zinc-100 pt-2 dark:border-zinc-800">
                      <span className="shrink-0 text-xs text-zinc-400">몰드</span>
                      <div className="flex flex-wrap gap-1">
                        {moldOptions.map(({ molds: optionMolds, cellsMap, isAvailable }) => {
                          const optionKey = optionMolds.map((m) => m.id).join("+");
                          const isSelected = selectedMoldId === optionKey;
                          return (
                            <button
                              key={optionKey}
                              type="button"
                              disabled={!isAvailable && !isSelected}
                              onClick={() =>
                                setMoldSelections((prev) => ({
                                  ...prev,
                                  [item.recipeId]: isSelected ? null : optionKey,
                                }))
                              }
                              className={`rounded-full border px-2.5 py-0.5 text-xs transition ${
                                isSelected
                                  ? "border-zinc-700 bg-zinc-800 text-white dark:border-zinc-300 dark:bg-zinc-100 dark:text-zinc-900"
                                  : isAvailable
                                  ? "border-zinc-200 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400"
                                  : "cursor-not-allowed border-zinc-100 text-zinc-300 dark:border-zinc-800 dark:text-zinc-600"
                              }`}
                            >
                              {optionMolds.map((m) => m.name).join("+")}
                              <span className="ml-1 opacity-60">
                                ({optionMolds.map((m) => `${cellsMap[m.id]}칸`).join("+")})
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
