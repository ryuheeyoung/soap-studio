# 테스트 가이드

> Soap Studio의 테스트 전략, 작성 규칙, 실행 방법 정리 문서.

---

## 개발 워크플로우

**기능·화면 개발 전에 테스트 또는 Story를 먼저 작성하는 것을 원칙으로 함.** 단, 대상 유형에 따라 접근 방식을 다르게 가져감.

### 대상별 개발 순서

#### 1. 순수 비즈니스 로직 (Vitest 먼저)

`lib/calculate.ts`, `lib/utils.ts` 등 DB·UI 의존성이 없는 순수 함수.

```
1. 테스트 파일 작성 (__tests__/xxx.test.ts)
   → 입력/출력 케이스 먼저 정의 (happy path + 경계값)
2. 함수 구현
3. 테스트 통과 확인 → 필요 시 리팩토링
```

> **이유**: 입력·출력이 명확해서 TDD 사이클이 빠름. 테스트 작성이 설계를 강제해서 엣지케이스를 구현 전에 발견할 수 있음.

#### 2. 공유 UI 컴포넌트 (Storybook 먼저)

`packages/ui`에 추가하는 신규 컴포넌트.

```
1. Story 파일 작성 (src/stories/Xxx.stories.tsx)
   → props API(variant 등) 확정
2. 컴포넌트 구현
3. Storybook으로 시각 확인 (다크모드 포함)
4. 앱에 import 교체
```

> **이유**: Story를 먼저 쓰면 props 인터페이스를 사용하는 입장에서 설계하게 됨. 구현 전에 API를 확정할 수 있음.

#### 3. 페이지 / Server Action (구현 먼저)

Next.js Server Component, `app/` 라우트, Server Action, DB 쿼리.

```
1. 기능 구현
2. 수동 동작 확인
3. (선택) 핵심 로직이 분리 가능하면 단위 테스트 추가
```

> **이유**: Server Component·Action은 렌더링·DB 의존성이 얽혀서 테스트 선행 비용이 실익보다 큼. 억지로 mock을 쌓는 대신 핵심 로직만 순수 함수로 분리해서 단위 테스트.

---

### 요약표

| 대상 | 순서 | 도구 |
|------|------|------|
| 순수 함수 / 유틸리티 | 테스트 → 구현 | Vitest |
| `packages/ui` 공유 컴포넌트 | Story → 구현 | Storybook |
| 페이지 / Server Action / DB 쿼리 | 구현 → (선택) 테스트 | — |

---

## 테스트 전략

### 테스트 피라미드

```
         /\
        /E2E\          ← 소수 — 향후 Playwright 도입 예정
       /------\
      /통합테스트\      ← 향후 테스트 DB 구축 후 DB 쿼리 검증
     /----------\
    / Storybook  \     ← UI 컴포넌트 시각적 검증 (packages/ui)
   /--------------\
  /  단위테스트    \   ← 현재 집중 대상 (빠름, 저렴, 안정적)
 /----------------\
```

### 우선순위 기준

| 테스트 대상 | 우선순위 | 방법 |
|------------|---------|------|
| 순수 함수 (비즈니스 로직) | 🔴 높음 | Vitest 단위 테스트 |
| 인증·세션 로직 | 🔴 높음 | Vitest 단위 테스트 |
| UI 공유 컴포넌트 | 🔴 높음 | Storybook (packages/ui) |
| DB 쿼리 / 서버 액션 | 🟡 중간 | 테스트 DB 필요 — 향후 도입 |
| E2E 사용자 시나리오 | 🟢 낮음 | Playwright — 앱 안정화 후 도입 |

---

## 현재 테스트 현황

### 단위 테스트 (Vitest)

| 파일 | 위치 | 테스트 수 | 설명 |
|------|------|-----------|------|
| `calculate.ts` | `apps/web/src/lib/__tests__/` | 20개 | 재료 소요량 계산, 몰드 추천, 배치 크기 계산 |
| `session.ts` | `apps/admin/src/lib/__tests__/` | 13개 | 세션 토큰 생성·검증, 상수 |

### Storybook (UI 컴포넌트)

| 컴포넌트 | Story 수 | 설명 |
|----------|---------|------|
| 구현 진행 중 | — | `packages/ui` 신규 작업 — [`docs/ui-package.md`](ui-package.md) 참고 |

---

## 테스트 실행

```bash
# 전체 단위 테스트 (루트에서)
npm run test

# 파일 변경 감지 모드 (개발 중 사용)
cd apps/web && npm run test:watch
cd apps/admin && npm run test:watch

# 커버리지 리포트 생성
cd apps/web && npm run test:coverage
cd apps/admin && npm run test:coverage

# 브라우저 UI로 결과 확인
cd apps/web && npm run test:ui

# Storybook 실행 (UI 컴포넌트 시각적 검증)
cd packages/ui && npm run storybook     # 포트 6006
```

