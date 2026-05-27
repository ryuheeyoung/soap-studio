"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createRecipe, updateRecipe, deleteRecipe } from "@soap-studio/db/queries/recipes";
import type { RecipeInput, RecipeIngredientInput, RecipeSubstituteInput } from "@soap-studio/db/queries/recipes";
import { createIngredient } from "@soap-studio/db/queries/ingredients";
import type { ProcessType, Difficulty, Unit } from "@soap-studio/types";

// 레시피 폼에서 전달되는 재료 payload (기존 or 신규)
interface IngredientPayload {
  ingredientId?: string;
  newIngredientName?: string;
  newIngredientUnit?: string;
  fixedAmount?: number;
  isOptional: boolean;
}

// 레시피 폼에서 전달되는 대체재료 payload (대체 재료가 신규일 수 있음)
interface SubstitutePayload {
  originalIngredientId: string;
  substituteIngredientId?: string;
  newSubIngredientName?: string;
  newSubIngredientUnit?: string;
  memo?: string;
}

/**
 * @function
 * @description 신규 재료 payload를 DB에 생성하고 RecipeIngredientInput 배열로 변환
 * @param {IngredientPayload[]} payload - 폼에서 전달된 재료 목록 (기존 ID or 신규 이름)
 * @returns {Promise<RecipeIngredientInput[]>} ID가 확정된 재료 입력 배열
 */
async function resolveIngredients(payload: IngredientPayload[]): Promise<RecipeIngredientInput[]> {
  const results = await Promise.all(
    payload.map(async (item) => {
      let ingredientId = item.ingredientId;

      if (!ingredientId && item.newIngredientName) {
        // 신규 재료 생성 (category/stock은 기본값, 사용자가 나중에 재료 화면에서 수정)
        const created = await createIngredient({
          name: item.newIngredientName,
          category: "other",
          unit: (item.newIngredientUnit as Unit) || "g",
          stock: 0,
        });
        ingredientId = created.id;
      }

      if (!ingredientId) return null;

      const resolved: RecipeIngredientInput = {
        ingredientId,
        fixedAmount: item.fixedAmount,
        isOptional: item.isOptional,
      };
      return resolved;
    })
  );
  return results.filter((x): x is NonNullable<typeof x> => x !== null);
}

/**
 * @function
 * @description 신규 대체재료 payload를 DB에 생성하고 RecipeSubstituteInput 배열로 변환
 * @param {SubstitutePayload[]} payload - 폼에서 전달된 대체재료 목록
 * @returns {Promise<RecipeSubstituteInput[]>} ID가 확정된 대체재료 입력 배열
 */
async function resolveSubstitutes(payload: SubstitutePayload[]): Promise<RecipeSubstituteInput[]> {
  const results = await Promise.all(
    payload.map(async (item) => {
      let substituteIngredientId = item.substituteIngredientId;

      if (!substituteIngredientId && item.newSubIngredientName) {
        const created = await createIngredient({
          name: item.newSubIngredientName,
          category: "other",
          unit: (item.newSubIngredientUnit as Unit) || "g",
          stock: 0,
        });
        substituteIngredientId = created.id;
      }

      if (!substituteIngredientId) return null;

      const resolved: RecipeSubstituteInput = {
        originalIngredientId: item.originalIngredientId,
        substituteIngredientId,
        memo: item.memo,
      };
      return resolved;
    })
  );
  return results.filter((x): x is NonNullable<typeof x> => x !== null);
}

/**
 * @function
 * @description FormData에서 레시피 입력값 파싱
 * @param {FormData} formData - 폼 데이터
 * @param {RecipeIngredientInput[]} resolvedIngredients - 이미 resolve된 재료 목록
 * @param {RecipeSubstituteInput[]} resolvedSubstitutes - 이미 resolve된 대체재료 목록
 * @returns {RecipeInput} 파싱된 레시피 입력값
 */
function parseRecipeInput(
  formData: FormData,
  resolvedIngredients: RecipeIngredientInput[],
  resolvedSubstitutes: RecipeSubstituteInput[]
): RecipeInput {
  const skinTypeRaw = formData.get("skinType") as string;
  const toolsRaw = formData.get("tools") as string;

  const skinType = skinTypeRaw
    ? skinTypeRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : undefined;

  const tools = toolsRaw
    ? toolsRaw.split("\n").map((s) => s.trim()).filter(Boolean)
    : undefined;

  return {
    name: formData.get("name") as string,
    catchphrase: (formData.get("catchphrase") as string) || undefined,
    processType: formData.get("processType") as ProcessType,
    productType: formData.get("productType") as string,
    batchSize: Number(formData.get("batchSize")),
    difficulty: (formData.get("difficulty") as Difficulty) || undefined,
    timeRequired: (formData.get("timeRequired") as string) || undefined,
    skinType,
    needsHeating: formData.get("needsHeating") === "true",
    storageLocation: (formData.get("storageLocation") as string) || undefined,
    tools,
    ingredients: resolvedIngredients,
    substitutes: resolvedSubstitutes,
    memo: (formData.get("memo") as string) || undefined,
  };
}

/**
 * @function
 * @description 레시피 생성 서버 액션
 * @param {FormData} formData - 폼 데이터
 */
export async function createRecipeAction(formData: FormData) {
  const ingredientsJson = formData.get("ingredients") as string;
  const substitutesJson = formData.get("substitutes") as string;
  const rawIngredients: IngredientPayload[] = ingredientsJson ? JSON.parse(ingredientsJson) : [];
  const rawSubstitutes: SubstitutePayload[] = substitutesJson ? JSON.parse(substitutesJson) : [];

  const resolvedIngredients = await resolveIngredients(rawIngredients);
  const resolvedSubstitutes = await resolveSubstitutes(rawSubstitutes);

  const data = parseRecipeInput(formData, resolvedIngredients, resolvedSubstitutes);
  await createRecipe(data);
  revalidatePath("/recipes");
  revalidatePath("/ingredients");

  redirect("/recipes");
}

/**
 * @function
 * @description 레시피 수정 서버 액션
 * @param {string} id - 수정할 레시피 ID
 * @param {FormData} formData - 폼 데이터
 */
export async function updateRecipeAction(id: string, formData: FormData) {
  const ingredientsJson = formData.get("ingredients") as string;
  const substitutesJson = formData.get("substitutes") as string;
  const rawIngredients: IngredientPayload[] = ingredientsJson ? JSON.parse(ingredientsJson) : [];
  const rawSubstitutes: SubstitutePayload[] = substitutesJson ? JSON.parse(substitutesJson) : [];

  const resolvedIngredients = await resolveIngredients(rawIngredients);
  const resolvedSubstitutes = await resolveSubstitutes(rawSubstitutes);

  const data = parseRecipeInput(formData, resolvedIngredients, resolvedSubstitutes);
  await updateRecipe(id, data);
  revalidatePath("/recipes");
  revalidatePath("/ingredients");

  redirect("/recipes");
}

/**
 * @function
 * @description 레시피 삭제 서버 액션
 * @param {string} id - 삭제할 레시피 ID
 */
export async function deleteRecipeAction(id: string) {
  await deleteRecipe(id);
  revalidatePath("/recipes");

}
