import { eq, asc, inArray } from "drizzle-orm";
import { db } from "../index";
import { ingredients, ingredientPurchaseOptions } from "../schema";
import type { Ingredient, PurchaseOption } from "@soap-studio/types";

// DB row → PurchaseOption 변환
function toPurchaseOption(row: typeof ingredientPurchaseOptions.$inferSelect): PurchaseOption {
  return {
    id: row.id,
    label: row.label,
    size: row.size,
    sortOrder: row.sortOrder,
  };
}

// DB row + 구매옵션 → Ingredient 변환
function toIngredient(
  row: typeof ingredients.$inferSelect,
  options: (typeof ingredientPurchaseOptions.$inferSelect)[]
): Ingredient {
  return {
    id: row.id,
    name: row.name,
    category: row.category as Ingredient["category"],
    unit: row.unit as Ingredient["unit"],
    stock: row.stock,
    purchaseOptions: options
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(toPurchaseOption),
    memo: row.memo ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * @function
 * @description 전체 재료 목록 조회 (이름 오름차순, 구매옵션 포함)
 * @returns {Promise<Ingredient[]>} 재료 배열
 */
export async function getAllIngredients(): Promise<Ingredient[]> {
  const rows = await db
    .select()
    .from(ingredients)
    .orderBy(asc(ingredients.createdAt), asc(ingredients.id));
  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.id);
  const optionRows = await db
    .select()
    .from(ingredientPurchaseOptions)
    .where(inArray(ingredientPurchaseOptions.ingredientId, ids))
    .orderBy(asc(ingredientPurchaseOptions.sortOrder));

  return rows.map((row) =>
    toIngredient(
      row,
      optionRows.filter((o) => o.ingredientId === row.id)
    )
  );
}

/**
 * @function
 * @description 단일 재료 조회 (구매옵션 포함)
 * @param {string} id - 재료 ID
 * @returns {Promise<Ingredient | null>} 재료 또는 null
 */
export async function getIngredientById(id: string): Promise<Ingredient | null> {
  const [rows, optionRows] = await Promise.all([
    db.select().from(ingredients).where(eq(ingredients.id, id)),
    db
      .select()
      .from(ingredientPurchaseOptions)
      .where(eq(ingredientPurchaseOptions.ingredientId, id))
      .orderBy(asc(ingredientPurchaseOptions.sortOrder)),
  ]);
  return rows[0] ? toIngredient(rows[0], optionRows) : null;
}

/**
 * @description 재료 생성 시 구매옵션 입력 타입
 */
export interface PurchaseOptionInput {
  label: string;
  size: number;
}

/**
 * @function
 * @description 재료 생성 (구매옵션 포함, 트랜잭션)
 * @param {Omit<Ingredient, "id" | "createdAt" | "updatedAt" | "purchaseOptions"> & { purchaseOptions?: PurchaseOptionInput[] }} data - 생성할 재료 데이터
 * @returns {Promise<Ingredient>} 생성된 재료
 */
export async function createIngredient(
  data: Omit<Ingredient, "id" | "createdAt" | "updatedAt" | "purchaseOptions"> & {
    purchaseOptions?: PurchaseOptionInput[];
  }
): Promise<Ingredient> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.transaction(async (tx) => {
    await tx.insert(ingredients).values({
      id,
      name: data.name,
      category: data.category,
      unit: data.unit,
      stock: data.stock,
      memo: data.memo ?? null,
      createdAt: now,
      updatedAt: now,
    });

    if (data.purchaseOptions && data.purchaseOptions.length > 0) {
      await tx.insert(ingredientPurchaseOptions).values(
        data.purchaseOptions.map((opt, idx) => ({
          id: crypto.randomUUID(),
          ingredientId: id,
          label: opt.label,
          size: opt.size,
          sortOrder: idx,
        }))
      );
    }
  });

  return (await getIngredientById(id))!;
}

