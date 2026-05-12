import { eq, asc, inArray } from "drizzle-orm";
import { db } from "../index";
import {
  recipes,
  recipeIngredients,
  recipeSubstitutes,
  recipeVariations,
  recipeVariationIngredients,
} from "../schema";
import type {
  Recipe,
  RecipeIngredient,
  RecipeSubstitute,
  RecipeVariation,
  ProcessType,
  Difficulty,
} from "@soap-studio/types";

// ─── 변환 헬퍼 ────────────────────────────────────────────────────────────────

function toRecipeIngredient(row: typeof recipeIngredients.$inferSelect): RecipeIngredient {
  return {
    ingredientId: row.ingredientId,
    fixedAmount: row.fixedAmount ?? undefined,
    amountMin: row.amountMin ?? undefined,
    amountMax: row.amountMax ?? undefined,
    ratio: row.ratio ?? undefined,
    amountNote: row.amountNote ?? undefined,
    isOptional: row.isOptional,
    memo: row.memo ?? undefined,
  };
}

function toRecipeIngredientFromVariation(
  row: typeof recipeVariationIngredients.$inferSelect
): RecipeIngredient {
  return {
    ingredientId: row.ingredientId,
    fixedAmount: row.fixedAmount ?? undefined,
    amountMin: row.amountMin ?? undefined,
    amountMax: row.amountMax ?? undefined,
    amountNote: row.amountNote ?? undefined,
    isOptional: row.isOptional,
    memo: row.memo ?? undefined,
  };
}

function toRecipeSubstitute(row: typeof recipeSubstitutes.$inferSelect): RecipeSubstitute {
  return {
    originalIngredientId: row.originalIngredientId,
    substituteIngredientId: row.substituteIngredientId,
    substituteRatio: row.substituteRatio ?? undefined,
    memo: row.memo ?? undefined,
  };
}

