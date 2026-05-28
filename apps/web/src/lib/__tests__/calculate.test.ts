import { describe, it, expect, beforeEach } from "vitest";
import { calculateRequirements, recommendMolds, calcTotalBatchSize, filterMoldsForRecipe } from "../calculate";
import type { Recipe, Ingredient, Mold } from "@soap-studio/types";
import type { SessionItem } from "@/stores/session";

// 테스트용 SessionItem 생성 헬퍼 — 새 필드의 기본값 자동 적용
function makeItem(base: Pick<SessionItem, "recipeId" | "recipeName" | "batchSize" | "scale"> & Partial<SessionItem>): SessionItem {
  return { amountOverrides: {}, selectedSubstitutes: {}, ...base };
}

// ─── 공통 픽스처 ─────────────────────────────────────────────────────────────
// 각 테스트에서 독립적으로 사용하기 위해 beforeEach에서 재할당

let ingredients: Ingredient[];
let recipe: Recipe;
let molds: Mold[];

beforeEach(() => {
  ingredients = [
    {
      id: "ing-oil",
      name: "코코넛오일",
      category: "oil",
      unit: "g",
      stock: 500,
      purchaseOptions: [],
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    {
      id: "ing-lye",
      name: "가성소다",
      category: "lye",
      unit: "g",
      stock: 50,
      purchaseOptions: [],
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    {
      id: "ing-water",
      name: "정제수",
      category: "water",
      unit: "g",
      stock: 10, // 의도적으로 부족한 재고
      purchaseOptions: [],
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
  ];

  recipe = {
    id: "recipe-1",
    name: "테스트 비누",
    processType: "cp",
    productType: "비누",
    batchSize: 500,
    needsHeating: false,
    ingredients: [
      { ingredientId: "ing-oil", fixedAmount: 300, isOptional: false },
      { ingredientId: "ing-lye", fixedAmount: 60, isOptional: false },
      { ingredientId: "ing-water", fixedAmount: 140, isOptional: false },
    ],
    substitutes: [],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  };

  molds = [
    {
      id: "mold-large",
      name: "직사각형 6구",
      shape: "rectangle",
      weightPerCell: 90,
      cellCount: 6,
      totalCapacity: 540,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    {
      id: "mold-medium",
      name: "원형 4구",
      shape: "circle",
      weightPerCell: 80,
      cellCount: 4,
      totalCapacity: 320,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    {
      id: "mold-small",
      name: "미니 2구",
      shape: "rectangle",
      weightPerCell: 60,
      cellCount: 2,
      totalCapacity: 120,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
  ];
});

// ─── calcTotalBatchSize ───────────────────────────────────────────────────────

describe("calcTotalBatchSize", () => {
  it("should return 0 when session is empty", () => {
    // Arrange
    const items: SessionItem[] = [];

    // Act
    const result = calcTotalBatchSize(items);

    // Assert
    expect(result).toBe(0);
  });

  it("should return batchSize as-is when scale is 1", () => {
    // Arrange
    const items: SessionItem[] = [
      makeItem({ recipeId: "r1", recipeName: "레시피A", batchSize: 500, scale: 1 }),
    ];

    // Act
    const result = calcTotalBatchSize(items);

    // Assert
    expect(result).toBe(500);
  });

  it.each([
    { scale: 0.5, expected: 250 },
    { scale: 1, expected: 500 },
    { scale: 2, expected: 1000 },
    { scale: 3, expected: 1500 },
  ])("should return $expected when scale is $scale", ({ scale, expected }) => {
    // Arrange
    const items: SessionItem[] = [
      makeItem({ recipeId: "r1", recipeName: "레시피A", batchSize: 500, scale }),
    ];

    // Act
    const result = calcTotalBatchSize(items);

    // Assert
    expect(result).toBe(expected);
  });

  it("should sum batch sizes across multiple recipes", () => {
    // Arrange
    const items: SessionItem[] = [
      makeItem({ recipeId: "r1", recipeName: "레시피A", batchSize: 500, scale: 1 }),
      makeItem({ recipeId: "r2", recipeName: "레시피B", batchSize: 300, scale: 2 }),
    ];

    // Act
    const result = calcTotalBatchSize(items);

    // Assert
    expect(result).toBe(1100); // 500*1 + 300*2
  });
});

// ─── calculateRequirements ───────────────────────────────────────────────────

describe("calculateRequirements", () => {
  it("should return empty array when session is empty", () => {
    // Act
    const result = calculateRequirements([], [recipe], ingredients);

    // Assert
    expect(result).toHaveLength(0);
  });

  it("should ignore items whose recipe does not exist", () => {
    // Arrange
    const items: SessionItem[] = [
      makeItem({ recipeId: "no-such-recipe", recipeName: "없음", batchSize: 500, scale: 1 }),
    ];

    // Act
    const result = calculateRequirements(items, [recipe], ingredients);

    // Assert
    expect(result).toHaveLength(0);
  });

  it("should mark ingredient as sufficient when stock >= required", () => {
    // Arrange
    const items: SessionItem[] = [
      makeItem({ recipeId: "recipe-1", recipeName: "테스트 비누", batchSize: 500, scale: 1 }),
    ];

    // Act
    const result = calculateRequirements(items, [recipe], ingredients);
    const oil = result.find((r) => r.ingredientId === "ing-oil")!;

    // Assert
    expect(oil.isSufficient).toBe(true);
    expect(oil.shortage).toBe(0);
    expect(oil.required).toBe(300);
    expect(oil.inStock).toBe(500);
  });

  it("should mark ingredient as insufficient and calculate shortage correctly", () => {
    // Arrange
    // 정제수: 재고 10g, 필요량 140g → 부족량 130g
    const items: SessionItem[] = [
      makeItem({ recipeId: "recipe-1", recipeName: "테스트 비누", batchSize: 500, scale: 1 }),
    ];

    // Act
    const result = calculateRequirements(items, [recipe], ingredients);
    const water = result.find((r) => r.ingredientId === "ing-water")!;

    // Assert
    expect(water.isSufficient).toBe(false);
    expect(water.shortage).toBe(130);
  });

  it("should scale required amount by the given scale factor", () => {
    // Arrange
    const items: SessionItem[] = [
      makeItem({ recipeId: "recipe-1", recipeName: "테스트 비누", batchSize: 500, scale: 2 }),
    ];

    // Act
    const result = calculateRequirements(items, [recipe], ingredients);
    const oil = result.find((r) => r.ingredientId === "ing-oil")!;

    // Assert
    expect(oil.required).toBe(600); // 300g * 2
  });

  it("should place insufficient ingredients before sufficient ones", () => {
    // Arrange
    const items: SessionItem[] = [
      makeItem({ recipeId: "recipe-1", recipeName: "테스트 비누", batchSize: 500, scale: 1 }),
    ];

    // Act
    const result = calculateRequirements(items, [recipe], ingredients);
    const firstSufficientIndex = result.findIndex((r) => r.isSufficient);
    const lastInsufficientIndex = result.findLastIndex((r) => !r.isSufficient);

    // Assert — 부족 재료 인덱스가 모두 충분 재료 인덱스보다 앞
    expect(lastInsufficientIndex).toBeLessThan(firstSufficientIndex);
  });

  it("should aggregate requirements from multiple session items", () => {
    // Arrange — 동일 레시피를 두 세션에 각각 1배, 1배 담음 → 합산 2배 필요
    const items: SessionItem[] = [
      makeItem({ recipeId: "recipe-1", recipeName: "테스트 비누", batchSize: 500, scale: 1 }),
      makeItem({ recipeId: "recipe-1", recipeName: "테스트 비누", batchSize: 500, scale: 1 }),
    ];

    // Act
    const result = calculateRequirements(items, [recipe], ingredients);
    const oil = result.find((r) => r.ingredientId === "ing-oil")!;

    // Assert
    expect(oil.required).toBe(600); // 300 * 2
  });

  it("should use amountOverride instead of fixedAmount when set", () => {
    // Arrange — 오일 오버라이드 200g (기본 300g)
    const items: SessionItem[] = [
      makeItem({
        recipeId: "recipe-1",
        recipeName: "테스트 비누",
        batchSize: 500,
        scale: 1,
        amountOverrides: { "ing-oil": 200 },
      }),
    ];

    // Act
    const result = calculateRequirements(items, [recipe], ingredients);
    const oil = result.find((r) => r.ingredientId === "ing-oil")!;

    // Assert
    expect(oil.required).toBe(200);
  });

  it("should use substitute ingredient when selectedSubstitutes is set", () => {
    // Arrange — 오일 대체재료 등록된 레시피
    const recipeWithSub: Recipe = {
      ...recipe,
      substitutes: [
        {
          originalIngredientId: "ing-oil",
          substituteIngredientId: "ing-lye",
          memo: "테스트 대체",
        },
      ],
    };
    const items: SessionItem[] = [
      makeItem({
        recipeId: "recipe-1",
        recipeName: "테스트 비누",
        batchSize: 500,
        scale: 1,
        selectedSubstitutes: { "ing-oil": "ing-lye" },
      }),
    ];

    // Act
    const result = calculateRequirements(items, [recipeWithSub], ingredients);

    // Assert — 원래 오일(ing-oil) 결과는 없고, 대체재료(ing-lye)에 합산
    const oil = result.find((r) => r.ingredientId === "ing-oil");
    const lye = result.find((r) => r.ingredientId === "ing-lye")!;
    expect(oil).toBeUndefined();
    expect(lye.required).toBe(360); // 오일 300g + 가성소다 60g
    expect(lye.originalIngredientId).toBe("ing-oil");
  });

  it("should apply substituteRatio when set", () => {
    // Arrange — 대체재료 사용 시 0.5배 적용
    const recipeWithRatio: Recipe = {
      ...recipe,
      substitutes: [
        {
          originalIngredientId: "ing-oil",
          substituteIngredientId: "ing-lye",
          substituteRatio: 0.5,
        },
      ],
    };
    const items: SessionItem[] = [
      makeItem({
        recipeId: "recipe-1",
        recipeName: "테스트 비누",
        batchSize: 500,
        scale: 1,
        selectedSubstitutes: { "ing-oil": "ing-lye" },
      }),
    ];

    // Act
    const result = calculateRequirements(items, [recipeWithRatio], ingredients);
    const lye = result.find((r) => r.ingredientId === "ing-lye")!;

    // Assert — 오일 300g * 0.5 + 가성소다 60g = 210g
    expect(lye.required).toBe(210);
  });
});

// ─── recommendMolds ───────────────────────────────────────────────────────────

describe("recommendMolds", () => {
  it("should return empty array when mold list is empty", () => {
    // Act & Assert
    expect(recommendMolds(500, [])).toHaveLength(0);
  });

  it("should return empty array when batchSize is 0 or negative", () => {
    // Act & Assert
    expect(recommendMolds(0, molds)).toHaveLength(0);
    expect(recommendMolds(-100, molds)).toHaveLength(0);
  });

  it("should prefer fitting mold (remainder >= 0) over overflowing mold", () => {
    // Arrange — 배치 500g, 직사각형 6구(540g)는 딱 맞음, 원형 4구(320g)는 부족
    // Act
    const result = recommendMolds(500, molds);
    const fitting = result.filter((r) => r.remainder >= 0);
    const overflowing = result.filter((r) => r.remainder < 0);

    // Assert — fitting이 overflowing보다 앞에 위치
    if (fitting.length > 0 && overflowing.length > 0) {
      const lastFittingIdx = result.findLastIndex((r) => r.remainder >= 0);
      const firstOverflowingIdx = result.findIndex((r) => r.remainder < 0);
      expect(lastFittingIdx).toBeLessThan(firstOverflowingIdx);
    }
  });

  it("should sort fitting molds by remainder ascending (least waste first)", () => {
    // Act
    const result = recommendMolds(500, molds);
    const fitting = result.filter((r) => r.remainder >= 0);

    // Assert — 잔량이 적을수록 앞에
    for (let i = 1; i < fitting.length; i++) {
      expect(fitting[i - 1].remainder).toBeLessThanOrEqual(fitting[i].remainder);
    }
  });

  it("should try mold combinations when no single mold fits", () => {
    // Arrange — 배치 400g, 단일 몰드 중 320g짜리만 있으면 부족 → 조합 필요
    const twoSmallMolds: Mold[] = [
      { ...molds[1], totalCapacity: 250 }, // 250g
      { ...molds[2], totalCapacity: 200 }, // 200g
    ];

    // Act
    const result = recommendMolds(400, twoSmallMolds);
    const fitting = result.find((r) => r.remainder >= 0);

    // Assert — 250 + 200 = 450 ≥ 400 조합 발견
    expect(fitting).toBeDefined();
    expect(fitting!.molds).toHaveLength(2);
    expect(fitting!.remainder).toBe(50); // 450 - 400
  });

  it("should calculate fillRatio correctly", () => {
    // Arrange
    const batchSize = 500;

    // Act
    const result = recommendMolds(batchSize, molds);

    // Assert — fillRatio = totalCapacity / batchSize
    for (const rec of result) {
      const totalCapacity = rec.molds.reduce((sum, m) => sum + m.totalCapacity, 0);
      expect(rec.fillRatio).toBeCloseTo(totalCapacity / batchSize, 5);
    }
  });
});

// ─── filterMoldsForRecipe ─────────────────────────────────────────────────────

describe("filterMoldsForRecipe", () => {
  // 픽스처: molds는 beforeEach에서 세팅된 전역 변수 재사용
  // mold-large: weightPerCell=90, cellCount=6 → 최대 540g
  // mold-medium: weightPerCell=80, cellCount=4 → 최대 320g
  // mold-small:  weightPerCell=60, cellCount=2 → 최대 120g

  it("should return empty array when mold list is empty", () => {
    // Act & Assert
    expect(filterMoldsForRecipe(500, [], {})).toHaveLength(0);
  });

  it("should include mold when ceil(batchSize/weightPerCell) <= cellCount", () => {
    // Arrange — 500g / 90g = ceil(5.56) = 6칸, mold-large cellCount=6 → 딱 맞음
    const availableCells = {};

    // Act
    const result = filterMoldsForRecipe(500, molds, availableCells);

    // Assert — mold-large 포함
    const ids = result.flatMap((r) => r.molds.map((m) => m.id));
    expect(ids).toContain("mold-large");
  });

  it("should exclude mold when ceil(batchSize/weightPerCell) > cellCount", () => {
    // Arrange — 550g / 80g = ceil(6.875) = 7칸, mold-medium cellCount=4 → 부족
    // 550g / 90g = ceil(6.11) = 7칸, mold-large cellCount=6 → 부족
    // 550g / 60g = ceil(9.17) = 10칸, mold-small cellCount=2 → 부족
    const availableCells = {};

    // Act
    const result = filterMoldsForRecipe(550, molds, availableCells);
    const singleMoldResults = result.filter((r) => r.molds.length === 1);

    // Assert — 단일 몰드 중 맞는 것 없음
    expect(singleMoldResults).toHaveLength(0);
  });

  it("should sort single molds by weightPerCell descending", () => {
    // Arrange — 150g: mold-large(ceil=2), mold-medium(ceil=2) 모두 맞음
    const availableCells = {};

    // Act
    const result = filterMoldsForRecipe(150, molds, availableCells);
    const singleMolds = result.filter((r) => r.molds.length === 1);

    // Assert — weightPerCell 내림차순
    for (let i = 1; i < singleMolds.length; i++) {
      expect(singleMolds[i - 1].molds[0].weightPerCell).toBeGreaterThanOrEqual(
        singleMolds[i].molds[0].weightPerCell
      );
    }
  });

  it("should calculate cellsNeeded correctly in cellsMap", () => {
    // Arrange — 450g / 90g = ceil(5) = 5칸
    const availableCells = {};

    // Act
    const result = filterMoldsForRecipe(450, molds, availableCells);
    const largeMoldOption = result.find(
      (r) => r.molds.length === 1 && r.molds[0].id === "mold-large"
    );

    // Assert
    expect(largeMoldOption).toBeDefined();
    expect(largeMoldOption!.cellsMap["mold-large"]).toBe(5);
  });

  it("should mark mold as available when cellsNeeded <= availableCells", () => {
    // Arrange — mold-large에 칸 6개 남아있고 5칸 필요
    const availableCells = { "mold-large": 6 };

    // Act
    const result = filterMoldsForRecipe(450, molds, availableCells);
    const largeMoldOption = result.find(
      (r) => r.molds.length === 1 && r.molds[0].id === "mold-large"
    );

    // Assert
    expect(largeMoldOption!.isAvailable).toBe(true);
  });

  it("should mark mold as unavailable when availableCells is insufficient", () => {
    // Arrange — mold-large에 칸 3개만 남고 5칸 필요
    const availableCells = { "mold-large": 3 };

    // Act
    const result = filterMoldsForRecipe(450, molds, availableCells);
    const largeMoldOption = result.find(
      (r) => r.molds.length === 1 && r.molds[0].id === "mold-large"
    );

    // Assert
    expect(largeMoldOption!.isAvailable).toBe(false);
  });

  it("should use mold.cellCount as default when availableCells entry is missing", () => {
    // Arrange — availableCells에 mold-large 항목 없음 → cellCount(6) 기본값 사용
    // 450g / 90g = 5칸 필요, 기본값 6칸 → available
    const availableCells = {};

    // Act
    const result = filterMoldsForRecipe(450, molds, availableCells);
    const largeMoldOption = result.find(
      (r) => r.molds.length === 1 && r.molds[0].id === "mold-large"
    );

    // Assert
    expect(largeMoldOption!.isAvailable).toBe(true);
  });

  it("should return combinations only when no single mold fits", () => {
    // Arrange — 단일 몰드로 담기 불가능한 용량 (550g)
    // mold-large: ceil(550/90)=7 > 6, mold-medium: ceil(550/80)=7 > 4, mold-small: ceil(550/60)=10 > 2
    const availableCells = {};

    // Act
    const result = filterMoldsForRecipe(550, molds, availableCells);

    // Assert — 결과가 있다면 모두 조합
    if (result.length > 0) {
      expect(result.every((r) => r.molds.length > 1)).toBe(true);
    }
  });

  it("should not return combinations when a single mold fits", () => {
    // Arrange — 150g는 여러 단일 몰드가 담을 수 있음
    const availableCells = {};

    // Act
    const result = filterMoldsForRecipe(150, molds, availableCells);

    // Assert — 조합 없음
    expect(result.every((r) => r.molds.length === 1)).toBe(true);
  });

  it("should build 2-mold combination: first fills completely, second handles remainder", () => {
    // Arrange — 단일 몰드로 불가능한 경우 세팅
    // mold-large(90g×6=540g 최대), mold-medium(80g×4=320g 최대)으로 550g 처리
    // → 단일 불가. 조합: large 전체(540g) + medium으로 나머지(10g → ceil(10/80)=1칸)
    const twoMolds: Mold[] = [
      {
        id: "mold-a",
        name: "A몰드",
        shape: "rectangle",
        weightPerCell: 90,
        cellCount: 5,
        totalCapacity: 450,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      },
      {
        id: "mold-b",
        name: "B몰드",
        shape: "rectangle",
        weightPerCell: 60,
        cellCount: 4,
        totalCapacity: 240,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      },
    ];
    // batchSize=500: A단일=ceil(500/90)=6>5 불가, B단일=ceil(500/60)=9>4 불가
    // 조합: A전체(5칸×90=450g) + 나머지50g → B ceil(50/60)=1칸
    const availableCells = {};

    // Act
    const result = filterMoldsForRecipe(500, twoMolds, availableCells);
    const combo = result.find((r) => r.molds.length === 2);

    // Assert
    expect(combo).toBeDefined();
    expect(combo!.cellsMap["mold-a"]).toBe(5); // first 전체
    expect(combo!.cellsMap["mold-b"]).toBe(1); // ceil(50/60)=1
  });

  it("should cap combinations at 3 results", () => {
    // Arrange — 조합만 나오는 케이스: 단일로 불가능한 큰 배치
    // 여러 조합이 생길 수 있는 몰드 세트
    const manyMolds: Mold[] = [
      { id: "m1", name: "M1", shape: "rectangle", weightPerCell: 90, cellCount: 3, totalCapacity: 270, createdAt: "2024-01-01", updatedAt: "2024-01-01" },
      { id: "m2", name: "M2", shape: "rectangle", weightPerCell: 85, cellCount: 3, totalCapacity: 255, createdAt: "2024-01-01", updatedAt: "2024-01-01" },
      { id: "m3", name: "M3", shape: "rectangle", weightPerCell: 80, cellCount: 3, totalCapacity: 240, createdAt: "2024-01-01", updatedAt: "2024-01-01" },
      { id: "m4", name: "M4", shape: "rectangle", weightPerCell: 70, cellCount: 3, totalCapacity: 210, createdAt: "2024-01-01", updatedAt: "2024-01-01" },
    ];
    // batchSize=400: 단일 max=270 < 400 → 모두 조합만 가능
    const availableCells = {};

    // Act
    const result = filterMoldsForRecipe(400, manyMolds, availableCells);

    // Assert
    expect(result.length).toBeLessThanOrEqual(3);
  });

  it("should mark combo as unavailable when one mold has insufficient cells", () => {
    // Arrange — 조합만 나오는 케이스에서 first 몰드 잔여 칸 부족
    const twoMolds: Mold[] = [
      {
        id: "mold-a",
        name: "A몰드",
        shape: "rectangle",
        weightPerCell: 90,
        cellCount: 5,
        totalCapacity: 450,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      },
      {
        id: "mold-b",
        name: "B몰드",
        shape: "rectangle",
        weightPerCell: 60,
        cellCount: 4,
        totalCapacity: 240,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      },
    ];
    // mold-a 잔여 2칸만 있고 조합은 5칸 전체 필요 → 불가
    const availableCells = { "mold-a": 2 };

    // Act
    const result = filterMoldsForRecipe(500, twoMolds, availableCells);
    const combo = result.find((r) => r.molds.length === 2);

    // Assert
    expect(combo?.isAvailable).toBe(false);
  });
});
