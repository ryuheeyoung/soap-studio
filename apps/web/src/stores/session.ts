"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// 세션에 담긴 레시피 항목
export interface SessionItem {
  recipeId: string;
  recipeName: string;
  batchSize: number;
  scale: number;
}

interface SessionStore {
  // 선택된 레시피 목록
  items: SessionItem[];
  addRecipe: (item: Omit<SessionItem, "scale">) => void;
  removeRecipe: (recipeId: string) => void;
  setScale: (recipeId: string, scale: number) => void;
  clearSession: () => void;
  hasRecipe: (recipeId: string) => boolean;
}

/**
 * @hook
 * @description 제작 세션 전역 상태. localStorage에 유지되어 새로고침 후에도 복원
 * @returns {SessionStore} 세션 항목 목록 및 조작 함수
 */
export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      items: [],

      addRecipe: (item) => {
        if (get().hasRecipe(item.recipeId)) return;
        set((state) => ({
          items: [...state.items, { ...item, scale: 1 }],
        }));
      },

      removeRecipe: (recipeId) => {
        set((state) => ({
          items: state.items.filter((i) => i.recipeId !== recipeId),
        }));
      },

      setScale: (recipeId, scale) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.recipeId === recipeId ? { ...i, scale } : i
          ),
        }));
      },

      clearSession: () => set({ items: [] }),

      hasRecipe: (recipeId) => get().items.some((i) => i.recipeId === recipeId),
    }),
    { name: "soap-studio-session" }
  )
);
