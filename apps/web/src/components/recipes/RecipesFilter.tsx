"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import type { Recipe } from "@soap-studio/types";
import { DIFFICULTY_LABELS } from "@soap-studio/types";
import { Badge, Card } from "@soap-studio/ui";
import AddToSessionButton from "@/components/recipes/AddToSessionButton";

// 제조 방식 배지 레이블
const PROCESS_LABEL: Record<Recipe["processType"], string> = {
  mp: "M&P",
  cp: "CP",
  hp: "HP",
};

interface Props {
  recipes: Recipe[];
}

/**
 * @component
 * @description 레시피 목록 클라이언트 필터. 이름 검색 → 카드 목록으로 표시
 * @param {Recipe[]} props.recipes - 전체 레시피 목록
 */
export default function RecipesFilter({ recipes }: Props) {
  // 이름 검색어
  const [query, setQuery] = useState("");

  const trimmed = query.trim().toLowerCase();
  const filtered = trimmed
    ? recipes.filter((r) => r.name.toLowerCase().includes(trimmed))
    : recipes;

  if (recipes.length === 0) {
    return <p className="text-sm text-zinc-500">등록된 레시피가 없어요.</p>;
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
          placeholder="레시피 이름 검색"
          className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-8 pr-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-500"
        />
      </div>

      {/* 결과 없음 */}
      {filtered.length === 0 && (
        <p className="text-sm text-zinc-400">&apos;{query}&apos; 검색 결과가 없어요.</p>
      )}

      {/* 카드 목록 */}
      {filtered.length > 0 && (
        <ul className="flex flex-col gap-3">
          {filtered.map((recipe) => (
            <li key={recipe.id}>
              <Card className="p-4">
                <div className="mb-1 flex items-center gap-2">
                  <Badge variant={recipe.processType}>
                    {PROCESS_LABEL[recipe.processType]}
                  </Badge>
                  <span className="text-xs text-zinc-500">{recipe.productType}</span>
                </div>
                <p className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  {recipe.name}
                </p>
                {recipe.catchphrase && (
                  <p className="mt-0.5 text-sm text-zinc-500 line-clamp-1">
                    {recipe.catchphrase}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
                    <span>{recipe.batchSize}g</span>
                    <span>·</span>
                    <span>재료 {recipe.ingredients.length}가지</span>
                    {recipe.difficulty && (
                      <>
                        <span>·</span>
                        <span>{DIFFICULTY_LABELS[recipe.difficulty]}</span>
                      </>
                    )}
                  </div>
                  <AddToSessionButton
                    recipeId={recipe.id}
                    recipeName={recipe.name}
                    batchSize={recipe.batchSize}
                  />
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