/**
 * @function
 * @description 재료 수정 (구매옵션 전체 교체, 트랜잭션)
 * @param {string} id - 수정할 재료 ID
 * @param {Partial<Omit<Ingredient, "id" | "createdAt" | "updatedAt" | "purchaseOptions">> & { purchaseOptions?: PurchaseOptionInput[] }} data - 수정할 필드
 * @returns {Promise<Ingredient | null>} 수정된 재료 또는 null
 */
export async function updateIngredient(
  id: string,
  data: Partial<Omit<Ingredient, "id" | "createdAt" | "updatedAt" | "purchaseOptions">> & {
    purchaseOptions?: PurchaseOptionInput[];
  }
): Promise<Ingredient | null> {
  const existing = await getIngredientById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updated = { ...existing, ...data };

  await db.transaction(async (tx) => {
    await tx
      .update(ingredients)
      .set({
        name: updated.name,
        category: updated.category,
        unit: updated.unit,
        stock: updated.stock,
        memo: updated.memo ?? null,
        updatedAt: now,
      })
      .where(eq(ingredients.id, id));

    // 구매옵션 전체 교체
    if (data.purchaseOptions !== undefined) {
      await tx
        .delete(ingredientPurchaseOptions)
        .where(eq(ingredientPurchaseOptions.ingredientId, id));

      if (data.purchaseOptions.length > 0) {
        await tx.insert(ingredientPurchaseOptions).values(
          data.purchaseOptions.map((opt, idx) => ({
            id: crypto.randomUUID(),
            ingredientId: id,
            label: opt.label,
            size: opt.size,
            sortOrder: idx,
          }))
        );
      }
    }
  });

  return getIngredientById(id);
}

/**
 * @function
 * @description 여러 재료의 재고를 일괄 증가 (트랜잭션)
 * @param {{ id: string; add: number }[]} adjustments - 재료 ID와 추가할 재고량 목록
 */
export async function batchAdjustStock(
  adjustments: { id: string; add: number }[]
): Promise<void> {
  if (adjustments.length === 0) return;

  await db.transaction(async (tx) => {
    for (const { id, add } of adjustments) {
      const [row] = await tx
        .select({ stock: ingredients.stock })
        .from(ingredients)
        .where(eq(ingredients.id, id));
      if (!row) continue;

      await tx
        .update(ingredients)
        .set({ stock: row.stock + add, updatedAt: new Date().toISOString() })
        .where(eq(ingredients.id, id));
    }
  });
}

/**
 * @function
 * @description 여러 재료의 재고를 일괄 차감 (트랜잭션, 0 미만 시 0으로 고정)
 * @param {{ id: string; deduct: number }[]} adjustments - 재료 ID와 차감할 재고량 목록
 */
export async function batchDeductStock(
  adjustments: { id: string; deduct: number }[]
): Promise<void> {
  if (adjustments.length === 0) return;

  await db.transaction(async (tx) => {
    for (const { id, deduct } of adjustments) {
      const [row] = await tx
        .select({ stock: ingredients.stock })
        .from(ingredients)
        .where(eq(ingredients.id, id));
      if (!row) continue;

      await tx
        .update(ingredients)
        .set({ stock: Math.max(0, row.stock - deduct), updatedAt: new Date().toISOString() })
        .where(eq(ingredients.id, id));
    }
  });
}

/**
 * @function
 * @description 재료 삭제 (구매옵션 연쇄 삭제)
 * @param {string} id - 삭제할 재료 ID
 * @returns {Promise<boolean>} 삭제 성공 여부
 */
export async function deleteIngredient(id: string): Promise<boolean> {
  await db.transaction(async (tx) => {
    await tx
      .delete(ingredientPurchaseOptions)
      .where(eq(ingredientPurchaseOptions.ingredientId, id));
    await tx.delete(ingredients).where(eq(ingredients.id, id));
  });

  const check = await db
    .select({ id: ingredients.id })
    .from(ingredients)
    .where(eq(ingredients.id, id));
  return check.length === 0;
}
