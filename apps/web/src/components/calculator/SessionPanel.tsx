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
  const { items, setScale, removeRecipe, clearSession, setAmountOverride, setSubstitute } = useSessionStore();
  // 소요량 복사 완료 상태
  const [copied, setCopied] = useState(false);
  // 레시피별 선택된 몰드 ID
  const [moldSelections, setMoldSelections] = useState<Record<string, string | null>>({});
  // 레시피 ID → Recipe 조회용 맵
  const recipeMap = new Map(recipes.map((r) => [r.id, r]));
  // 재료 ID → Ingredient 조회용 맵
  const ingredientMap = new Map(ingredients.map((i) => [i.id, i]));

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
      const moldIds = optionKey.split("+");
      const selectedMolds = moldIds.map((id) => molds.find((m) => m.id === id)).filter((m): m is Mold => !!m);
      if (selectedMolds.length === 0) continue;

      if (selectedMolds.length === 1) {
        const mold = selectedMolds[0];
        const cellsUsed = Math.ceil(batchSize / mold.weightPerCell);
        available[mold.id] = Math.max(0, (available[mold.id] ?? mold.cellCount) - cellsUsed);
      } else {
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
          const results = calculateRequirements([item], recipes, ingredients);
          const effectiveBatchSize = Math.round(item.batchSize * item.scale);
          const recipe = recipeMap.get(item.recipeId);
          const moldOptions = filterMoldsForRecipe(
            effectiveBatchSize,
            molds,
            getAvailableCells(item.recipeId)
          );
          const selectedMoldId = moldSelections[item.recipeId] ?? null;
          const hasShortage = results.some((r) => !r.isSufficient);

          // originalIngredientId → RecipeIngredient 맵 (범위·대체 컨트롤 렌더링용)
          const recipeIngMap = new Map(
            recipe?.ingredients.map((ing) => [ing.ingredientId, ing]) ?? []
          );
          // originalIngredientId → RecipeSubstitute 맵
          const substituteMap = new Map(
            recipe?.substitutes.map((s) => [s.originalIngredientId, s]) ?? []
          );

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
                  <ul className="flex flex-col gap-2">
                    {results.map((r) => {
                      // 원래 재료 ID (대체재료 선택 중이면 originalIngredientId, 아니면 ingredientId)
                      const originalId = r.originalIngredientId ?? r.ingredientId;
                      const recipeIng = recipeIngMap.get(originalId);
                      const substituteDef = substituteMap.get(originalId);
                      const isSubstituteActive = !!r.originalIngredientId;

                      // 범위 재료 여부
                      const isRange = recipeIng?.amountMin != null && recipeIng?.amountMax != null;

                      // 대체재료 이름
                      const substituteName = substituteDef
                        ? ingredientMap.get(substituteDef.substituteIngredientId)?.name
                        : null;

                      // 오버라이드 여부 (리셋 버튼 표시 기준)
                      const isOverridden = item.amountOverrides?.[originalId] != null;

                      return (
                        <li key={r.ingredientId} className="flex flex-col gap-1">
                          {/* 재료명 + 소요량/재고 */}
                          <div className="flex items-center justify-between gap-2">
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
                            <div className="flex shrink-0 items-center gap-1">
                              {/* 범위 재료: 필요량을 직접 입력 가능한 input으로 표시 */}
                              {isRange && recipeIng ? (
                                <input
                                  type="number"
                                  value={r.required}
                                  min={recipeIng.amountMin! * item.scale}
                                  max={recipeIng.amountMax! * item.scale}
                                  step={1}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    if (!isNaN(val) && val > 0) {
                                      setAmountOverride(
                                        item.recipeId,
                                        originalId,
                                        Math.round((val / item.scale) * 100) / 100
                                      );
                                    }
                                  }}
                                  className={`w-12 bg-transparent text-right text-xs tabular-nums focus:outline-none focus:border-b focus:border-zinc-400 dark:focus:border-zinc-500 ${
                                    r.isSufficient
                                      ? isOverridden
                                        ? "text-zinc-600 dark:text-zinc-300"
                                        : "text-zinc-400 dark:text-zinc-500"
                                      : "font-semibold text-red-500"
                                  }`}
                                />
                              ) : (
                                <span
                                  className={`text-xs tabular-nums ${
                                    r.isSufficient
                                      ? "text-zinc-400 dark:text-zinc-500"
                                      : "font-semibold text-red-500"
                                  }`}
                                >
                                  {r.required}
                                </span>
                              )}
                              <span className="text-xs text-zinc-300 dark:text-zinc-600">/</span>
                              <span
                                className={`text-xs tabular-nums ${
                                  r.isSufficient ? "text-zinc-400 dark:text-zinc-500" : "text-red-500"
                                }`}
                              >
                                {r.inStock}{r.unit}
                              </span>
                              {/* 오버라이드 중일 때 리셋 버튼 */}
                              {isOverridden && (
                                <button
                                  type="button"
                                  onClick={() => setAmountOverride(item.recipeId, originalId, null)}
                                  className="text-[10px] text-zinc-300 hover:text-zinc-500 dark:text-zinc-600 dark:hover:text-zinc-400"
                                  title="기본값으로 되돌리기"
                                >
                                  ↺
                                </button>
                              )}
                            </div>
                          </div>

                          {/* 범위 힌트 텍스트 */}
                          {isRange && recipeIng && (
                            <p className="text-[11px] text-zinc-300 dark:text-zinc-600">
                              {recipeIng.amountMin}~{recipeIng.amountMax}{r.unit}
                            </p>
                          )}

                          {/* 대체재료 토글 */}
                          {substituteDef && substituteName && (
                            <button
                              type="button"
                              onClick={() =>
                                setSubstitute(
                                  item.recipeId,
                                  originalId,
                                  isSubstituteActive ? null : substituteDef.substituteIngredientId
                                )
                              }
                              className={`self-start rounded-full border px-2 py-0.5 text-[11px] transition ${
                                isSubstituteActive
                                  ? "border-zinc-600 bg-zinc-700 text-white dark:border-zinc-400 dark:bg-zinc-200 dark:text-zinc-900"
                                  : "border-zinc-200 text-zinc-400 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-500"
                              }`}
                            >
                              {isSubstituteActive ? `↩ 원래: ${r.name}` : `↔ 대체: ${substituteName}`}
                            </button>
                          )}
                        </li>
                      );
                    })}
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
