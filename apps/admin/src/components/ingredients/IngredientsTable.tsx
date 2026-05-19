"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { Ingredient } from "@soap-studio/types";
import { INGREDIENT_CATEGORY_LABELS, INGREDIENT_CATEGORY_ORDER } from "@soap-studio/types";
import { deleteIngredientAction } from "@/lib/actions/ingredients";

// 카테고리 칩 옵션 — INGREDIENT_CATEGORY_ORDER 순서대로
const CATEGORY_OPTIONS = INGREDIENT_CATEGORY_ORDER.map((cat) => ({
  value: cat,
  label: INGREDIENT_CATEGORY_LABELS[cat],
}));

interface Props {
  ingredients: Ingredient[];
}

/**
 * @component
 * @description 재료 목록 테이블. 이름 검색 + 카테고리 칩 필터 포함
 * @param {Ingredient[]} props.ingredients - 전체 재료 목록
 */
export default function IngredientsTable({ ingredients }: Props) {
  // 이름 검색어
  const [query, setQuery] = useState("");
  // 선택된 카테고리 (null = 전체)
  const [category, setCategory] = useState<Ingredient["category"] | null>(null);

  const filtered = ingredients.filter((ing) => {
    const matchName = ing.name.toLowerCase().includes(query.trim().toLowerCase());
    const matchCategory = category === null || ing.category === category;
    return matchName && matchCategory;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* 검색 + 필터 */}
      <div className="flex flex-col gap-2">
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

        {/* 카테고리 칩 */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none]">
          <button
            onClick={() => setCategory(null)}
            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition ${
              category === null
                ? "border-zinc-800 bg-zinc-900 text-white dark:border-zinc-200 dark:bg-zinc-50 dark:text-zinc-900"
                : "border-zinc-200 text-zinc-500 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400"
            }`}
          >
            전체
          </button>
          {CATEGORY_OPTIONS.filter((opt) =>
            ingredients.some((i) => i.category === opt.value)
          ).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setCategory(opt.value as Ingredient["category"])}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition ${
                category === opt.value
                  ? "border-zinc-800 bg-zinc-900 text-white dark:border-zinc-200 dark:bg-zinc-50 dark:text-zinc-900"
                  : "border-zinc-200 text-zinc-500 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 테이블 */}
      {filtered.length === 0 ? (
        <p className="py-4 text-center text-sm text-zinc-400">검색 결과가 없어요.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                <th className="px-4 py-3 text-left font-medium text-zinc-500">재료명</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">카테고리</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-500">재고</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">메모</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((ingredient) => (
                <tr key={ingredient.id} className="border-b border-zinc-50 last:border-0 dark:border-zinc-800">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                    {ingredient.name}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {INGREDIENT_CATEGORY_LABELS[ingredient.category]}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                    {ingredient.stock.toLocaleString()} {ingredient.unit}
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-zinc-400">
                    {ingredient.memo ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/ingredients/${ingredient.id}`}
                        className="rounded-md px-2.5 py-1 text-xs font-medium text-zinc-500 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        수정
                      </Link>
                      <form action={deleteIngredientAction.bind(null, ingredient.id)}>
                        <button type="submit" className="rounded-md px-2.5 py-1 text-xs font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950">
                          삭제
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
