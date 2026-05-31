/**
 * Shared ingredient types used across food and water tracking.
 * Extracted here because Ingredient, IngredientFormData, and Unit are
 * domain-neutral — they appear in food entries, water entries, and both
 * sets of form helpers.
 */

export type Unit = "g" | "ml" | "piece";

/**
 * Nutritional values per 100g (or per piece when unit is "piece").
 * Produced by Open Food Facts lookups and — in future — Gemini Vision analysis.
 * Both data sources write to this same shape; downstream calculation is identical
 * regardless of how NutritionData was populated.
 */
export type NutritionData = {
  caloriesPer100g: number;
  proteinPer100g?: number;
  carbsPer100g?:   number;
  fatPer100g?:     number;
  fiberPer100g?:   number;
  sugarPer100g?:   number;
  saltPer100g?:    number;
};

export type Ingredient = {
  id: string;
  name: string;             // "Minced beef", "Cheese", etc.
  amount: number;           // e.g. 100
  unit: Unit;
  nutritionData?: NutritionData;       // full profile from OFF lookup or AI analysis
  caloriesPer100g?: number;            // convenience alias derived from nutritionData
  calculatedCalories?: number;
  calculatedProtein?:  number;
  calculatedCarbs?:    number;
  calculatedFat?:      number;
  calculatedFiber?:    number;
};

// Shared form data type for ingredient inputs (food and water forms).
// String fields are kept as strings until validated and parsed on submit.
export type IngredientFormData = {
  name: string;
  amount: string;
  unit: Unit;
  // kcal per 100 g for g/ml units; kcal per piece for piece unit.
  // Kept for manual override when no lookup was performed.
  caloriesRef: string;
  // Macro overrides — populated from a lookup but remain editable
  proteinPer100g?: string;
  carbsPer100g?:   string;
  fatPer100g?:     string;
  fiberPer100g?:   string;
  // Tracks whether this row was populated by a nutrition lookup
  nutritionSource?: "manual" | "open_food_facts" | "gemini_vision";
};
