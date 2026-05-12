"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createIngredient,
  updateIngredient,
  deleteIngredient,
} from "@soap-studio/db/queries/ingredients";
import type { Ingredient } from "@soap-studio/types";

/**
 * @function
 * @description 재료 생성 Server Action — 폼 데이터로 재료 생성 후 목록으로 리다이렉트
 * @param {FormData} formData - name, category, unit, stock, memo 필드
 */
export async function createIngredientAction(formData: FormData) {
  const data = {
    name: formData.get("name") as string,
    category: formData.get("category") as Ingredient["category"],
    unit: formData.get("unit") as Ingredient["unit"],
    stock: parseFloat(formData.get("stock") as string) || 0,
    memo: (formData.get("memo") as string) || undefined,
  };

  await createIngredient(data);
  revalidatePath("/ingredients");
  redirect("/ingredients");
}

/**
 * @function
 * @description 재료 수정 Server Action — 폼 데이터로 기존 재료 수정 후 목록으로 리다이렉트
 * @param {string} id - 수정할 재료 ID
 * @param {FormData} formData - name, category, unit, stock, memo 필드
 */
export async function updateIngredientAction(id: string, formData: FormData) {
  const data = {
    name: formData.get("name") as string,
    category: formData.get("category") as Ingredient["category"],
    unit: formData.get("unit") as Ingredient["unit"],
    stock: parseFloat(formData.get("stock") as string) || 0,
    memo: (formData.get("memo") as string) || undefined,
  };

  await updateIngredient(id, data);
  revalidatePath("/ingredients");
  redirect("/ingredients");
}

/**
 * @function
 * @description 재료 삭제 Server Action — 재료 삭제 후 목록 캐시 갱신
 * @param {string} id - 삭제할 재료 ID
 */
export async function deleteIngredientAction(id: string) {
  await deleteIngredient(id);
  revalidatePath("/ingredients");
}
