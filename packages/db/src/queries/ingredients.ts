import { eq, asc } from "drizzle-orm";
import { db } from "../index";
import { ingredients } from "../schema";
import type { Ingredient } from "@soap-studio/types";

// DB row → Ingredient 타입 변환 (카테고리/단위 union 타입 단언)
function toIngredient(row: typeof ingredients.$inferSelect): Ingredient {
  return {
    id: row.id,
    name: row.name,
    category: row.category as Ingredient["category"],
    unit: row.unit as Ingredient["unit"],
    stock: row.stock,
    memo: row.memo ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * @function
 * @description 전체 재료 목록 조회 (이름 오름차순)
 * @returns {Promise<Ingredient[]>} 재료 배열
 */
export async function getAllIngredients(): Promise<Ingredient[]> {
  const rows = await db.select().from(ingredients).orderBy(asc(ingredients.name));
  return rows.map(toIngredient);
}

/**
 * @function
 * @description 단일 재료 조회
 * @param {string} id - 재료 ID
 * @returns {Promise<Ingredient | null>} 재료 또는 null
 */
export async function getIngredientById(id: string): Promise<Ingredient | null> {
  const rows = await db.select().from(ingredients).where(eq(ingredients.id, id));
  return rows[0] ? toIngredient(rows[0]) : null;
}

/**
 * @function
 * @description 재료 생성
 * @param {Omit<Ingredient, "id" | "createdAt" | "updatedAt">} data - 생성할 재료 데이터
 * @returns {Promise<Ingredient>} 생성된 재료
 */
export async function createIngredient(
  data: Omit<Ingredient, "id" | "createdAt" | "updatedAt">
): Promise<Ingredient> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.insert(ingredients).values({
    id,
    name: data.name,
    category: data.category,
    unit: data.unit,
    stock: data.stock,
    memo: data.memo ?? null,
    createdAt: now,
    updatedAt: now,
  });

  return (await getIngredientById(id))!;
}

/**
 * @function
 * @description 재료 수정
 * @param {string} id - 수정할 재료 ID
 * @param {Partial<Omit<Ingredient, "id" | "createdAt" | "updatedAt">>} data - 수정할 필드
 * @returns {Promise<Ingredient | null>} 수정된 재료 또는 null
 */
export async function updateIngredient(
  id: string,
  data: Partial<Omit<Ingredient, "id" | "createdAt" | "updatedAt">>
): Promise<Ingredient | null> {
  const existing = await getIngredientById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updated = { ...existing, ...data };

  await db
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

  return getIngredientById(id);
}

/**
 * @function
 * @description 재료 삭제
 * @param {string} id - 삭제할 재료 ID
 * @returns {Promise<boolean>} 삭제 성공 여부
 */
export async function deleteIngredient(id: string): Promise<boolean> {
  const result = await db
    .delete(ingredients)
    .where(eq(ingredients.id, id))
    .returning({ id: ingredients.id });
  return result.length > 0;
}
