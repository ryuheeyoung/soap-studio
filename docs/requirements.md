# Soap Studio — 요구사항 정의

> 최종 업데이트: 2026-05-27
> 프로젝트의 핵심 요구사항과 현재 구현 상태 정리 기준 문서.

---

## 1. 프로젝트 목적

수제 DIY 제품(비누, 샴푸바, 물비누 등) 제작을 위한 **레시피 관리 + 재료 재고 관리 + 제작 계획 계산기** 통합 웹앱.

- **현재**: 1인 사용 (개인 도구)
- **향후**: 멀티유저 — 계정별 레시피/재료 독립 관리 (인증 + 유저 격리 필요)

---

## 2. 핵심 요구사항

| # | 요구사항 | 구현 상태 |
|---|----------|-----------|
| R1 | DIY 레시피 등록/수정/삭제 관리 | ✅ 완료 (admin) |
| R2 | 레시피별 재료 목록과 사용량 관리 | ✅ 완료 (admin) |
| R3 | 보유 재료 목록과 재고량 관리 | ✅ 완료 (admin) |
| R4 | 재료의 **구매단위**와 레시피 사용단위 분리 관리 | ✅ 완료 (1:N 별도 테이블) |
| R5 | 몰드 관리 (형태, 칸당 무게, 칸 수) | ✅ 완료 (admin) |
| R6 | 제작 계획 — 여러 레시피 선택 + 레시피별 배율 조정 | ✅ 완료 (web 계산기) |
| R7 | 레시피별 필요 재료 + 추천 몰드 표시 | ✅ 완료 (web 계산기) |
| R8 | 선택 레시피 전체 기준 부족 재료 합산 표시 | ✅ 완료 (web 계산기) |
| R9 | 부족 재료 구매 후 재고 수량 등록 (구매단위 기준) | ✅ 완료 (admin /stock-adjust) |
| R10 | 제작 완료 후 소모 재료 수량 차감 처리 | ✅ 완료 (admin /stock-deduct) |

---

## 3. 앱 구조 (Turborepo 모노레포)

```
soap-studio/
├── apps/
│   ├── admin/     관리자 앱 — 레시피·재료·몰드 CRUD, 재고 조정
│   └── web/       사용자 앱 — 레시피 열람, 계산기
├── packages/
│   ├── api/       tRPC 라우터 (@soap-studio/api)
│   ├── db/        Drizzle ORM 스키마 & 쿼리 (Neon PostgreSQL)
│   └── types/     공유 TypeScript 타입
└── docs/          요구사항, 테스트 가이드 등 기획 문서
```

### DB 접근 권한 분리

| 앱 / 패키지 | DB 롤 | 권한 |
|------------|-------|------|
| `apps/admin` | `neondb_owner` | 읽기 + 쓰기 (full access) |
| `packages/api` (tRPC) | `web_reader` | 읽기 전용 |

> `apps/web`은 DB에 직접 접근하지 않음. tRPC Route Handler(`packages/api`)를 경유하여 데이터 조회.  
> 향후 멀티유저 지원 시 tRPC context에 인증 미들웨어 추가 예정.

---

## 4. 재고 관리 워크플로우

### 구매 후 재고 추가 (R9)

```
web 계산기에서 부족 재료 확인
  → [구매목록 복사] 버튼으로 JSON 클립보드 복사
  → admin /ingredients/stock-adjust 에서 붙여넣기
  → 미리보기 확인 (현재 재고 / 추가량 / 적용 후 재고)
  → "재고 일괄 적용" → 재고 업데이트
```

### 제작 후 재고 차감 (R10)

```
web 계산기에서 레시피 세팅 (제작 직전 상태)
  → [소요량 복사] 버튼으로 JSON 클립보드 복사
  → admin /ingredients/stock-deduct 에서 붙여넣기
  → 미리보기 확인 (현재 재고 / 차감량 / 적용 후 재고)
  → "재고 일괄 차감" → 재고 차감 (0 미만은 0으로 고정)
```

---

## 5. 현재 스키마

| 테이블 | 주요 컬럼 |
|--------|-----------|
| `recipes` | id, name, process_type, product_type, batch_size, ... |
| `recipe_ingredients` | recipe_id, ingredient_id, fixed_amount, is_optional |
| `recipe_substitutes` | recipe_id, original_ingredient_id, substitute_ingredient_id |
| `ingredients` | id, name, category, unit, stock, memo |
| `ingredient_purchase_options` | id, ingredient_id, label, size, sort_order |
| `molds` | id, name, shape, weight_per_cell, cell_count, total_capacity |

### `ingredient_purchase_options` (1:N)

```
ingredient_purchase_options
  id              text PK
  ingredient_id   text → ingredients.id
  label           text   예: "30ml 바이알", "100ml 병"
  size            real   베이스 단위 기준 수량 (30, 100)
  sort_order      int    표시 순서
```

---

## 6. 향후 멀티유저 전환 시 고려사항

현재 스키마는 단일 유저 기반. 멀티유저 지원 시 아래 테이블에 `user_id` 추가 필요.

- `ingredients` — 유저별 재료 풀 격리
- `recipes` — 유저별 레시피
- `molds` — 유저별 몰드

**인증 스택 후보**: Clerk (NextAuth 대비 설정 간단, Next.js App Router 최적화)

> 멀티유저 전환은 스키마 마이그레이션 수반 — 단독 마일스톤으로 분리 예정.

---

## 7. 다음 작업 후보

| 항목 | 우선순위 | 비고 |
|------|---------|------|
| tRPC 전환 (web 데이터 페칭) | ✅ 완료 | packages/api + TanStack Query CSR |
| Vercel 배포 | ✅ 완료 | [soap.zzirong.dev](https://soap.zzirong.dev) / [admin-soap.zzirong.dev](https://admin-soap.zzirong.dev) |
| 멀티유저 전환 | 🔴 높음 | 인증(Clerk) + 스키마 user_id 격리 — 별도 마일스톤 |
| E2E 테스트 (Playwright) | 🟢 낮음 | 계산기 핵심 플로우 위주, 앱 안정화 후 도입 |
