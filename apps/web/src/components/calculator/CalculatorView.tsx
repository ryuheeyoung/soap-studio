"use client";

import SessionPanel from "./SessionPanel";
import ResultPanel from "./ResultPanel";
import type { Recipe, Ingredient, Mold } from "@soap-studio/types";

interface Props {
  recipes: Recipe[];
  ingredients: Ingredient[];
  molds: Mold[];
}

/**
 * @component
 * @description 계산기 클라이언트 뷰. 세션 패널(레시피별 소요량 포함) → 총 부족 재료 순으로 구성
 * @param {Recipe[]} props.recipes - 서버에서 조회한 전체 레시피
 * @param {Ingredient[]} props.ingredients - 서버에서 조회한 전체 재료 (재고 포함)
 * @param {Mold[]} props.molds - 서버에서 조회한 전체 몰드
 */
export default function CalculatorView({ recipes, ingredients, molds }: Props) {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">계산기</h1>
      <SessionPanel recipes={recipes} ingredients={ingredients} molds={molds} />
      <ResultPanel recipes={recipes} ingredients={ingredients} />
    </div>
  );
}
