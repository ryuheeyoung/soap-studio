import { createTRPCReact } from '@trpc/react-query';

import type { AppRouter } from '@soap-studio/api';

// tRPC React 훅 인스턴스 — 앱 전체에서 이 객체를 통해 API 호출
export const trpc = createTRPCReact<AppRouter>();
