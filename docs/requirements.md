# Soap Studio — 요구사항 정의

> 최종 업데이트: 2026-05-13  
> 이 문서는 프로젝트의 핵심 요구사항과 현재 구현 상태를 정리한 기준 문서.

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
| R4 | 재료의 **구매단위**와 레시피 사용단위 분리 관리 | ❌ 미구현 (스키마 추가 필요) |
| R5 | 몰드 관리 (형태, 칸당 무게, 칸 수) | ✅ 완료 (admin) |
| R6 | 제작 계획 — 여러 레시피 선택 + 레시피별 배율 조정 | ✅ 완료 (web 계산기) |
| R7 | 레시피별 필요 재료 + 추천 몰드 표시 | ✅ 완료 (web 계산기) |
| R8 | 선택 레시피 전체 기준 부족 재료 합산 표시 | ✅ 완료 (web 계산기) |
| R9 | 부족 재료 구매 후 재고 수량 등록 (구매단위 기준) | ❌ 미구현 |
| R10 | 제작 완료 후 소모 재료 수량 차감 처리 | ❌ 미구현 |

---

## 3. 앱 구조 (Turborepo 모노레포)

```
soap-studio/
├── apps/
│   ├── admin/     관리자 앱 — 레시피·재료·몰드 CRUD, 재고 조정
│   └── web/       사용자 앱 — 레시피 열람, 계산기 (현재 공개 예정)
├── packages/
│   ├── db/        Drizzle ORM 스키마 & 쿼리 (Neon PostgreSQL)
│   └── types/     공유 TypeScript 타입
```

### DB 접근 권한 분리

| 앱 | DB 롤 | 권한 |
|----|-------|------|
| `apps/admin` | `neondb_owner` | 읽기 + 쓰기 (full access) |
| `apps/web` | `web_reader` | 읽기 전용 |

> 향후 멀티유저 지원 시 web 앱에도 인증 기반 쓰기 권한 추가 예정.

---

## 4. 미구현 항목 상세

### R4 — 구매단위 (Purchase Options)

레시피에서 재료는 `g`, `ml` 단위로 사용하지만,  
실제 구매는 여러 규격 중 하나를 선택하게 됨.

**예시:**
- 라벤더EO → 30ml 바이알 / 50ml 병 / 100ml 병
- 약산성비누베이스 → 300g 팩 / 1kg 포대
- 시어버터 → 100g / 500g / 1kg

동일 재료에 구매 옵션이 **여러 개** 존재할 수 있으므로,  
`ingredients` 컬럼 추가가 아닌 **별도 1:N 테이블**로 관리.

**신규 테이블: `ingredient_purchase_options`**
```sql
CREATE TABLE ingredient_purchase_options (
  id          text PRIMARY KEY,
  ingredient_id text NOT NULL REFERENCES ingredients(id),
  label       text NOT NULL,   -- 표시명: "30ml 바이알", "100ml 병"
  size        real NOT NULL,   -- 베이스 단위 기준 수량: 30, 100 (ml/g)
  sort_order  integer NOT NULL DEFAULT 0
);
```

**계산 예시:**
```
라벤더EO 부족량: 35ml
구매 옵션: 30ml / 50ml / 100ml
→ 각 옵션별 필요 개수:
   30ml × 2개 = 60ml  (+25ml 잉여)
   50ml × 1개 = 50ml  (+15ml 잉여)  ← 최적
  100ml × 1개 = 100ml (+65ml 잉여)
→ 사용자가 옵션 선택 후 구매 반영
```

**UI 변경 필요:**
- admin 재료 편집 폼에 구매옵션 목록 추가/삭제 UI
- web 계산기 부족 재료 목록에 구매옵션 선택 드롭다운 + 필요 개수 표시

---

### R9 — 구매 후 재고 등록

**워크플로우:**
```
web 계산기에서 부족 재료 확인
  → [부족량 복사] 버튼으로 JSON 클립보드 복사
  → admin /stock-adjust 페이지에서 붙여넣기
  → 구매단위 기준으로 수량 조정
  → "구매 반영 (+추가)" 적용 → 재고 업데이트
```

**복사 JSON 포맷 (예시):**
```json
[
  {
    "ingredientId": "abc",
    "name": "라벤더EO",
    "shortage": 35,
    "unit": "ml",
    "purchaseOptions": [
      { "id": "opt1", "label": "30ml 바이알", "size": 30, "neededQty": 2 },
      { "id": "opt2", "label": "50ml 병",    "size": 50, "neededQty": 1 },
      { "id": "opt3", "label": "100ml 병",   "size": 100, "neededQty": 1 }
    ]
  }
]
```

**admin `/stock-adjust` 페이지 (신규):**
- JSON 붙여넣기 → 파싱 → 미리보기 테이블
  - 재료명 / 현재재고 / 구매수량(단위) / 추가량 / 적용후 재고
- 수량 직접 편집 가능 (구매단위 기준)
- "구매 반영" 버튼 → 배치 재고 업데이트

---

### R10 — 제작 후 재료 소진 처리

**워크플로우:**
```
web 계산기에서 레시피 세팅 (비누 만들기 직전 상태 그대로)
  → [소요량 복사] 버튼으로 JSON 클립보드 복사
  → admin /stock-adjust 에서 붙여넣기
  → "제작 소진 (−차감)" 선택 → 재고 차감
```

**또는 (더 자동화된 방식):**
- admin에 "제작 완료 등록" 페이지를 별도로 만들어
- 레시피 + 배율 선택하면 소모 재료 자동 계산 후 한 번에 차감

---

## 5. 현재 스키마 vs 필요 스키마 갭

| 테이블 | 현재 | 변경 내용 |
|--------|------|-----------|
| `ingredients` | id, name, category, unit, stock, memo | 변경 없음 |
| `ingredient_purchase_options` | — | **신규 테이블** (1개 재료 : N개 구매옵션) |
| 나머지 | — | 변경 없음 |

### `ingredient_purchase_options` 신규 테이블

```
ingredient_purchase_options
  id              text PK
  ingredient_id   text → ingredients.id
  label           text   "30ml 바이알", "100ml 병"
  size            real   베이스 단위 기준 수량 (30, 100)
  sort_order      int    표시 순서
```

---

## 6. 향후 멀티유저 전환 시 고려사항

현재 스키마는 단일 유저 기반. 멀티유저 지원 시 다음 테이블에 `user_id` 추가 필요:

- `ingredients` — 유저별 재료 풀 격리
- `recipes` — 유저별 레시피
- `molds` — 유저별 몰드

**인증 스택 후보:** Clerk (NextAuth 대비 설정 간단, Next.js App Router 최적화)

> 멀티유저 전환은 스키마 마이그레이션이 수반되므로 단독 마일스톤으로 분리 예정.

---

## 7. 다음 작업 순서 (우선순위)

1. **R4 구매단위 스키마 추가** — `ingredient_purchase_options` 신규 테이블 + admin 재료 폼 UI 반영
2. **R9 재고 조정 페이지 (admin `/stock-adjust`)** — JSON 붙여넣기 + 구매 반영
3. **web 계산기 복사 버튼** — 부족량/소요량 JSON 클립보드 복사
4. **R10 제작 소진 처리** — `/stock-adjust`에 차감 모드 추가 or 별도 페이지
