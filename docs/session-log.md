# 세션 작업 로그

> 주요 작업 결정 및 변경 이력 기록. 상세 커밋 내역은 `git log` 참고.

---

## 2026-05-07

- 레시피 재료 행 UI 정리 — `groupLabel` 자동 세팅(pill), `isOptional`·`memo` 행 제거
- 재료 검색 UX 개선 — 검색어 수정 시 이전 선택 자동 초기화
- 레시피 등록 시 신규 재료 동시 생성 기능 추가 (`resolveIngredients()`)
- 대체재료 원본 재료 범위를 레시피 내 등록 재료로만 제한

---

## 2026-05-12

- DB 마이그레이션 완료: SQLite → Neon (PostgreSQL) + Drizzle ORM
- 시드 데이터 삽입: 재료 26개, 레시피 6개

---

## 2026-05-14~15

- AGENTS.md 개발 컨벤션 문서화 (ESLint, commitlint, 테스트 규칙)
- `packages/types`에 공유 상수 추출 (`INGREDIENT_CATEGORY_LABELS` 등)
- `packages/ui` 공유 컴포넌트 라이브러리 구축 + Storybook 세팅
  - 컴포넌트: Button, Input, Textarea, Select, FormLabel, Card, AlertPanel, Badge, Table
  - 양 앱 컴포넌트에 `@soap-studio/ui` 적용 완료

---

## 2026-05-29

- `packages/ui`에 `Stepper` 공유 컴포넌트 추가 (`[−] value [+]`, `editable` prop으로 직접 입력 지원)
- admin `RecipeForm` 재료 행에 고정/범위 토글 추가 — 범위 선택 시 min~max 두 입력란 표시
- web 레시피 계산기 `SessionPanel` 범위 재료 입력 UX 개선
  - `editingAmounts` 로컬 상태로 중간값·빈값 허용 (`onChange` 로컬만, `onBlur`에서 클램핑 후 스토어 저장)
  - 리셋 버튼 input 내부 절대 배치, `tabIndex={-1}`로 Tab 키 스킵, `onMouseDown + preventDefault`로 blur 차단
  - 이벤트 핸들러 전체 선언형 named 함수로 분리 리팩토링
- AGENTS.md 이벤트 핸들러 선언형 작성 규칙 및 커밋 빈도 규칙 추가

---

## 2026-05-18

- `docs/testing.md`에 대상별 개발 워크플로우 섹션 추가
  - 순수 함수 → Vitest 먼저 / UI 컴포넌트 → Storybook 먼저 / 페이지·Server Action → 구현 먼저
- FormLabel, Table Storybook story 추가 (전체 컴포넌트 Story 완료)
- 재료 재고 주황색 경고 제거 (0일 때만 빨강 표시)
