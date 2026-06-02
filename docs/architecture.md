# 아키텍처 설계

## 모노레포 구조

Turborepo 기반 모노레포. 사용자 앱(web)과 관리자 앱(admin)을 분리하고, 공유 코드는 패키지로 관리.

```
soap-studio/
  apps/
    web/        → 사용자 앱 (레시피 열람, 계산기, 재고 현황)
    admin/      → 관리자 앱 (재료·레시피·몰드 CRUD, 재고 조정)
  packages/
    types/      → 공유 타입 + 상수 (@soap-studio/types)
    db/         → Drizzle ORM 스키마 & 쿼리 (@soap-studio/db)
    ui/         → 공유 UI 컴포넌트 + Storybook (@soap-studio/ui)
    api/        → tRPC router (@soap-studio/api)
  turbo.json
  package.json
```

## 앱별 기술 스택

| 항목            | apps/web              | apps/admin                     |
| --------------- | --------------------- | ------------------------------ |
| 데이터 패칭     | tRPC + TanStack Query | Server Actions                 |
| 클라이언트 상태 | Zustand               | 최소화 (서버 상태 중심)        |
| DB 접근         | `packages/api` 경유   | `packages/db` 직접 (transpile) |
| 인증            | 없음 (개인 전용)      | 비밀번호 + 세션 쿠키           |

---

## 앱별 역할 분리

### apps/web (사용자 앱)

모바일·태블릿에서 제작 중 참조용.

| 기능        | 설명                                                   |
| ----------- | ------------------------------------------------------ |
| 레시피 목록 | 전체 레시피 카드 목록, 계산기 추가 버튼                |
| 제작 계산기 | 레시피 복수 선택 + 배율 → 필요 재료 합산 + 부족량 파악 |
| 재고 현황   | 현재 보유 재료 잔량 조회 (카테고리별)                  |

### apps/admin (관리자 앱)

데이터 세팅·관리용. 비밀번호 인증으로 접근 제한.

| 기능        | 설명                                                  |
| ----------- | ----------------------------------------------------- |
| 재료 CRUD   | 재료 마스터 등록·수정·삭제, 구매단위 옵션 관리        |
| 재고 조정   | 구매 후 일괄 추가 / 제작 후 일괄 차감 (JSON 붙여넣기) |
| 몰드 CRUD   | 몰드 등록·수정·삭제                                   |
| 레시피 CRUD | 레시피 등록·수정·삭제, 대체재료 관리                  |

---

## 인증

- **web**: 인증 없음 (개인 전용)
- **admin**: 환경변수로 설정한 비밀번호 단순 일치 확인
  - `ADMIN_PASSWORD` 환경변수 비교
  - 세션 쿠키로 로그인 상태 유지

---

## 데이터 페칭 전략

### apps/web — tRPC + TanStack Query

`packages/api`에 tRPC router를 정의하고, web은 tRPC 클라이언트로 데이터 페칭.

```
packages/api (tRPC router)
  ├── recipesRouter      → getAllRecipes()
  ├── ingredientsRouter  → getAllIngredients()
  └── moldsRouter        → getAllMolds()

apps/web (tRPC client + TanStack Query)
  └── trpc.recipes.getAll.useQuery()
      staleTime: 30s, refetchOnWindowFocus: true
```

**선택 이유**

- end-to-end 타입 안전성 (schema 없이 TypeScript 타입 자동 추론)
- TanStack Query 캐싱으로 탭 이동 시 즉시 응답, 백그라운드 갱신
- admin → web 간 결합 없음 (revalidation API 불필요)
- web 앱에서 DB 직접 접근 제거

### apps/admin — Server Actions

데이터 변경은 모두 Server Action으로 처리. 클라이언트 상태를 최소화하고 서버 상태 중심으로 동작.

---

## 공유 패키지

### @soap-studio/types

두 앱이 동일한 타입·상수를 참조. 타입 불일치 버그 방지.

```ts
import {
  DIFFICULTY_LABELS,
  INGREDIENT_CATEGORY_LABELS,
} from '@soap-studio/types';

import type { Ingredient, Recipe } from '@soap-studio/types';
```

### @soap-studio/db

Drizzle ORM 스키마 및 쿼리 함수. DB 접근 권한은 앱별로 분리.

| 앱           | DB 롤          | 권한        |
| ------------ | -------------- | ----------- |
| `apps/admin` | `neondb_owner` | 읽기 + 쓰기 |
| `apps/web`   | `web_reader`   | 읽기 전용   |

### @soap-studio/ui

공유 UI 컴포넌트 라이브러리. Tailwind CSS 클래스를 variant 기반으로 캡슐화.

- 컴포넌트: `Button`, `Input`, `Textarea`, `Select`, `FormLabel`, `Card`, `AlertPanel`, `Badge`, `Table`
- Storybook 8 + Vite로 시각적 검증 (`cd packages/ui && npm run storybook`)
- 각 앱의 `globals.css`에 `@source` 디렉티브로 Tailwind 스캔 경로 추가

---

## 재고 조정 워크플로우

### 구매 후 재고 추가

```
web 계산기 → [구매목록 복사] (JSON)
  → admin /ingredients/stock-adjust 붙여넣기
  → 미리보기 확인 → "재고 일괄 적용"
```

### 제작 후 재고 차감

```
web 계산기 → [소요량 복사] (JSON)
  → admin /ingredients/stock-deduct 붙여넣기
  → 미리보기 확인 → "재고 일괄 차감"
```
