"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// 세션에 담긴 레시피 항목
export interface SessionItem {
  recipeId: string;
  recipeName: string;
  batchSize: number;
  scale: number;
  // ingredientId → 사용자 지정 사용량 (범위 재료 조정 시)
  amountOverrides: Record<string, number>;
  // originalIngredientId → substituteIngredientId (대체재료 선택 시)
  selectedSubstitutes: Record<string, string>;
}

interface SessionStore {
  // 선택된 레시피 목록
  items: SessionItem[];
  addRecipe: (item: Omit<SessionItem, "scale" | "amountOverrides" | "selectedSubstitutes">) => void;
  removeRecipe: (recipeId: string) => void;
  setScale: (recipeId: string, scale: number) => void;
  // amount가 null이면 오버라이드 제거 (레시피 기본값으로 복원)
  setAmountOverride: (recipeId: string, ingredientId: string, amount: number | null) => void;
  setSubstitute: (recipeId: string, originalIngredientId: string, substituteIngredientId: string | null) => void;
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
          items: [...state.items, { ...item, scale: 1, amountOverrides: {}, selectedSubstitutes: {} }],
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

      /**
       * @description 범위 재료의 사용량 오버라이드 설정
       */
      setAmountOverride: (recipeId, ingredientId, amount) => {
        set((state) => ({
          items: state.items.map((i) => {
            if (i.recipeId !== recipeId) return i;
            const next = { ...i.amountOverrides };
            if (amount === null) {
              delete next[ingredientId];
            } else {
              next[ingredientId] = amount;
            }
            return { ...i, amountOverrides: next };
          }),
        }));
      },

      /**
       * @description 대체재료 선택 토글. substituteIngredientId가 null이면 원래 재료로 복원
       */
      setSubstitute: (recipeId, originalIngredientId, substituteIngredientId) => {
        set((state) => ({
          items: state.items.map((i) => {
            if (i.recipeId !== recipeId) return i;
            const next = { ...i.selectedSubstitutes };
            if (substituteIngredientId === null) {
              delete next[originalIngredientId];
            } else {
              next[originalIngredientId] = substituteIngredientId;
            }
            return { ...i, selectedSubstitutes: next };
          }),
        }));
      },

      clearSession: () => set({ items: [] }),

      hasRecipe: (recipeId) => get().items.some((i) => i.recipeId === recipeId),
    }),
    {
      name: "soap-studio-session",
      // 이전 버전 localStorage 데이터에 새 필드 누락 시 기본값으로 보정
      merge: (persisted, current) => {
        const state = persisted as Partial<SessionStore>;
        return {
          ...current,
          ...state,
          items: (state.items ?? []).map((item) => ({
            ...item,
            amountOverrides: item.amountOverrides ?? {},
            selectedSubstitutes: item.selectedSubstitutes ?? {},
          })),
        };
      },
    }
  )
);
