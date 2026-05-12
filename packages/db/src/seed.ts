/**
 * 샘플 레시피 시드 스크립트
 * 실행: DATABASE_URL="..." npm run seed
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const now = new Date().toISOString();
const uuid = () => crypto.randomUUID();

// ─── 재료 데이터 ──────────────────────────────────────────────────────────────

const INGREDIENTS = [
  // 비누베이스
  { key: "base_cica_acid",   name: "병풀 약산성 비누베이스",      category: "soap_base",     unit: "g"  },
  { key: "base_hydro_clear", name: "하이드로 투명 비누베이스",    category: "soap_base",     unit: "g"  },
  { key: "base_crystal",     name: "크리스털 투명 비누베이스",    category: "soap_base",     unit: "g"  },
  // 분말류
  { key: "powder_cica",      name: "병풀분말",                    category: "powder",        unit: "g"  },
  { key: "powder_msm",       name: "MSM (유황)",                  category: "powder",        unit: "g"  },
  { key: "powder_allantoin", name: "알란토인분말",                category: "powder",        unit: "g"  },
  { key: "powder_calamine",  name: "칼라민파우더",                category: "powder",        unit: "g"  },
  { key: "powder_jeju",      name: "제주화산송이분말",            category: "powder",        unit: "g"  },
  { key: "powder_yeast",     name: "맥주효모분말",                category: "powder",        unit: "g"  },
  // 첨가물
  { key: "add_vitE",         name: "비타민E",                     category: "additive",      unit: "g"  },
  { key: "add_panthenol",    name: "판테놀",                      category: "additive",      unit: "g"  },
  { key: "add_niacinamide",  name: "나이아신아마이드",            category: "additive",      unit: "g"  },
  { key: "add_trehalose",    name: "트레할로스",                  category: "additive",      unit: "g"  },
  { key: "add_gold",         name: "24K 금설",                    category: "additive",      unit: "g"  },
  { key: "add_glycerin",     name: "식물성 글리세린",             category: "additive",      unit: "g"  },
  { key: "add_menthol",      name: "멘톨",                        category: "additive",      unit: "g"  },
  { key: "add_glycerin_veg", name: "글리세린",                    category: "additive",      unit: "g"  },
  // 에센셜오일 / 블렌딩오일
  { key: "eo_bebebo",        name: "베베보 블렌딩오일",           category: "essential_oil", unit: "ml" },
  { key: "eo_bergamot",      name: "버가못 에센셜오일",           category: "essential_oil", unit: "ml" },
  { key: "eo_mintcool",      name: "민트쿨 블렌딩오일",           category: "essential_oil", unit: "ml" },
  { key: "eo_lemon",         name: "레몬 에센셜오일",             category: "essential_oil", unit: "ml" },
  { key: "eo_cypress",       name: "씨파러스 에센셜오일",         category: "essential_oil", unit: "ml" },
  { key: "eo_lavender",      name: "라벤더 에센셜오일",           category: "essential_oil", unit: "ml" },
  { key: "eo_cedarwood",     name: "시더우드 블렌딩오일",         category: "essential_oil", unit: "ml" },
  // 색소
  { key: "color_cochineal",  name: "코치닐",                      category: "colorant",      unit: "g"  },
  { key: "color_skyblue",    name: "고농축 식용색소 (스카이블루)", category: "colorant",      unit: "g"  },
] as const;

type IngredientKey = typeof INGREDIENTS[number]["key"];

type RecipeIngredientInput = {
  ingredientKey: IngredientKey;
  fixedAmount?: number;
  amountMin?: number;
  amountMax?: number;
  amountNote?: string;
  isOptional?: boolean;
  memo?: string;
};

type SubstituteInput = {
  originalKey: IngredientKey;
  substituteKey: IngredientKey;
  memo?: string;
};

type VariationInput = {
  label: string;
  description?: string;
  ingredients: RecipeIngredientInput[];
};

type RecipeData = {
  name: string;
  catchphrase?: string;
  processType: string;
  productType: string;
  batchSize: number;
  difficulty?: string;
  timeRequired?: string;
  skinType?: string[];
  needsHeating: boolean;
  storageLocation?: string;
  tools?: string[];
  memo?: string;
  ingredients: RecipeIngredientInput[];
  substitutes?: SubstituteInput[];
  variations?: VariationInput[];
};

// ─── 메인 ─────────────────────────────────────────────────────────────────────

async function main() {
  // 재료 삽입
  const idMap: Record<string, string> = {};
  console.log("재료 처리 중...");

  for (const ing of INGREDIENTS) {
    const existing = await db
      .select({ id: schema.ingredients.id })
      .from(schema.ingredients)
      .where(eq(schema.ingredients.name, ing.name));

    if (existing[0]) {
      idMap[ing.key] = existing[0].id;
    } else {
      const id = uuid();
      await db.insert(schema.ingredients).values({
        id,
        name: ing.name,
        category: ing.category,
        unit: ing.unit,
        stock: 0,
        memo: null,
        createdAt: now,
        updatedAt: now,
      });
      idMap[ing.key] = id;
    }
  }
  console.log(`✓ 재료 ${INGREDIENTS.length}개 처리 완료`);

  // idMap 기반 재료 ID 조회 헬퍼
  const ing = (key: IngredientKey) => idMap[key];

  // 레시피 삽입 함수
  async function insertRecipe(recipe: RecipeData) {
    const existing = await db
      .select({ id: schema.recipes.id })
      .from(schema.recipes)
      .where(eq(schema.recipes.name, recipe.name));

    if (existing[0]) {
      console.log(`  - 스킵 (이미 존재): ${recipe.name}`);
      return;
    }

    const recipeId = uuid();

    await db.insert(schema.recipes).values({
      id: recipeId,
      name: recipe.name,
      catchphrase: recipe.catchphrase ?? null,
      processType: recipe.processType,
      productType: recipe.productType,
      moldId: null,
      batchSize: recipe.batchSize,
      difficulty: recipe.difficulty ?? null,
      timeRequired: recipe.timeRequired ?? null,
      skinType: recipe.skinType ? JSON.stringify(recipe.skinType) : null,
      needsHeating: recipe.needsHeating,
      storageLocation: recipe.storageLocation ?? null,
      tools: recipe.tools ? JSON.stringify(recipe.tools) : null,
      memo: recipe.memo ?? null,
      createdAt: now,
      updatedAt: now,
    });

    if (recipe.ingredients.length > 0) {
      await db.insert(schema.recipeIngredients).values(
        recipe.ingredients.map((item, idx) => ({
          id: uuid(),
          recipeId,
          ingredientId: ing(item.ingredientKey),
          fixedAmount: item.fixedAmount ?? null,
          amountMin: item.amountMin ?? null,
          amountMax: item.amountMax ?? null,
          ratio: null,
          amountNote: item.amountNote ?? null,
          isOptional: item.isOptional ?? false,
          memo: item.memo ?? null,
          sortOrder: idx,
        }))
      );
    }

    if (recipe.substitutes && recipe.substitutes.length > 0) {
      await db.insert(schema.recipeSubstitutes).values(
        recipe.substitutes.map((sub) => ({
          id: uuid(),
          recipeId,
          originalIngredientId: ing(sub.originalKey),
          substituteIngredientId: ing(sub.substituteKey),
          substituteRatio: null,
          memo: sub.memo ?? null,
        }))
      );
    }

    if (recipe.variations && recipe.variations.length > 0) {
      for (const variation of recipe.variations) {
        const varId = uuid();
        await db.insert(schema.recipeVariations).values({
          id: varId,
          recipeId,
          label: variation.label,
          description: variation.description ?? null,
        });

        if (variation.ingredients.length > 0) {
          await db.insert(schema.recipeVariationIngredients).values(
            variation.ingredients.map((item, idx) => ({
              id: uuid(),
              variationId: varId,
              ingredientId: ing(item.ingredientKey),
              fixedAmount: item.fixedAmount ?? null,
              amountMin: item.amountMin ?? null,
              amountMax: item.amountMax ?? null,
              amountNote: item.amountNote ?? null,
              isOptional: item.isOptional ?? false,
              memo: item.memo ?? null,
              sortOrder: idx,
            }))
          );
        }
      }
    }

    console.log(`  ✓ ${recipe.name}`);
  }

  // ─── 레시피 데이터 ──────────────────────────────────────────────────────────

  console.log("\n레시피 삽입 중...");

  await insertRecipe({
    name: "병풀 더블 약산성비누",
    catchphrase: "뾰드득 금지, 수분남기는 세안 ~",
    processType: "mp",
    productType: "비누",
    batchSize: 540,
    difficulty: "medium",
    timeRequired: "1시간",
    skinType: ["모든 피부"],
    needsHeating: false,
    storageLocation: "상온",
    tools: ["저울", "아로마베이스70 (기포제거용)", "비누칼", "스텐비커 1L", "미니계량컵", "계량스푼", "몰드 6구"],
    ingredients: [
      { ingredientKey: "base_cica_acid",  fixedAmount: 500, memo: "약산성비누베이스" },
      { ingredientKey: "powder_cica",     fixedAmount: 5,   memo: "호랑이풀" },
      { ingredientKey: "add_vitE",        fixedAmount: 5,   memo: "항산화, 고보습" },
      { ingredientKey: "add_panthenol",   fixedAmount: 25,  memo: "보습" },
      { ingredientKey: "eo_bebebo",       fixedAmount: 5,   memo: "로먼 캐모마일, 라벤더, 만다린 복합 블렌딩오일" },
    ],
    substitutes: [
      { originalKey: "add_panthenol", substituteKey: "add_glycerin_veg", memo: "글리세린, 히아루론산 등으로 대체 가능" },
      { originalKey: "eo_bebebo",     substituteKey: "eo_lavender",      memo: "원하는 에센셜오일로 대체 가능" },
    ],
  });

  await insertRecipe({
    name: "칼라민 약산성비누",
    catchphrase: "화난 피부 토닥 토닥 ~",
    processType: "mp",
    productType: "비누",
    batchSize: 400,
    difficulty: "medium",
    timeRequired: "1시간",
    skinType: ["모든 피부"],
    needsHeating: false,
    storageLocation: "상온",
    tools: ["저울", "아로마베이스70 (기포제거용)", "비누칼", "스텐비커 1L", "미니계량컵", "계량스푼", "하트4구 민무늬 몰드"],
    ingredients: [
      { ingredientKey: "base_cica_acid",          fixedAmount: 380, memo: "약산성비누베이스" },
      { ingredientKey: "powder_msm",       fixedAmount: 8,   memo: "분말상, 식이유황" },
      { ingredientKey: "powder_allantoin", fixedAmount: 1,   memo: "컴프리뿌리추출, 진정" },
      { ingredientKey: "add_trehalose",    fixedAmount: 4,   memo: "보습, 탈취" },
      { ingredientKey: "powder_calamine",  fixedAmount: 4,   memo: "산화아연/산화철 구성, 진정, 완화" },
      { ingredientKey: "eo_bebebo",        fixedAmount: 3,   memo: "로먼 캐모마일, 라벤더, 만다린 복합" },
      { ingredientKey: "color_cochineal",    amountNote: "약간", memo: "조금씩 넣으며 원하는 색상 조절" },
    ],
    substitutes: [
      { originalKey: "eo_bebebo", substituteKey: "eo_lavender", memo: "라벤더 에센셜오일로 대체 가능" },
    ],
  });

  await insertRecipe({
    name: "24K 미백비누",
    catchphrase: "소중하고 귀한 분께 드리세요. 누구?나!",
    processType: "mp",
    productType: "비누",
    batchSize: 400,
    difficulty: "low",
    timeRequired: "15분",
    skinType: ["모든 피부"],
    needsHeating: true,
    storageLocation: "상온",
    tools: ["아로마베이스70 (기포제거용)", "1L 스마트내열유리용기", "비누칼", "저울", "계량스푼", "하트 4구 몰드"],
    ingredients: [
      { ingredientKey: "add_gold",        fixedAmount: 0.02, amountNote: "내외", memo: "24k금가루 95%이상 99.9%, 피부정화/탄탄/보습" },
      { ingredientKey: "base_cica_acid",  fixedAmount: 380,  memo: "병풀추출물, 약산성" },
      { ingredientKey: "powder_msm",      fixedAmount: 4,    memo: "소나무에서 재취, 트러블 피부진정" },
      { ingredientKey: "add_niacinamide", fixedAmount: 8,    memo: "비타민B3, 식약처 고시 미백원료" },
      { ingredientKey: "add_vitE",        fixedAmount: 4,    memo: "항산화, 고보습" },
      { ingredientKey: "eo_bergamot",     fixedAmount: 4,    memo: "감귤껍질오일, 상큼, 청정" },
    ],
    substitutes: [
      { originalKey: "eo_bergamot", substituteKey: "eo_lavender", memo: "원하는 에센셜오일로 대체 가능" },
    ],
  });

  await insertRecipe({
    name: "맥주효모 샴푸바",
    catchphrase: "탈모걱정 비어!!!",
    processType: "mp",
    productType: "샴푸바",
    batchSize: 200,
    difficulty: "medium",
    timeRequired: "1시간",
    skinType: ["모든 피부"],
    needsHeating: true,
    storageLocation: "상온",
    tools: ["아로마베이스70 (기포제거용)", "비누칼", "스텐비커 1L", "미니계량컵", "계량스푼", "전통나비1구 몰드 2개"],
    ingredients: [
      { ingredientKey: "base_cica_acid", fixedAmount: 180, memo: "약산성 비누베이스, 건강한 두피 모발 pH" },
      { ingredientKey: "add_panthenol",      fixedAmount: 10,  memo: "비타민B5 고급 보습, 진정" },
      { ingredientKey: "add_vitE",           fixedAmount: 2,   memo: "항산화, 고보습" },
      { ingredientKey: "powder_yeast",       amountMin: 2, amountMax: 3, memo: "다량의 단백질, 아미노산 함유, 모발두피 건강" },
      { ingredientKey: "eo_mintcool",        amountMin: 2, amountMax: 4, memo: "페퍼민트EO, 로즈마리EO, 라벤더EO 복합" },
    ],
    substitutes: [
      { originalKey: "add_panthenol", substituteKey: "add_glycerin_veg", memo: "글리세린으로 대체 가능" },
      { originalKey: "eo_mintcool",   substituteKey: "eo_cedarwood",     memo: "시더우드 블렌딩오일로 대체 가능" },
    ],
  });

  await insertRecipe({
    name: "제주화산송이 비누",
    catchphrase: "모공 속 노폐물을 쏙 빼주는",
    processType: "mp",
    productType: "비누",
    batchSize: 176,
    difficulty: "medium",
    timeRequired: "30분",
    skinType: ["모든 피부"],
    needsHeating: true,
    storageLocation: "한 달",
    tools: ["체", "비누칼", "미니계량컵 2개", "동주걱 2개", "계량스푼", "스탠다드 몰드 2개"],
    ingredients: [
      { ingredientKey: "base_hydro_clear", fixedAmount: 160, memo: "투명 비누" },
      { ingredientKey: "add_glycerin",     fixedAmount: 5,   memo: "보습제" },
      { ingredientKey: "powder_allantoin", fixedAmount: 1,   memo: "피부진정, 영양공급" },
      { ingredientKey: "powder_jeju",      fixedAmount: 6,   memo: "화산석 멀티 기능성 성분, 흡착, 진정" },
      { ingredientKey: "eo_lemon",         fixedAmount: 2,   amountNote: "40방울", memo: "레몬껍질오일" },
      { ingredientKey: "eo_cypress",       fixedAmount: 2,   amountNote: "40방울", memo: "숙성/묵은것을 씻음" },
    ],
    substitutes: [
      { originalKey: "base_hydro_clear", substituteKey: "base_crystal", memo: "화이트 하이드로비누베이스로 대체 가능" },
      { originalKey: "eo_lemon",         substituteKey: "eo_lavender",  memo: "라벤더EO로 대체 가능" },
      { originalKey: "eo_cypress",       substituteKey: "eo_mintcool",  memo: "페퍼민트EO로 대체 가능" },
    ],
    variations: [
      {
        label: "얀한 갈색",
        description: "화산송이분말 양을 줄여 연한 갈색으로",
        ingredients: [
          { ingredientKey: "base_hydro_clear", fixedAmount: 160 },
          { ingredientKey: "add_glycerin",     fixedAmount: 5 },
          { ingredientKey: "powder_allantoin", fixedAmount: 1 },
          { ingredientKey: "powder_jeju",      fixedAmount: 3, memo: "분말 줄여서 연한 색" },
          { ingredientKey: "eo_lemon",         fixedAmount: 2, amountNote: "40방울" },
          { ingredientKey: "eo_cypress",       fixedAmount: 2, amountNote: "40방울" },
        ],
      },
    ],
  });

  await insertRecipe({
    name: "멘톨마블비누",
    catchphrase: "So Coooool~!",
    processType: "mp",
    productType: "비누",
    batchSize: 802,
    difficulty: "medium",
    timeRequired: "40분",
    skinType: ["모든 피부"],
    needsHeating: true,
    storageLocation: "상온",
    tools: ["아로마베이스70 (수분B)", "저울", "1000ml 용기 1개", "5ml 미량스푼", "비누칼 2개", "계량스푼", "조이컵", "동주걱 2개"],
    ingredients: [
      { ingredientKey: "base_crystal",         fixedAmount: 780, memo: "투명 비누" },
      { ingredientKey: "powder_msm",           fixedAmount: 4,   memo: "유기활황, 피부탄탄, 트러블완화" },
      { ingredientKey: "add_menthol",          amountMin: 8, amountMax: 24, memo: "박하결정, 1~3% 가능, 2% 추천" },
      { ingredientKey: "eo_lavender",          fixedAmount: 10,  memo: "재은 업 오일" },
      { ingredientKey: "color_skyblue", amountMin: 1, amountMax: 1, amountNote: "색상 보며 조절" },
    ],
    substitutes: [
      { originalKey: "color_skyblue", substituteKey: "color_cochineal", memo: "화이트 색소로 대체 가능" },
    ],
    variations: [
      {
        label: "멘톨 없는 마블비누",
        description: "멘톨 제외한 기본 마블 베이스",
        ingredients: [
          { ingredientKey: "base_crystal",  fixedAmount: 780 },
          { ingredientKey: "powder_msm",    fixedAmount: 4 },
          { ingredientKey: "eo_lavender",   fixedAmount: 10 },
          { ingredientKey: "color_skyblue", amountMin: 1, amountMax: 1, amountNote: "색상 보며 조절" },
        ],
      },
    ],
  });

  console.log("\n✅ 시드 완료!");
}

main().catch(console.error);
