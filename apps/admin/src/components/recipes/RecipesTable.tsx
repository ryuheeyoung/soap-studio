"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { Recipe } from "@soap-studio/types";
import { deleteRecipeAction } from "@/lib/actions/recipes";

// 제조 방식 옵션
const PROCESS_OPTIONS: { value: Recipe["processType"]; label: string }[] = [
  { value: "mp", label: "M&P" },
  { value: "cp", label: "CP" },
  { value: "hp", label: "HP" },
];

interface Props {
  recipes: Recipe[];
}

/**
 * @component
 * @description 레시피 목록 테이블. 이름 검색 + 제조 방식 칩 필터 포함
 * @param {Recipe[]} props.recipes - 전체 레시피 목록
 */
export default function RecipesTable({ recipes }: Props) {
  // 이름 검색어
  const [query, setQuery] = useState("");
  // 선택된 제조 방식 (null = 전체)
  const [processType, setProcessType] = useState<Recipe["processType"] | null>(null);

  const filtered = recipes.filter((recipe) => {
    const matchName = recipe.name.toLowerCase().includes(query.trim().toLowerCase());
    const matchType = processType === null || recipe.processType === processType;
    return matchName && matchType;
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
            placeholder="레시피 이름 검색"
            className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-8 pr-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-500"
          />
        </div>

        {/* 제조 방식 칩 */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none]">
          <button
            onClick={() => setProcessType(null)}
            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition ${
              processType === null
                ? "border-zinc-800 bg-zinc-900 text-white dark:border-zinc-200 dark:bg-zinc-50 dark:text-zinc-900"
                : "border-zinc-200 text-zinc-500 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400"
            }`}
          >
            전체
          </button>
          {PROCESS_OPTIONS.filter((opt) =>
            recipes.some((r) => r.processType === opt.value)
          ).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setProcessType(opt.value)}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition ${
                processType === opt.value
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
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                <th className="px-4 py-3 text-left font-medium text-zinc-500">레시피명</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">제조 방식</th>
                <th className="hidden px-4 py-3 text-left font-medium text-zinc-500 md:table-cell">제품 유형</th>
                <th className="hidden px-4 py-3 text-right font-medium text-zinc-500 md:table-cell">배치 크기</th>
                <th className="hidden px-4 py-3 text-right font-medium text-zinc-500 md:table-cell">재료 수</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((recipe) => (
                <tr key={recipe.id} className="border-b border-zinc-50 last:border-0 dark:border-zinc-800">
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-900 dark:text-zinc-50">{recipe.name}</div>
                    {recipe.catchphrase && (
                      <div className="mt-0.5 text-xs text-zinc-400">{recipe.catchphrase}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      {recipe.processType.toUpperCase()}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-zinc-600 md:table-cell dark:text-zinc-400">{recipe.productType}</td>
                  <td className="hidden px-4 py-3 text-right tabular-nums text-zinc-700 md:table-cell dark:text-zinc-300">
                    {recipe.batchSize.toLocaleString()}g
                  </td>
                  <td className="hidden px-4 py-3 text-right tabular-nums text-zinc-700 md:table-cell dark:text-zinc-300">
                    {recipe.ingredients.length}개
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/recipes/${recipe.id}`}
                        className="rounded-md px-2.5 py-1 text-xs font-medium text-zinc-500 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        수정
                      </Link>
                      <form action={deleteRecipeAction.bind(null, recipe.id)}>
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
