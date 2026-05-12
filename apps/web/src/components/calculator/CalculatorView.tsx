"use client";

import SessionPanel from "./SessionPanel";
import ResultPanel from "./ResultPanel";
import MoldPanel from "./MoldPanel";
import type { Recipe, Ingredient, Mold } from "@soap-studio/types";

interface Props {
  recipes: Recipe[];
  ingredients: Ingredient[];
  molds: Mold[];
}

/**
 * @component
 * @description 계산기 클라이언트 뷰. 세션 패널, 결과 패널, 몰드 패널을 조합
 * @param {Recipe[]} props.recipes - 서버에서 조회한 전체 레시피
 * @param {Ingredient[]} props.ingredients - 서버에서 조회한 전체 재료 (재고 포함)
 * @param {Mold[]} props.molds - 서버에서 조회한 전체 몰드
 */
export default function CalculatorView({ recipes, ingredients, molds }: Props) {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">계산기</h1>
      <SessionPanel />
      <ResultPanel recipes={recipes} ingredients={ingredients} />
      <MoldPanel molds={molds} />
    </div>
  );
}