---

## 테스트 작성 규칙

### 1. 파일 위치

대상 파일과 같은 패키지 내 `__tests__` 폴더에 배치.

```
src/
└── lib/
    ├── calculate.ts
    └── __tests__/
        └── calculate.test.ts   ← {대상파일명}.test.ts
```

### 2. 구조 — describe / it

```typescript
describe("함수명 또는 모듈명", () => {
  describe("세부 기능 그룹 (선택)", () => {
    it("should [기대 동작] when [조건]", () => {
      // ...
    });
  });
});
```

- `describe` — 테스트 대상 그룹 (함수명, 클래스명)
- `it` — 개별 케이스. **"should + 기대 동작"** 영문으로 작성
- `it.each` — 입력값만 다른 반복 케이스 파라미터화

### 3. AAA 패턴 (필수)

**Arrange → Act → Assert** 세 단계를 빈 줄로 구분.

```typescript
it("should return 1000 when scale is 2", () => {
  // Arrange
  const items = [{ batchSize: 500, scale: 2, ... }];

  // Act
  const result = calcTotalBatchSize(items);

  // Assert
  expect(result).toBe(1000);
});
```

### 4. 픽스처 격리

- **불변 데이터** — 모듈 상단 `const`로 선언
- **변경 가능한 데이터** — `beforeEach`에서 재할당하여 테스트 간 격리
- **환경변수** — `vi.stubEnv` 사용, `afterEach`에서 `vi.unstubAllEnvs()` 복원

```typescript
beforeEach(() => {
  vi.stubEnv("SESSION_SECRET", "test-secret");
});

afterEach(() => {
  vi.unstubAllEnvs();
});
```

### 5. 테스트 케이스 체크리스트

새 함수 작성 시 아래 기준으로 케이스 도출.

- [ ] 정상 동작 (happy path)
- [ ] 빈 입력 / 경계값 (empty, 0, null, undefined)
- [ ] 잘못된 입력 (invalid input)
- [ ] 예외 발생 케이스 (`toThrow`)
- [ ] 환경 의존 케이스 (env 미설정 등)

---

## 커버리지 임계값

`vitest.config.ts` 설정 기준. 미달 시 `vitest run --coverage` 실패 처리.

### 단계적 상향 전략

프로젝트 초반에는 테스트 코드가 적어 높은 임계값을 맞추기 어려움. 임계값을 낮게 시작해 테스트를 점진적으로 추가하면서 함께 올려가는 방식 채택.

| 단계 | 시점 | Lines | Functions | Branches |
|------|------|-------|-----------|----------|
| 초기 (현재) | 테스트 도입 초반 | 5% | 5% | 5% |
| 중간 | 주요 비즈니스 로직 커버 완료 후 | 60% | 60% | 50% |
| 목표 | 안정화 단계 | 80% | 80% | 70% |

> 임계값 상향 기준: 새 함수 추가 시 테스트를 함께 작성하고, 현재 커버리지가 다음 단계 임계값에 근접하면 `vitest.config.ts`를 업데이트.

### 현재 설정 (`apps/admin/vitest.config.ts`)

| 항목 | 현재 임계값 | 목표 임계값 |
|------|------------|------------|
| Lines | 30% | 80% |
| Functions | 30% | 80% |
| Branches | 20% | 70% |

---

## Git Hook 연동

| Hook | 실행 내용 |
|------|----------|
| `pre-commit` | ESLint + TypeScript 타입 체크 |
| `pre-push` | 전체 단위 테스트 (`npm run test`) |

테스트 실패 시 push 차단.

---

## Storybook 작성 규칙

### 파일 위치

```
packages/ui/src/stories/
└── Button.stories.tsx    ← {ComponentName}.stories.tsx
```

### 필수 Story 구성

공유 컴포넌트를 `packages/ui`에 추가할 때 Story도 반드시 함께 작성.

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../components/Button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],  // 자동 문서 생성
};
export default meta;

type Story = StoryObj<typeof Button>;

// 각 variant별 story 필수 작성
export const Primary: Story = { args: { variant: "primary", children: "저장하기" } };
export const Secondary: Story = { args: { variant: "secondary", children: "취소" } };
export const Disabled: Story = { args: { variant: "primary", children: "저장 중...", disabled: true } };
```

### Story 체크리스트

새 컴포넌트 추가 시 아래 기준으로 story 도출.

- [ ] `Default` — 기본 상태
- [ ] 각 variant별 story (primary/secondary/text 등)
- [ ] `Disabled` — 비활성 상태 (버튼·입력 컴포넌트)
- [ ] 다크모드 확인 (`Storybook > Backgrounds` 패널 활용)
