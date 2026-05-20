"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import type { Ingredient, IngredientCategory } from "@soap-studio/types";
import { INGREDIENT_CATEGORY_LABELS, INGREDIENT_CATEGORY_ORDER } from "@soap-studio/types";

interface Props {
  ingredients: Ingredient[];
  // 재료 ID별 최소 필요량 (레시피 기반)
  minRequiredMap: Record<string, number>;
}

/**
 * @component
 * @description 재료 목록 클라이언트 필터. 이름 검색 → 카테고리 그룹 또는 플랫 목록으로 표시
 * @param {Ingredient[]} props.ingredients - 전체 재료 목록
 */
/**
 * @function
 * @description 재고 수치 색상 결정. 소진 시 red, 최소 필요량 미달 시 orange, 정상 시 기본색
 * @param {Ingredient} ing - 재료
 * @param {Record<string, number>} minRequiredMap - 재료별 최소 필요량
 * @returns {string} Tailwind 텍스트 색상 클래스
 */
function stockColorClass(ing: Ingredient, minRequiredMap: Record<string, number>): string {
  if (ing.stock === 0) return "text-red-500";
  const minRequired = minRequiredMap[ing.id];
  if (minRequired != null && ing.stock < minRequired) return "text-orange-400";
  return "text-zinc-600 dark:text-zinc-400";
}

export default function IngredientsFilter({ ingredients, minRequiredMap }: Props) {
  // 이름 검색어
  const [query, setQuery] = useState("");

  const trimmed = query.trim().toLowerCase();
  const filtered = trimmed
    ? ingredients.filter((i) => i.name.toLowerCase().includes(trimmed))
    : ingredients;

  if (ingredients.length === 0) {
    return <p className="text-sm text-zinc-500">등록된 재료가 없어요.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 검색 입력 */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="재료 이름 검색"
          className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-8 pr-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-500"
        />
      </div>

      {/* 결과 없음 */}
      {filtered.length === 0 && (
        <p className="text-sm text-zinc-400">&apos;{query}&apos; 검색 결과가 없어요.</p>
      )}

      {/* 검색 중: 플랫 목록 */}
      {trimmed && filtered.length > 0 && (
        <ul className="flex flex-col gap-1">
          {filtered.map((ing) => (
            <li
              key={ing.id}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 odd:bg-zinc-50 even:bg-white dark:odd:bg-zinc-900 dark:even:bg-zinc-950"
            >
              <div>
                <span className="text-sm text-zinc-800 dark:text-zinc-200">{ing.name}</span>
                <span className="ml-2 text-xs text-zinc-400">
                  {INGREDIENT_CATEGORY_LABELS[ing.category]}
                </span>
              </div>
              <span className={`text-sm font-medium tabular-nums ${stockColorClass(ing, minRequiredMap)}`}>
                {ing.stock}
                <span className="ml-0.5 text-xs font-normal text-zinc-400">{ing.unit}</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* 기본: 카테고리 그룹 */}
      {!trimmed && (
        <div className="flex flex-col gap-5">
          {INGREDIENT_CATEGORY_ORDER.filter((cat) =>
            filtered.some((i) => i.category === cat)
          ).map((category) => (
            <section key={category}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {INGREDIENT_CATEGORY_LABELS[category as IngredientCategory]}
              </h2>
              <ul className="flex flex-col gap-1">
                {filtered
                  .filter((i) => i.category === category)
                  .map((ing) => (
                    <li
                      key={ing.id}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 odd:bg-zinc-50 even:bg-white dark:odd:bg-zinc-900 dark:even:bg-zinc-950"
                    >
                      <span className="text-sm text-zinc-800 dark:text-zinc-200">{ing.name}</span>
                      <span className={`text-sm font-medium tabular-nums ${stockColorClass(ing, minRequiredMap)}`}>
                        {ing.stock}
                        <span className="ml-0.5 text-xs font-normal text-zinc-400">{ing.unit}</span>
                      </span>
                    </li>
                  ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
