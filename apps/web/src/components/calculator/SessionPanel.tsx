"use client";

import { Trash2, X } from "lucide-react";
import { useSessionStore } from "@/stores/session";

/**
 * @component
 * @description 현재 세션에 담긴 레시피 목록 패널. 배율 조정 및 삭제 기능 제공
 */
export default function SessionPanel() {
  const { items, setScale, removeRecipe, clearSession } = useSessionStore();

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
        <button
          onClick={clearSession}
          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
        >
          <Trash2 size={12} />
          전체 삭제
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li
            key={item.recipeId}
            className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
          >
            {/* 레시피명 */}
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {item.recipeName}
            </span>

            {/* 배율 조정 */}
            <div className="flex items-center gap-1.5 text-sm">
              <button
                onClick={() => setScale(item.recipeId, Math.max(0.5, Math.round((item.scale - 0.5) * 10) / 10))}
                className="flex h-6 w-6 items-center justify-center rounded border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                −
              </button>
              <span className="w-10 text-center tabular-nums text-zinc-800 dark:text-zinc-200">
                ×{item.scale}
              </span>
              <button
                onClick={() => setScale(item.recipeId, Math.round((item.scale + 0.5) * 10) / 10)}
                className="flex h-6 w-6 items-center justify-center rounded border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                +
              </button>
            </div>

            {/* 배치 용량 */}
            <span className="w-16 text-right text-xs tabular-nums text-zinc-400">
              {Math.round(item.batchSize * item.scale)}g
            </span>

            {/* 삭제 */}
            <button
              onClick={() => removeRecipe(item.recipeId)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X size={14} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