function toRecipe(
  row: typeof recipes.$inferSelect,
  ingredientRows: (typeof recipeIngredients.$inferSelect)[],
  substituteRows: (typeof recipeSubstitutes.$inferSelect)[],
  variationRows: (typeof recipeVariations.$inferSelect)[],
  varIngredientRows: (typeof recipeVariationIngredients.$inferSelect)[]
): Recipe {
  const mappedIngredients = ingredientRows.map(toRecipeIngredient);
  const mappedSubstitutes = substituteRows.map(toRecipeSubstitute);
  const mappedVariations: RecipeVariation[] = variationRows.map((v) => ({
    label: v.label,
    description: v.description ?? undefined,
    ingredients: varIngredientRows
      .filter((vi) => vi.variationId === v.id)
      .map(toRecipeIngredientFromVariation),
  }));

  return {
    id: row.id,
    name: row.name,
    catchphrase: row.catchphrase ?? undefined,
    processType: row.processType as ProcessType,
    productType: row.productType,
    moldId: row.moldId ?? undefined,
    batchSize: row.batchSize,
    difficulty: (row.difficulty ?? undefined) as Difficulty | undefined,
    timeRequired: row.timeRequired ?? undefined,
    skinType: row.skinType ? (JSON.parse(row.skinType) as string[]) : undefined,
    needsHeating: row.needsHeating,
    storageLocation: row.storageLocation ?? undefined,
    tools: row.tools ? (JSON.parse(row.tools) as string[]) : undefined,
    ingredients: mappedIngredients,
    substitutes: mappedSubstitutes,
    variations: mappedVariations.length > 0 ? mappedVariations : undefined,
    memo: row.memo ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// ─── 조회 ─────────────────────────────────────────────────────────────────────

/**
 * @function
 * @description 전체 레시피 목록 조회 (이름 오름차순, 관련 데이터 병렬 조회)
 * @returns {Promise<Recipe[]>} 레시피 배열
 */
export async function getAllRecipes(): Promise<Recipe[]> {
  const recipeRows = await db.select().from(recipes).orderBy(asc(recipes.name));
  if (recipeRows.length === 0) return [];

  const recipeIds = recipeRows.map((r) => r.id);

  // 재료/대체재/응용 레시피를 병렬 조회
  const [ingredientRows, substituteRows, variationRows] = await Promise.all([
    db
      .select()
      .from(recipeIngredients)
      .where(inArray(recipeIngredients.recipeId, recipeIds))
      .orderBy(asc(recipeIngredients.sortOrder)),
    db
      .select()
      .from(recipeSubstitutes)
      .where(inArray(recipeSubstitutes.recipeId, recipeIds)),
    db
      .select()
      .from(recipeVariations)
      .where(inArray(recipeVariations.recipeId, recipeIds)),
  ]);

  // 응용 레시피 재료 조회 (variation ID 기반)
  const variationIds = variationRows.map((v) => v.id);
  const varIngredientRows =
    variationIds.length > 0
      ? await db
          .select()
          .from(recipeVariationIngredients)
          .where(inArray(recipeVariationIngredients.variationId, variationIds))
          .orderBy(asc(recipeVariationIngredients.sortOrder))
      : [];

  return recipeRows.map((row) =>
    toRecipe(
      row,
      ingredientRows.filter((r) => r.recipeId === row.id),
      substituteRows.filter((r) => r.recipeId === row.id),
      variationRows.filter((v) => v.recipeId === row.id),
      varIngredientRows
    )
  );
}

/**
 * @function
 * @description 단일 레시피 조회 (관련 데이터 병렬 조회)
 * @param {string} id - 레시피 ID
 * @returns {Promise<Recipe | null>} 레시피 또는 null
 */
export async function getRecipeById(id: string): Promise<Recipe | null> {
  const [recipeRows, ingredientRows, substituteRows, variationRows] = await Promise.all([
    db.select().from(recipes).where(eq(recipes.id, id)),
    db
      .select()
      .from(recipeIngredients)
      .where(eq(recipeIngredients.recipeId, id))
      .orderBy(asc(recipeIngredients.sortOrder)),
    db.select().from(recipeSubstitutes).where(eq(recipeSubstitutes.recipeId, id)),
    db.select().from(recipeVariations).where(eq(recipeVariations.recipeId, id)),
  ]);

  if (!recipeRows[0]) return null;

  const variationIds = variationRows.map((v) => v.id);
  const varIngredientRows =
    variationIds.length > 0
      ? await db
          .select()
          .from(recipeVariationIngredients)
          .where(inArray(recipeVariationIngredients.variationId, variationIds))
          .orderBy(asc(recipeVariationIngredients.sortOrder))
      : [];

  return toRecipe(recipeRows[0], ingredientRows, substituteRows, variationRows, varIngredientRows);
}

// ─── 생성 / 수정 / 삭제 ───────────────────────────────────────────────────────

/**
 * @description 레시피 생성 시 필요한 재료 항목 입력 타입
 */
export interface RecipeIngredientInput {
  ingredientId: string;
  fixedAmount?: number;
  amountMin?: number;
  amountMax?: number;
  ratio?: number;
  amountNote?: string;
  isOptional?: boolean;
  memo?: string;
}

/**
 * @description 레시피 생성 시 필요한 대체재료 입력 타입
 */
export interface RecipeSubstituteInput {
  originalIngredientId: string;
  substituteIngredientId: string;
  substituteRatio?: number;
  memo?: string;
}

/**
 * @description 레시피 생성/수정에 사용하는 입력 타입
 */
export interface RecipeInput {
  name: string;
  catchphrase?: string;
  processType: ProcessType;
  productType: string;
  moldId?: string;
  batchSize: number;
  difficulty?: Difficulty;
  timeRequired?: string;
  skinType?: string[];
  needsHeating: boolean;
  storageLocation?: string;
  tools?: string[];
  ingredients: RecipeIngredientInput[];
  substitutes?: RecipeSubstituteInput[];
  memo?: string;
}

/**
 * @function
 * @description 레시피 생성 (트랜잭션으로 레시피 + 재료 + 대체재료 동시 삽입)
 * @param {RecipeInput} data - 생성할 레시피 데이터
 * @returns {Promise<Recipe>} 생성된 레시피
 */
export async function createRecipe(data: RecipeInput): Promise<Recipe> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.transaction(async (tx) => {
    await tx.insert(recipes).values({
      id,
      name: data.name,
      catchphrase: data.catchphrase ?? null,
      processType: data.processType,
      productType: data.productType,
      moldId: data.moldId ?? null,
      batchSize: data.batchSize,
      difficulty: data.difficulty ?? null,
      timeRequired: data.timeRequired ?? null,
      skinType: data.skinType ? JSON.stringify(data.skinType) : null,
      needsHeating: data.needsHeating,
      storageLocation: data.storageLocation ?? null,
      tools: data.tools ? JSON.stringify(data.tools) : null,
      memo: data.memo ?? null,
      createdAt: now,
      updatedAt: now,
    });

    if (data.ingredients.length > 0) {
      await tx.insert(recipeIngredients).values(
        data.ingredients.map((item, idx) => ({
          id: crypto.randomUUID(),
          recipeId: id,
          ingredientId: item.ingredientId,
          fixedAmount: item.fixedAmount ?? null,
          amountMin: item.amountMin ?? null,
          amountMax: item.amountMax ?? null,
          ratio: item.ratio ?? null,
          amountNote: item.amountNote ?? null,
          isOptional: item.isOptional ?? false,
          memo: item.memo ?? null,
          sortOrder: idx,
        }))
      );
    }

    if (data.substitutes && data.substitutes.length > 0) {
      await tx.insert(recipeSubstitutes).values(
        data.substitutes.map((sub) => ({
          id: crypto.randomUUID(),
          recipeId: id,
          originalIngredientId: sub.originalIngredientId,
          substituteIngredientId: sub.substituteIngredientId,
          substituteRatio: sub.substituteRatio ?? null,
          memo: sub.memo ?? null,
        }))
      );
    }
  });

  return (await getRecipeById(id))!;
}

/**
 * @function
 * @description 레시피 기본 정보 수정 (재료 목록 포함 전체 교체)
 * @param {string} id - 수정할 레시피 ID
 * @param {RecipeInput} data - 수정할 데이터
 * @returns {Promise<Recipe | null>} 수정된 레시피 또는 null
 */
export async function updateRecipe(id: string, data: RecipeInput): Promise<Recipe | null> {
  const existing = await getRecipeById(id);
  if (!existing) return null;

  const now = new Date().toISOString();

  await db.transaction(async (tx) => {
    await tx
      .update(recipes)
      .set({
        name: data.name,
        catchphrase: data.catchphrase ?? null,
        processType: data.processType,
        productType: data.productType,
        moldId: data.moldId ?? null,
        batchSize: data.batchSize,
        difficulty: data.difficulty ?? null,
        timeRequired: data.timeRequired ?? null,
        skinType: data.skinType ? JSON.stringify(data.skinType) : null,
        needsHeating: data.needsHeating,
        storageLocation: data.storageLocation ?? null,
        tools: data.tools ? JSON.stringify(data.tools) : null,
        memo: data.memo ?? null,
        updatedAt: now,
      })
      .where(eq(recipes.id, id));

    // 재료 전체 교체
    await tx.delete(recipeIngredients).where(eq(recipeIngredients.recipeId, id));
    if (data.ingredients.length > 0) {
      await tx.insert(recipeIngredients).values(
        data.ingredients.map((item, idx) => ({
          id: crypto.randomUUID(),
          recipeId: id,
          ingredientId: item.ingredientId,
          fixedAmount: item.fixedAmount ?? null,
          amountMin: item.amountMin ?? null,
          amountMax: item.amountMax ?? null,
          ratio: item.ratio ?? null,
          amountNote: item.amountNote ?? null,
          isOptional: item.isOptional ?? false,
          memo: item.memo ?? null,
          sortOrder: idx,
        }))
      );
    }

    // 대체재료 전체 교체
    await tx.delete(recipeSubstitutes).where(eq(recipeSubstitutes.recipeId, id));
    if (data.substitutes && data.substitutes.length > 0) {
      await tx.insert(recipeSubstitutes).values(
        data.substitutes.map((sub) => ({
          id: crypto.randomUUID(),
          recipeId: id,
          originalIngredientId: sub.originalIngredientId,
          substituteIngredientId: sub.substituteIngredientId,
          substituteRatio: sub.substituteRatio ?? null,
          memo: sub.memo ?? null,
        }))
      );
    }
  });

  return getRecipeById(id);
}

/**
 * @function
 * @description 레시피 삭제 (관련 재료/대체재/응용 레시피 모두 삭제)
 * @param {string} id - 삭제할 레시피 ID
 * @returns {Promise<boolean>} 삭제 성공 여부
 */
export async function deleteRecipe(id: string): Promise<boolean> {
  await db.transaction(async (tx) => {
    // 응용 레시피 재료 먼저 삭제
    const varRows = await tx
      .select({ id: recipeVariations.id })
      .from(recipeVariations)
      .where(eq(recipeVariations.recipeId, id));

    if (varRows.length > 0) {
      await tx
        .delete(recipeVariationIngredients)
        .where(
          inArray(
            recipeVariationIngredients.variationId,
            varRows.map((v) => v.id)
          )
        );
    }

    await tx.delete(recipeVariations).where(eq(recipeVariations.recipeId, id));
    await tx.delete(recipeSubstitutes).where(eq(recipeSubstitutes.recipeId, id));
    await tx.delete(recipeIngredients).where(eq(recipeIngredients.recipeId, id));
    await tx.delete(recipes).where(eq(recipes.id, id));
  });

  const check = await db.select({ id: recipes.id }).from(recipes).where(eq(recipes.id, id));
  return check.length === 0;
}
