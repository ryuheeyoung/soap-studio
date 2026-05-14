"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createIngredient,
  updateIngredient,
  deleteIngredient,
  batchAdjustStock,
  batchDeductStock,
} from "@soap-studio/db/queries/ingredients";
import type { Ingredient } from "@soap-studio/types";
import type { PurchaseOptionInput } from "@soap-studio/db/queries/ingredients";

// FormData의 purchaseOptions JSON 문자열을 파싱해 입력 배열로 변환
function parsePurchaseOptions(formData: FormData): PurchaseOptionInput[] {
  const raw = formData.get("purchaseOptions") as string;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as { label: string; size: string }[];
    return parsed
      .filter((o) => o.label.trim() && parseFloat(o.size) > 0)
      .map((o) => ({ label: o.label.trim(), size: parseFloat(o.size) }));
  } catch {
    return [];
  }
}

/**
 * @function
 * @description 재료 생성 Server Action — 폼 데이터로 재료 생성 후 목록으로 리다이렉트
 * @param {FormData} formData - name, category, unit, stock, memo, purchaseOptions 필드
 */
export async function createIngredientAction(formData: FormData) {
  const data = {
    name: formData.get("name") as string,
    category: formData.get("category") as Ingredient["category"],
    unit: formData.get("unit") as Ingredient["unit"],
    stock: parseFloat(formData.get("stock") as string) || 0,
    memo: (formData.get("memo") as string) || undefined,
    purchaseOptions: parsePurchaseOptions(formData),
  };

  await createIngredient(data);
  revalidatePath("/ingredients");
  redirect("/ingredients");
}

/**
 * @function
 * @description 재료 수정 Server Action — 폼 데이터로 기존 재료 수정 후 목록으로 리다이렉트
 * @param {string} id - 수정할 재료 ID
 * @param {FormData} formData - name, category, unit, stock, memo, purchaseOptions 필드
 */
export async function updateIngredientAction(id: string, formData: FormData) {
  const data = {
    name: formData.get("name") as string,
    category: formData.get("category") as Ingredient["category"],
    unit: formData.get("unit") as Ingredient["unit"],
    stock: parseFloat(formData.get("stock") as string) || 0,
    memo: (formData.get("memo") as string) || undefined,
    purchaseOptions: parsePurchaseOptions(formData),
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

/**
 * @function
 * @description 재고 일괄 추가 Server Action — 구매목록 JSON 기반으로 여러 재료 재고를 한 번에 증가
 * @param {{ ingredientId: string; add: number }[]} items - 재료 ID와 추가량 목록
 */
export async function batchAdjustStockAction(
  items: { ingredientId: string; add: number }[]
) {
  await batchAdjustStock(items.map(({ ingredientId, add }) => ({ id: ingredientId, add })));
  revalidatePath("/ingredients");
}

/**
 * @function
 * @description 재고 일괄 차감 Server Action — 소요량 JSON 기반으로 여러 재료 재고를 한 번에 차감
 * @param {{ ingredientId: string; deduct: number }[]} items - 재료 ID와 차감량 목록
 */
export async function batchDeductStockAction(
  items: { ingredientId: string; deduct: number }[]
) {
  await batchDeductStock(items.map(({ ingredientId, deduct }) => ({ id: ingredientId, deduct })));
  revalidatePath("/ingredients");
}
