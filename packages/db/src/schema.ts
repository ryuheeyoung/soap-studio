import { pgTable, text, real, integer, boolean } from "drizzle-orm/pg-core";

export const ingredients = pgTable("ingredients", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  unit: text("unit").notNull(),
  stock: real("stock").notNull().default(0),
  memo: text("memo"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const molds = pgTable("molds", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  shape: text("shape").notNull(),
  weightPerCell: real("weight_per_cell").notNull(),
  cellCount: integer("cell_count").notNull(),
  totalCapacity: real("total_capacity").notNull(),
  memo: text("memo"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const recipes = pgTable("recipes", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  catchphrase: text("catchphrase"),
  processType: text("process_type").notNull(),
  productType: text("product_type").notNull(),
  moldId: text("mold_id"),
  batchSize: real("batch_size").notNull(),
  difficulty: text("difficulty"),
  timeRequired: text("time_required"),
  // JSON string (string[])
  skinType: text("skin_type"),
  needsHeating: boolean("needs_heating").notNull().default(false),
  storageLocation: text("storage_location"),
  // JSON string (string[])
  tools: text("tools"),
  memo: text("memo"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const recipeIngredients = pgTable("recipe_ingredients", {
  id: text("id").primaryKey(),
  recipeId: text("recipe_id").notNull(),
  ingredientId: text("ingredient_id").notNull(),
  fixedAmount: real("fixed_amount"),
  amountMin: real("amount_min"),
  amountMax: real("amount_max"),
  ratio: real("ratio"),
  amountNote: text("amount_note"),
  isOptional: boolean("is_optional").notNull().default(false),
  memo: text("memo"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const recipeSubstitutes = pgTable("recipe_substitutes", {
  id: text("id").primaryKey(),
  recipeId: text("recipe_id").notNull(),
  originalIngredientId: text("original_ingredient_id").notNull(),
  substituteIngredientId: text("substitute_ingredient_id").notNull(),
  substituteRatio: real("substitute_ratio"),
  memo: text("memo"),
});

export const recipeVariations = pgTable("recipe_variations", {
  id: text("id").primaryKey(),
  recipeId: text("recipe_id").notNull(),
  label: text("label").notNull(),
  description: text("description"),
});

export const recipeVariationIngredients = pgTable("recipe_variation_ingredients", {
  id: text("id").primaryKey(),
  variationId: text("variation_id").notNull(),
  ingredientId: text("ingredient_id").notNull(),
  fixedAmount: real("fixed_amount"),
  amountMin: real("amount_min"),
  amountMax: real("amount_max"),
  amountNote: text("amount_note"),
  isOptional: boolean("is_optional").notNull().default(false),
  memo: text("memo"),
  sortOrder: integer("sort_order").notNull().default(0),
});
