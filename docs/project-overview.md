# Soap Studio - 수제비누 관리 플랫폼

## 프로젝트 목표

수제비누/헤어케어/스킨케어 등 수제 제품 제작을 위한 재료 재고 관리, 레시피 관리, 제작 전 부족 재료 계산을 통합 제공하는 반응형 웹 앱.

---

## 기술 스택

| 항목 | 선택 |
|------|------|
| 프레임워크 | Next.js 15 (App Router) |
| 언어 | TypeScript |
| 스타일링 | Tailwind CSS |
| 상태관리 | Zustand (전역 상태) + React Query (서버 상태) |
| DB | Neon (PostgreSQL) + Drizzle ORM — 마이그레이션 예정 (`docs/db-migration.md` 참고) |
| UI 컴포넌트 | shadcn/ui |
| 반응형 | 모바일 우선 (sm/md/lg breakpoint) |

---

## 앱 구성

현재는 단일 Next.js 앱. 추후 admin 분리 시 Turborepo 모노레포 전환 예정.

> 자세한 내용은 `docs/architecture.md` 참고

---

## 핵심 설계 원칙

### 재료는 전역 공유 풀
재료(Ingredient)는 레시피마다 따로 존재하지 않음.
전체 재료 목록이 하나의 공유 풀이고, 각 레시피는 그 풀에서 재료를 **참조**하는 구조.
→ 재고 변경 시 모든 레시피에 즉시 반영됨.

### 제조방식과 제품유형은 독립 분리
`processType`(어떻게 만드나)과 `productType`(무엇을 만드나)을 별도 필드로 관리.
→ "HP 방식으로 만든 물비누", "MP 방식으로 만든 샴푸바" 등 모든 조합 지원.

### 여러 레시피를 한 세션에서 동시 계산
한 번의 제작에 레시피를 여러 개 선택 + 배율 지정 가능.
계산기는 선택된 레시피들의 필요 재료를 전부 합산한 뒤,
현재 재고와 비교해 부족 재료를 한눈에 표시.

---

## 핵심 도메인 모델

### 1. 재료 (Ingredient) — 전역 공유 풀
```
id, name, category, unit, stock(현재 재고), memo
```
- 카테고리: `soap_base` | `oil` | `butter` | `lye` | `water` | `surfactant` | `emulsifier` | `powder` | `additive` | `essential_oil` | `colorant` | `other`
- 구매 단위 옵션(5ml/10ml/20ml 등 규격 관리)은 admin 기능으로 추후 설계

### 2. 몰드 (Mold)
```
id, name, shape, weightPerCell(g), cellCount, totalCapacity(g), memo
```
- `totalCapacity = weightPerCell × cellCount` (자동 계산)

### 3. 레시피 (Recipe)
```
id, name, catchphrase
processType: mp | cp | hp
productType: string  ("비누" | "샴푸바" | "물비누" | "클렌징오일" | 자유입력)
moldId(optional), batchSize(g)
difficulty, timeRequired, skinType[], needsHeating, storageLocation, tools[]
  └─ RecipeIngredient[]
       ingredientId (→ 공유 풀 참조)
       groupLabel(optional)        ← "비누베이스" | "첨가물" | "1" 등
       fixedAmount(g/ml)           ← 고정 사용량
       amountMin / amountMax       ← 범위 표기 (2~3g)
       ratio(%)                    ← CP 등 비율 기반 레시피용
       amountNote                  ← "약간" | "내외" | "40방울"
       isOptional(boolean)
  └─ RecipeSubstitute[]
       originalIngredientId
       substituteIngredientId
       substituteRatio(%)
  └─ RecipeVariation[]             ← 응용 레시피 (일부만)
       label, description, ingredients[]
```

### 4. 제작 세션 (ProductionSession) — 핵심 계산 단위
```
items[]
  └─ { recipeId, scale(배율), selectedSubstitutes }
```
- 배율 예시: 0.5(절반), 1(기본), 2(두 배)
- 각 레시피 필요량 계산 → 전체 합산 → 재고 비교 → 부족량 표시

---

## 계산 흐름

```
[레시피 A × 2배] + [레시피 B × 0.5배] + [레시피 C × 1배]
        ↓
 재료별 필요량 합산 (동일 재료는 모두 더함)
        ↓
 현재 재고와 비교
        ↓
 ✅ 충분한 재료 / ❌ 부족한 재료 + 부족량 표시
```

---

## 몰드 추천 로직 (M5 계산기에서 구현)

총 배치 용량(g) 기준으로 보유 몰드를 자동 추천.
얇은 비누 / 반반 비누가 생기지 않도록 용량 잔량을 명시.

```
총 필요 용량 = Σ (레시피 batchSize × scale)
        ↓
단일 몰드 추천:
  ✅ 딱 맞음    totalCapacity 오차 ±10% 이내
  ⚠️ 조금 남음  totalCapacity > 총 용량 (잔량 표시)
  ❌ 부족       totalCapacity < 총 용량
        ↓
조합 추천: 2개 이상 몰드 합산이 총 용량에 가장 근접한 조합 제시
```

---

## 페이지 구조

```
/                         → 대시보드 (재고 요약, 최근 세션)
/ingredients              → 재료 목록 & 재고 관리
/ingredients/new          → 재료 추가
/ingredients/[id]         → 재료 상세 & 수정
/molds                    → 몰드 목록 관리
/molds/new                → 몰드 추가
/molds/[id]               → 몰드 상세 & 수정
/recipes                  → 레시피 목록
/recipes/new              → 레시피 추가
/recipes/[id]             → 레시피 상세 & 수정
/calculator               → 제작 세션 계산기
```

---

## 작업 마일스톤

> 자세한 내용은 `docs/milestones.md` 참고

| 단계 | 내용 | 상태 |
|------|------|------|
| M0 | 프로젝트 초기 설정 및 문서화 | ✅ 완료 |
| M1 | 공통 레이아웃 & 네비게이션 | 🔄 진행중 |
| M2 | 재료 관리 CRUD | 🔲 예정 |
| M3 | 몰드 관리 CRUD | 🔲 예정 |
| M4 | 레시피 관리 CRUD | 🔲 예정 |
| M5 | 제작 세션 계산기 | 🔲 예정 |
| M6 | 세션 저장/불러오기 | 🔲 예정 |
| M7 | 데이터 영속성 (로컬 → DB 연동) | 🔲 예정 |
