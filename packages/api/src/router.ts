import { ingredientsRouter } from './routers/ingredients';
import { moldsRouter } from './routers/molds';
import { recipesRouter } from './routers/recipes';
import { router } from './trpc';

/**
 * @description 전체 tRPC 앱 라우터 — 각 도메인 라우터를 조합
 */
export const appRouter = router({
  recipes: recipesRouter,
  ingredients: ingredientsRouter,
  molds: moldsRouter,
});

// 클라이언트 타입 추론용 export
export type AppRouter = typeof appRouter;
