# UI 패키지 — 공유 컴포넌트 라이브러리

> 최종 업데이트: 2026-05-15
> `packages/ui` 설계 기준 및 컴포넌트 목록 정리 문서.

---

## 1. 목적

`apps/admin`과 `apps/web`에서 반복 사용되는 Tailwind CSS 패턴을 `packages/ui`로 추출하여 일관된 디자인 시스템 유지.

- 동일 컴포넌트를 두 앱에서 각각 구현하는 중복 제거
- Storybook을 통해 컴포넌트 단위 시각적 검증 및 문서화
- 변경 시 한 곳에서 수정하면 양 앱에 자동 반영

---

## 2. 패키지 구조

```
packages/ui/
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Select.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── AlertPanel.tsx
│   │   ├── FormLabel.tsx
│   │   └── Table/
│   │       ├── Table.tsx
│   │       ├── Th.tsx
│   │       └── Td.tsx
│   └── index.ts          ← 전체 re-export
├── src/stories/
│   ├── Button.stories.tsx
│   ├── Input.stories.tsx
│   └── ...
├── .storybook/
│   ├── main.ts
│   └── preview.ts
├── package.json
├── tsconfig.json
└── tailwind.config.ts    ← Storybook 전용 Tailwind 설정
```

---

## 3. Tailwind 연동 방식

공유 컴포넌트는 Tailwind 클래스 문자열을 그대로 사용.  
각 앱의 `tailwind.config.ts`에서 `packages/ui/src` 경로를 content 스캔 대상에 추가하여 클래스 누락 방지.

```ts
// apps/admin/tailwind.config.ts (및 apps/web/tailwind.config.ts)
content: [
  "./src/**/*.{ts,tsx}",
  "../../packages/ui/src/**/*.{ts,tsx}",  // ← 추가
]
```

---

## 4. 컴포넌트 목록

### 우선순위 기준

| 우선순위 | 기준 |
|---------|------|
| 🔴 높음 | 두 앱 모두 사용, 패턴이 거의 동일 |
| 🟡 중간 | 한 앱 중심이지만 재사용 가능성 높음 |
| 🟢 낮음 | 앱 특화 컴포넌트 — 추후 검토 |

### 컴포넌트별 상세

| 컴포넌트 | 우선순위 | 변형(variant) | 비고 |
|----------|---------|--------------|------|
| `Button` | 🔴 | primary, secondary, text, icon | disabled 상태 포함 |
| `Input` | 🔴 | default, sm | focus ring 공통 |
| `Textarea` | 🔴 | default, mono | mono는 JSON 입력용 |
| `Select` | 🔴 | default, sm | |
| `Card` | 🔴 | default, bordered | 조건부 border 색상 지원 |
| `AlertPanel` | 🔴 | success(emerald), error(red), warning(amber) | |
| `FormLabel` | 🔴 | default, sm | `<label>` 래퍼 |
| `Badge` | 🟡 | default, colored | 공정타입(MP/CP/HP) 색상 포함 |
| `Table` | 🟡 | — | Th, Td, Tr 서브컴포넌트 분리 |
| `Stepper` | 🟡 | default, editable | `[−] value [+]` 수량 조절. `editable=true`일 때 직접 입력 지원 |
| `SectionHeader` | 🟡 | default, uppercase | 카테고리 헤더 등 |

---

## 5. Storybook 설정

- **프레임워크**: Storybook 8 + Vite (Next.js 없이 순수 React)
- **위치**: `packages/ui` 내부
- **실행**: `cd packages/ui && npm run storybook` (포트 6006)
- **Tailwind**: Storybook 전용 `tailwind.config.ts` + `preview.ts`에서 전역 CSS import

### Story 작성 규칙

- 파일 위치: `src/stories/{ComponentName}.stories.tsx`
- 각 컴포넌트당 아래 story 필수 작성:
  - `Default` — 기본 상태
  - 각 variant별 story
  - `Disabled` — 비활성 상태 (해당 컴포넌트에 한함)
- `args`를 활용해 Controls 패널에서 실시간 변경 가능하게 구성

```tsx
// 예시
const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
};

export const Primary: Story = {
  args: { variant: "primary", children: "저장하기" },
};

export const Disabled: Story = {
  args: { variant: "primary", children: "저장 중...", disabled: true },
};
```

---

## 6. 개발 워크플로우

```
1. packages/ui에서 컴포넌트 작성 + Story 작성
2. Storybook으로 시각적 검증
3. apps/admin 또는 apps/web에서 import 교체
4. 기존 인라인 Tailwind 클래스 제거
```

---

## 7. 구현 진행 상황

| 컴포넌트 | 구현 | Story | 앱 적용 |
|----------|------|-------|--------|
| Button | ✅ | ✅ | ✅ (admin: IngredientForm, MoldForm, StockAdjustPanel, StockDeductPanel, RecipeForm / web: SessionPanel) |
| Input | ✅ | ✅ | ✅ (admin: IngredientForm, MoldForm, RecipeForm) |
| Textarea | ✅ | ✅ | ✅ (admin: IngredientForm, MoldForm, StockAdjustPanel, StockDeductPanel, RecipeForm) |
| Select | ✅ | ✅ | ✅ (admin: IngredientForm, MoldForm, RecipeForm) |
| Card | ✅ | ✅ | ✅ (admin: RecipeForm / web: recipes/page, SessionPanel, RecipeBreakdownPanel) |
| AlertPanel | ✅ | ✅ | ✅ (admin: StockAdjustPanel, StockDeductPanel / web: ResultPanel) |
| FormLabel | ✅ | ✅ | ✅ (admin: IngredientForm, MoldForm, StockAdjustPanel, StockDeductPanel, RecipeForm) |
| Badge | ✅ | ✅ | ✅ (web: recipes/page) |
| Table | ✅ | ✅ | ✅ (admin: StockAdjustPanel, StockDeductPanel) |
| Stepper | ✅ | ✅ | ✅ (web: SessionPanel 배율·구매수량 조정 / admin: 추후 적용) |
| SectionHeader | ⬜ | ⬜ | ⬜ |
