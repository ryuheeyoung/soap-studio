import { eq, asc } from "drizzle-orm";
import { db } from "../index";
import { molds } from "../schema";
import type { Mold } from "@soap-studio/types";

// DB row → Mold 타입 변환 (shape union 타입 단언)
function toMold(row: typeof molds.$inferSelect): Mold {
  return {
    id: row.id,
    name: row.name,
    shape: row.shape as Mold["shape"],
    weightPerCell: row.weightPerCell,
    cellCount: row.cellCount,
    totalCapacity: row.totalCapacity,
    memo: row.memo ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * @function
 * @description 전체 몰드 목록 조회 (이름 오름차순)
 * @returns {Promise<Mold[]>} 몰드 배열
 */
export async function getAllMolds(): Promise<Mold[]> {
  const rows = await db.select().from(molds).orderBy(asc(molds.name));
  return rows.map(toMold);
}

/**
 * @function
 * @description 단일 몰드 조회
 * @param {string} id - 몰드 ID
 * @returns {Promise<Mold | null>} 몰드 또는 null
 */
export async function getMoldById(id: string): Promise<Mold | null> {
  const rows = await db.select().from(molds).where(eq(molds.id, id));
  return rows[0] ? toMold(rows[0]) : null;
}

/**
 * @function
 * @description 몰드 생성. totalCapacity는 weightPerCell × cellCount 자동 계산
 * @param {Omit<Mold, "id" | "totalCapacity" | "createdAt" | "updatedAt">} data - 생성할 몰드 데이터
 * @returns {Promise<Mold>} 생성된 몰드
 */
export async function createMold(
  data: Omit<Mold, "id" | "totalCapacity" | "createdAt" | "updatedAt">
): Promise<Mold> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const totalCapacity = data.weightPerCell * data.cellCount;

  await db.insert(molds).values({
    id,
    name: data.name,
    shape: data.shape,
    weightPerCell: data.weightPerCell,
    cellCount: data.cellCount,
    totalCapacity,
    memo: data.memo ?? null,
    createdAt: now,
    updatedAt: now,
  });

  return (await getMoldById(id))!;
}

/**
 * @function
 * @description 몰드 수정. totalCapacity 자동 재계산
 * @param {string} id - 수정할 몰드 ID
 * @param {Partial<Omit<Mold, "id" | "totalCapacity" | "createdAt" | "updatedAt">>} data - 수정할 필드
 * @returns {Promise<Mold | null>} 수정된 몰드 또는 null
 */
export async function updateMold(
  id: string,
  data: Partial<Omit<Mold, "id" | "totalCapacity" | "createdAt" | "updatedAt">>
): Promise<Mold | null> {
  const existing = await getMoldById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updated = { ...existing, ...data };
  const totalCapacity = updated.weightPerCell * updated.cellCount;

  await db
    .update(molds)
    .set({
      name: updated.name,
      shape: updated.shape,
      weightPerCell: updated.weightPerCell,
      cellCount: updated.cellCount,
      totalCapacity,
      memo: updated.memo ?? null,
      updatedAt: now,
    })
    .where(eq(molds.id, id));

  return getMoldById(id);
}

/**
 * @function
 * @description 몰드 삭제
 * @param {string} id - 삭제할 몰드 ID
 * @returns {Promise<boolean>} 삭제 성공 여부
 */
export async function deleteMold(id: string): Promise<boolean> {
  const result = await db
    .delete(molds)
    .where(eq(molds.id, id))
    .returning({ id: molds.id });
  return result.length > 0;
}
