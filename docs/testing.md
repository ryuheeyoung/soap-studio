# 테스트 가이드

> Soap Studio의 테스트 전략, 작성 규칙, 실행 방법 정리 문서.

---

## 테스트 전략

### 테스트 피라미드

```
         /\
        /E2E\          ← 소수 — 향후 Playwright 도입 예정
       /------\
      /통합테스트\      ← 향후 테스트 DB 구축 후 DB 쿼리 검증
     /----------\
    /  단위테스트  \    ← 현재 집중 대상 (빠름, 저렴, 안정적)
   /--------------\
```

### 우선순위 기준

| 테스트 대상 | 우선순위 | 이유 |
|------------|---------|------|
| 순수 함수 (비즈니스 로직) | 🔴 높음 | 버그 영향 크고 테스트 작성 용이 |
| 인증·세션 로직 | 🔴 높음 | 보안 관련, 엣지케이스 다수 |
| DB 쿼리 / 서버 액션 | 🟡 중간 | 테스트 DB 필요 — 향후 도입 |
| UI 컴포넌트 렌더링 | 🟢 낮음 | 시각적 검증은 테스트로 한계 존재 |
| E2E 사용자 시나리오 | 🟢 낮음 | 앱 안정화 후 핵심 플로우 위주 적용 |

---

## 현재 테스트 현황

| 파일 | 위치 | 테스트 수 | 설명 |
|------|------|-----------|------|
| `calculate.ts` | `apps/web/src/lib/__tests__/` | 20개 | 재료 소요량 계산, 몰드 추천, 배치 크기 계산 |
| `session.ts` | `apps/admin/src/lib/__tests__/` | 13개 | 세션 토큰 생성·검증, 상수 |

---

## 테스트 실행

```bash
# 전체 테스트 (루트에서)
npm run test

# 파일 변경 감지 모드 (개발 중 사용)
cd apps/web && npm run test:watch
cd apps/admin && npm run test:watch

# 커버리지 리포트 생성
cd apps/web && npm run test:coverage
cd apps/admin && npm run test:coverage

# 브라우저 UI로 결과 확인
cd apps/web && npm run test:ui
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

| 항목 | 임계값 |
|------|--------|
| Lines | 80% |
| Functions | 80% |
| Branches | 70% |

---

## Git Hook 연동

| Hook | 실행 내용 |
|------|----------|
| `pre-commit` | ESLint + TypeScript 타입 체크 |
| `pre-push` | 전체 테스트 (`npm run test`) |

테스트 실패 시 push 차단.
