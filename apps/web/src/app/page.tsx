"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { INGREDIENT_CATEGORY_LABELS } from "@soap-studio/types";

/**
 * @component
 * @description 홈 대시보드. 재고 소진 재료 요약 + 최근 등록 레시피를 한 화면에 표시
 */
export default function HomePage() {
  const { data: ingredients = [] } = trpc.ingredients.getAll.useQuery();
  const { data: recipes = [] } = trpc.recipes.getAll.useQuery();

  // 재고 소진 재료
  const outOfStock = ingredients.filter((i) => i.stock === 0);

  // 최근 등록 레시피 5개
  const recentRecipes = [...recipes]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-hidden p-4">
      <h1 className="shrink-0 text-xl font-semibold text-zinc-900 dark:text-zinc-50">홈</h1>

      <div className="grid min-h-0 flex-1 grid-rows-2 gap-3">
        {/* 재고 소진 재료 */}
        <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-3 flex shrink-0 items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">재고 소진</h2>
            <Link href="/ingredients" className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
              전체 보기
            </Link>
          </div>

          {outOfStock.length === 0 ? (
            <p className="flex flex-1 items-center justify-center text-sm text-zinc-400">
              소진된 재료가 없어요 🎉
            </p>
          ) : (
            <ul className="flex flex-col gap-1.5 overflow-hidden">
              {outOfStock.map((ing) => (
                <li key={ing.id} className="flex min-w-0 items-center justify-between gap-2">
                  <span className="truncate text-sm text-zinc-800 dark:text-zinc-200">{ing.name}</span>
                  <span className="shrink-0 text-xs text-zinc-400">
                    {INGREDIENT_CATEGORY_LABELS[ing.category]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 최근 등록 레시피 */}
        <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-3 flex shrink-0 items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">최근 레시피</h2>
            <Link href="/recipes" className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
              전체 보기
            </Link>
          </div>

          {recentRecipes.length === 0 ? (
            <p className="flex flex-1 items-center justify-center text-sm text-zinc-400">
              등록된 레시피가 없어요.
            </p>
          ) : (
            <ul className="flex flex-col gap-1.5 overflow-hidden">
              {recentRecipes.map((recipe) => (
                <li key={recipe.id} className="flex min-w-0 items-center justify-between gap-2">
                  <span className="truncate text-sm text-zinc-800 dark:text-zinc-200">{recipe.name}</span>
                  <span className="shrink-0 rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    {recipe.processType.toUpperCase()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
