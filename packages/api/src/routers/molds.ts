import { getAllMolds } from "@soap-studio/db/queries/molds";
import { publicProcedure, router } from "../trpc";

/**
 * @description 몰드 관련 tRPC 프로시저 — 현재 읽기 전용
 */
export const moldsRouter = router({
  getAll: publicProcedure.query(() => getAllMolds()),
});
