import { describe, it, expect, beforeEach } from "vitest";
import { calculateRequirements, recommendMolds, calcTotalBatchSize } from "../calculate";
import type { Recipe, Ingredient, Mold } from "@soap-studio/types";
import type { SessionItem } from "@/stores/session";

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
      { recipeId: "r1", recipeName: "레시피A", batchSize: 500, scale: 1 },
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
      { recipeId: "r1", recipeName: "레시피A", batchSize: 500, scale },
    ];

    // Act
    const result = calcTotalBatchSize(items);

    // Assert
    expect(result).toBe(expected);
  });

  it("should sum batch sizes across multiple recipes", () => {
    // Arrange
    const items: SessionItem[] = [
      { recipeId: "r1", recipeName: "레시피A", batchSize: 500, scale: 1 },
      { recipeId: "r2", recipeName: "레시피B", batchSize: 300, scale: 2 },
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
      { recipeId: "no-such-recipe", recipeName: "없음", batchSize: 500, scale: 1 },
    ];

    // Act
    const result = calculateRequirements(items, [recipe], ingredients);

    // Assert
    expect(result).toHaveLength(0);
  });

  it("should mark ingredient as sufficient when stock >= required", () => {
    // Arrange
    const items: SessionItem[] = [
      { recipeId: "recipe-1", recipeName: "테스트 비누", batchSize: 500, scale: 1 },
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
      { recipeId: "recipe-1", recipeName: "테스트 비누", batchSize: 500, scale: 1 },
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
      { recipeId: "recipe-1", recipeName: "테스트 비누", batchSize: 500, scale: 2 },
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
      { recipeId: "recipe-1", recipeName: "테스트 비누", batchSize: 500, scale: 1 },
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
      { recipeId: "recipe-1", recipeName: "테스트 비누", batchSize: 500, scale: 1 },
      { recipeId: "recipe-1", recipeName: "테스트 비누", batchSize: 500, scale: 1 },
    ];

    // Act
    const result = calculateRequirements(items, [recipe], ingredients);
    const oil = result.find((r) => r.ingredientId === "ing-oil")!;

    // Assert
    expect(oil.required).toBe(600); // 300 * 2
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
