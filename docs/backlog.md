# Soap Studio — 기능 백로그

> 사용 중 발굴된 개선 항목. 우선순위 순으로 정렬하여 하나씩 작업.

---

## 진행 중 / 예정

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

### B2. 레시피 재료 메모 표시 (web)

**배경**
- 재료 메모에 "멘톨 1~3%, 추천 2%" 같은 실용 정보를 기록해두고 있음
- 현재 web에서 메모가 전혀 표시되지 않아 계산기 사용 시 참고 불가

**요구사항**
- [ ] 레시피 재료 목록에서 `memo` 필드가 있는 경우 표시
- [ ] 계산기 세션 패널의 재료 행에도 메모 노출 (작은 글씨 또는 툴팁)

**관련 데이터**
- `recipe_ingredients`: `memo`

**영향 범위**
- `apps/web/src/components/calculator/SessionPanel.tsx`
- (선택) `apps/web/src/app/recipes/` 레시피 상세 뷰

---

## 보류 / 장기

### B3. 멀티유저 전환

- 인증(Clerk) + 스키마 `user_id` 격리
- 별도 마일스톤으로 분리 — 현재 단독 사용 중이므로 우선순위 낮음

### B4. E2E 테스트 (Playwright)

- 계산기 핵심 플로우 위주
- 앱 안정화 후 도입
