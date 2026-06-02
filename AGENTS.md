# Soap Studio 프로젝트 전용 규칙

workspace/AGENTS.md 의 공통 규칙 위에 추가되거나 재정의되는 이 프로젝트 전용 규칙.
같은 주제가 겹칠 경우 이 파일이 우선함.

> 프로젝트 전체 구조·기술 스택은 `docs/architecture.md`, 테스트 전략·커버리지는 `docs/testing.md` 참조.
> 관련 작업 시작 전에 해당 문서를 반드시 읽을 것.

---

## 패키지 책임 경계

- 앱 레이어에서 Drizzle 직접 호출 금지 — DB 접근은 반드시 `packages/db` 경유
- `packages/api`(tRPC)는 `apps/web`만 소비 — `apps/admin`에서 tRPC 클라이언트 추가 금지
- `packages/types`에는 두 앱 이상에서 쓰는 타입·상수만 배치. 단일 앱 전용이면 해당 앱 내부에

---

## TypeScript 코딩 컨벤션 (§4 추가)

공통 규칙(§4)에 내부 패키지 import 규칙을 추가함.

### 내부 패키지 import 순서

`@soap-studio/*` 패키지는 외부 라이브러리(2그룹)와 내부 절대경로(3그룹) 사이에 위치.

```tsx
// 1그룹: React / Next.js
import { useState } from 'react';

// 2그룹: 외부 라이브러리
import { motion } from 'framer-motion';

// 2.5그룹: 내부 패키지 (@soap-studio/*)
import { Button } from '@soap-studio/ui';

// 3그룹: 내부 절대경로 (@/)
import { formatDate } from '@/lib/dateUtils';

import type { Recipe } from '@soap-studio/types';
```

### 앱별 import 제한

- `apps/web`에서 `@soap-studio/db` 직접 import 금지 — tRPC 경유
- `apps/admin`에서 `@soap-studio/api` import 금지 — Server Actions 사용

---

## 공통 상수 & 타입 관리 (§6 재정의)

모노레포 구조에 맞게 공유 범위를 두 단계로 구분함.
공통 규칙(§6)의 `src/constants/`, `src/types/`는 단일 앱 기준이므로 아래 표를 따를 것.

| 성격                     | 위치                    |
| ------------------------ | ----------------------- |
| 앱 간 공유 타입·상수     | `packages/types/src/`   |
| 앱 간 공유 UI 컴포넌트   | `packages/ui/src/`      |
| 앱 내부 전용 타입        | `apps/*/src/types/`     |
| 앱 내부 전용 상수        | `apps/*/src/constants/` |
| web 전역 클라이언트 상태 | `apps/web/src/stores/`  |

---

## 도구 설정 위치 (§7 재정의)

공통 규칙(§7)은 단일 앱 기준. 이 프로젝트에서는 아래 레벨을 따를 것.

| 도구        | 설정 위치                         | 비고                 |
| ----------- | --------------------------------- | -------------------- |
| ESLint      | 앱별 (`apps/*/eslint.config.mjs`) | `packages/*`는 생략  |
| Prettier    | 루트 (`.prettierrc`)              | 전 워크스페이스 공유 |
| Vitest      | 앱별 (`apps/*/vitest.config.ts`)  |                      |
| Husky       | 루트 (`.husky/`)                  |                      |
| commitlint  | 루트 (`commitlint.config.js`)     |                      |
| lint-staged | 루트 `package.json`               |                      |
| tsconfig    | 워크스페이스별 개별 관리          | 공유 base 없음       |

패키지 설치 시 위 표 기준을 따를 것.
(예: ESLint 플러그인은 해당 앱 폴더에서, Husky 관련은 루트에서 `npm install -D`)

---

## 테스트 코드 (§8 재정의)

> 전체 테스트 전략·커버리지 임계값은 `docs/testing.md` 참조.

### 테스트 대상 범위

- `packages/db`, `packages/api`, `packages/types`, `packages/ui`는 별도 테스트 미설정
- 테스트 파일 위치: 각 앱의 `src/lib/__tests__/`

---

## 데이터 패칭 전략

> 배경 및 선택 이유는 `docs/architecture.md` 참조.

두 앱의 전략이 다르며 혼재를 금지함.

### apps/web — tRPC + TanStack Query

- 서버 데이터는 tRPC 프로시저 + TanStack Query로 클라이언트 캐싱
- Server Action 추가 금지
- 서버 데이터를 Zustand store에 저장하지 않음 (캐싱은 TanStack Query가 담당)

### apps/admin — Server Actions

- 모든 데이터 변경은 Server Action
- tRPC 클라이언트 추가 금지
- 클라이언트 상태는 최소화

---

## Server Component / Client Component 사용 기준

기본은 Server Component. 아래 조건 중 하나라도 해당하면 파일 상단에 `'use client'` 추가.

| 조건                    | 예시                              |
| ----------------------- | --------------------------------- |
| 브라우저 이벤트 핸들러  | `onClick`, `onChange`, `onSubmit` |
| React 상태·사이드이펙트 | `useState`, `useEffect`, `useRef` |
| 브라우저 전용 API       | `localStorage`, `window`          |
| Zustand store 접근      | `useRecipeStore()`                |
| TanStack Query 훅       | `useQuery()`, `useMutation()`     |
| tRPC 클라이언트 훅      | `trpc.*.useQuery()`               |

---

## Zustand store 패턴 (web 전용)

- 위치: `apps/web/src/stores/`
- 파일 1개 = 도메인 1개 (예: `recipeStore.ts`, `ingredientStore.ts`)
- store에는 UI 상태(선택값, 모달 열림 여부 등)만 관리
- 서버 데이터는 TanStack Query 캐시로 관리 — store 중복 보관 금지

---

## Next.js 관련 주의사항

- 코드 작성 전 `node_modules/next/dist/docs/` 확인 (Breaking changes 주의)
- 두 앱 모두 Turbopack 기본 활성화 — `next.config.ts`에서 임의로 비활성화하지 않음
- `transpilePackages` 목록은 앱별로 다름. 임의 수정 금지
  - `apps/web`: `@soap-studio/types`만
  - `apps/admin`: `@soap-studio/types` + `@soap-studio/db`
