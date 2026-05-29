"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { trpc } from "./client";

/**
 * @function
 * @description Vercel 배포 환경과 로컬 개발 환경에 맞는 베이스 URL 반환
 * @returns {string} tRPC 엔드포인트 베이스 URL
 */
function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

/**
 * @component
 * @description tRPC + TanStack Query 공급자. 앱 루트에서 전체를 감싸 useQuery 훅 사용 활성화
 * @param {React.ReactNode} props.children - 하위 컴포넌트
 */
export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 30초 동안 캐싱 유지, 탭 복귀 시 자동 갱신
            staleTime: 30 * 1000,
            refetchOnWindowFocus: true,
          },
        },
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
