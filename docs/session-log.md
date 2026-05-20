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

## 2026-05-18

- `docs/testing.md`에 대상별 개발 워크플로우 섹션 추가
  - 순수 함수 → Vitest 먼저 / UI 컴포넌트 → Storybook 먼저 / 페이지·Server Action → 구현 먼저
- FormLabel, Table Storybook story 추가 (전체 컴포넌트 Story 완료)
- 재료 재고 주황색 경고 제거 (0일 때만 빨강 표시)
