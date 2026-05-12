"use client";

import { useSessionStore } from "@/stores/session";
import { Plus, Check } from "lucide-react";

interface Props {
  recipeId: string;
  recipeName: string;
  batchSize: number;
}

/**
 * @component
 * @description 레시피를 계산기 세션에 추가/제거하는 토글 버튼
 * @param {string} props.recipeId - 레시피 ID
 * @param {string} props.recipeName - 레시피 이름
 * @param {number} props.batchSize - 기본 배치 크기 (g)
 */
export default function AddToSessionButton({ recipeId, recipeName, batchSize }: Props) {
  const { hasRecipe, addRecipe, removeRecipe } = useSessionStore();
  const added = hasRecipe(recipeId);

  function toggle() {
    if (added) {
      removeRecipe(recipeId);
    } else {
      addRecipe({ recipeId, recipeName, batchSize });
    }
  }

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
        added
          ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
          : "border border-zinc-200 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400"
      }`}
    >
      {added ? <Check size={14} /> : <Plus size={14} />}
      {added ? "추가됨" : "계산기에 추가"}
    </button>
  );
}
