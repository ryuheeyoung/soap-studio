# Soap Studio — 기능 백로그

> 사용 중 발굴된 개선 항목. 우선순위 순으로 정렬하여 하나씩 작업.

---

## 진행 중 / 예정

_현재 진행 예정 항목 없음_

---

## 완료

### B0. tRPC 전환 (web 데이터 페칭 구조 개선)

**결과**

- `packages/api` — tRPC router (recipes, ingredients, molds) 구축
- `apps/web` — tRPC 클라이언트 + TanStack Query 설정 (App Router 방식)
- 전체 page.tsx Server Component → Client Component + useQuery 전환
- admin-web 결합 완전 제거 (revalidateWeb 제거)

---

### B1. 레시피 재료 수량 조정 + 대체재료 선택 (web 계산기)

**결과**

- 범위(`amountMin`~`amountMax`) 재료 수량 직접 입력 (min/max 클램핑, 리셋 버튼)
- 대체재료 토글 UI (기본재료 ↔ 대체재료 전환, 토글 시 원래 재료명 표시 버그 수정)
- 선택된 재료 기준 재고 부족 여부 실시간 반영 (빨간 글씨)

---

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
