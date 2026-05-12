"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createMold, updateMold, deleteMold } from "@soap-studio/db/queries/molds";
import type { Mold } from "@soap-studio/types";

/**
 * @function
 * @description 몰드 생성 Server Action
 * @param {FormData} formData - name, shape, weightPerCell, cellCount, memo 필드
 */
export async function createMoldAction(formData: FormData) {
  const data = {
    name: formData.get("name") as string,
    shape: formData.get("shape") as Mold["shape"],
    weightPerCell: parseFloat(formData.get("weightPerCell") as string),
    cellCount: parseInt(formData.get("cellCount") as string, 10),
    memo: (formData.get("memo") as string) || undefined,
  };

  await createMold(data);
  revalidatePath("/molds");
  redirect("/molds");
}

/**
 * @function
 * @description 몰드 수정 Server Action
 * @param {string} id - 수정할 몰드 ID
 * @param {FormData} formData - name, shape, weightPerCell, cellCount, memo 필드
 */
export async function updateMoldAction(id: string, formData: FormData) {
  const data = {
    name: formData.get("name") as string,
    shape: formData.get("shape") as Mold["shape"],
    weightPerCell: parseFloat(formData.get("weightPerCell") as string),
    cellCount: parseInt(formData.get("cellCount") as string, 10),
    memo: (formData.get("memo") as string) || undefined,
  };

  await updateMold(id, data);
  revalidatePath("/molds");
  redirect("/molds");
}

/**
 * @function
 * @description 몰드 삭제 Server Action
 * @param {string} id - 삭제할 몰드 ID
 */
export async function deleteMoldAction(id: string) {
  await deleteMold(id);
  revalidatePath("/molds");
}
