'use client';

import CalculatorView from '@/components/calculator/CalculatorView';
import { trpc } from '@/lib/trpc/client';

/**
 * @component
 * @description 제작 계산기 페이지. 레시피·재료·몰드 데이터를 tRPC로 조회 후 클라이언트 뷰에 전달
 */
export default function CalculatorPage() {
  const { data: recipes = [] } = trpc.recipes.getAll.useQuery();
  const { data: ingredients = [] } = trpc.ingredients.getAll.useQuery();
  const { data: molds = [] } = trpc.molds.getAll.useQuery();

  return (
    <CalculatorView recipes={recipes} ingredients={ingredients} molds={molds} />
  );
}
