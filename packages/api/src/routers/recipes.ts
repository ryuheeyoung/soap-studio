import { getAllRecipes } from '@soap-studio/db/queries/recipes';

import { publicProcedure, router } from '../trpc';

/**
 * @description 레시피 관련 tRPC 프로시저 — 현재 읽기 전용
 */
export const recipesRouter = router({
  getAll: publicProcedure.query(() => getAllRecipes()),
});
