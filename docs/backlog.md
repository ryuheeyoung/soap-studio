# Soap Studio — 기능 백로그

> 사용 중 발굴된 개선 항목. 우선순위 순으로 정렬하여 하나씩 작업.

---

## 진행 중 / 예정

### B0. tRPC 전환 (web 데이터 페칭 구조 개선)

**배경**
- 현재 web 앱은 Server Component에서 DB를 직접 호출하고 `noStore()`로 캐시를 전면 비활성화
- 매 페이지 이동마다 Neon 콜드스타트 포함 전체 쿼리 재실행 → 체감 속도 저하
- ISR + cross-project revalidation 방식은 admin-web 간 결합도를 높이고 유지 보수 포인트를 늘림

**목표 구조**
- `packages/api` 패키지 신규 추가 → tRPC router 정의
- web: Server Component DB 직접 호출 제거 → `trpc.xxx.useQuery()` 클라이언트 페칭으로 전환
- TanStack Query `staleTime` + `refetchOnWindowFocus` 활용 → 탭 복귀 시 자동 갱신
- admin은 변경 없음 (admin-web 결합 완전 제거)

**요구사항**
- [ ] `packages/api` — tRPC router (recipes, ingredients, molds)
- [ ] `apps/web` — tRPC 클라이언트 설정 (App Router 방식)
- [ ] `apps/web` pages — Server Component → Client Component + useQuery 전환
- [ ] `apps/web/.env.local` — `DATABASE_URL` 제거 (web은 tRPC 경유, DB 직접 접근 불필요)
- [ ] ISR(`revalidate`) 및 `revalidateWeb` 관련 코드 제거

**영향 범위**
- `apps/web/src/app/` 전체 page.tsx
- `apps/admin/src/lib/actions/` — revalidateWeb 호출 제거
- `packages/api/` 신규

---

### B1. 레시피 재료 수량 조정 + 대체재료 선택 (web 계산기)

**배경**
- 현재 계산기는 `amountMin`(없으면 `fixedAmount`)을 고정값으로 사용
- 범위 재료 (예: 멘톨 8~24g, 추천 2%)의 경우 사용자가 직접 양을 조정하고 싶음
- 대체재료가 등록된 경우 재료를 교체하여 재고 계산에 반영하고 싶음

**요구사항**
- [ ] 범위(`amountMin`~`amountMax`) 재료에 대해 수량 직접 입력 또는 슬라이더 조정
- [ ] 대체재료 등록된 재료는 선택 UI 제공 (기본재료 ↔ 대체재료 토글)
- [ ] 선택된 재료 기준으로 재고 부족 여부 실시간 반영

**관련 데이터**
- `recipe_ingredients`: `amount_min`, `amount_max`, `fixed_amount`
- `recipe_substitutes`: `original_ingredient_id`, `substitute_ingredient_id`, `memo`

**영향 범위**
- `apps/web/src/components/calculator/SessionPanel.tsx`
- `apps/web/src/lib/calculate.ts` — `getEffectiveAmount()` 수정 필요

---

## 완료

### B2. 레시피 메모 표시 (web 계산기)

**배경**
- 레시피 메모에 "멘톨 1~3%, 추천 2%" 같은 실용 정보를 기록해두고 있음
- 계산기 사용 시 배합 비율 참고를 위해 메모 노출 필요

**결과**
- 계산기 세션 패널 각 레시피 카드에 `recipe.memo` 표시
- 헤더 행(레시피명 + 배율 컨트롤) 아래 full-width로 분리, `whitespace-pre-line` 적용으로 줄바꿈 유지

---

## 보류 / 장기

### B3. 멀티유저 전환

- 인증(Clerk) + 스키마 `user_id` 격리
- 별도 마일스톤으로 분리 — 현재 단독 사용 중이므로 우선순위 낮음

### B4. E2E 테스트 (Playwright)

- 계산기 핵심 플로우 위주
- 앱 안정화 후 도입
