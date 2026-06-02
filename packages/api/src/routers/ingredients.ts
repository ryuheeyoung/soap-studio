import { getAllIngredients } from '@soap-studio/db/queries/ingredients';

import { publicProcedure, router } from '../trpc';

/**
 * @description 재료 관련 tRPC 프로시저 — 현재 읽기 전용
 */
export const ingredientsRouter = router({
  getAll: publicProcedure.query(() => getAllIngredients()),
});
