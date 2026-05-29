import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@soap-studio/api";

/**
 * @description tRPC HTTP 엔드포인트 핸들러. GET/POST 모두 처리
 */
const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({}),
  });

export { handler as GET, handler as POST };
