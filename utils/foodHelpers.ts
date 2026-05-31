import { Ingredient, IngredientFormData, NutritionData } from '../types/ingredient';
import { FoodEntry, FoodCategory } from '../types/tracking';
import { generateId } from './dateUtils';

export type MacroTotals = {
  calories: number;
  protein:  number;
  carbs:    number;
  fat:      number;
};

// ── Per-ingredient calculation ────────────────────────────────────────────────

/**
 * Compute the gram-based scaling factor for an ingredient.
 * For "piece" unit, caloriesPer100g is treated as calories-per-piece
 * (multiplier = amount, not amount/100).
 */
function scalingFactor(amount: number, unit: Ingredient['unit']): number {
  if (unit === 'piece') return amount;
  return amount / 100; // g and ml both use per-100g values
}

function calcNutrient(
  valuePer100g: number | undefined,
  factor: number,
): number | undefined {
  if (valuePer100g === undefined || valuePer100g === null) return undefined;
  return valuePer100g * factor;
}

// ── processIngredients ────────────────────────────────────────────────────────

/**
 * Converts raw form data into typed Ingredient objects with computed macro fields.
 * Accepts nutrition from a lookup (nutritionSource set) or manual entry.
 */
export const processIngredients = (ingredients: IngredientFormData[]): Ingredient[] => {
  const valid = ingredients.filter(
    (i) => i.name.trim() && i.amount.trim(),
  );

  return valid.map((i) => {
    const amount = parseFloat(i.amount) || 0;
    const factor = scalingFactor(amount, i.unit);

    // Build NutritionData — prefer manually entered values over the source
    // value when the user has overridden a field after a lookup.
    const manualCalories = parseFloat(i.caloriesPer100g) || undefined;
    const manualProtein  = i.proteinPer100g ? parseFloat(i.proteinPer100g) || undefined : undefined;
    const manualCarbs    = i.carbsPer100g   ? parseFloat(i.carbsPer100g)   || undefined : undefined;
    const manualFat      = i.fatPer100g     ? parseFloat(i.fatPer100g)     || undefined : undefined;

    // caloriesPer100g must be present for any calculation
    const kcalRef = manualCalories;
    if (!kcalRef || amount === 0) {
      return {
        id:   generateId(),
        name: i.name.trim(),
        amount,
        unit: i.unit,
        caloriesPer100g: kcalRef,
      };
    }

    const nutritionData: NutritionData = {
      caloriesPer100g: kcalRef,
      proteinPer100g:  manualProtein,
      carbsPer100g:    manualCarbs,
      fatPer100g:      manualFat,
    };

    return {
      id:   generateId(),
      name: i.name.trim(),
      amount,
      unit: i.unit,
      nutritionData,
      caloriesPer100g:    kcalRef,
      calculatedCalories: kcalRef * factor,
      calculatedProtein:  calcNutrient(manualProtein, factor),
      calculatedCarbs:    calcNutrient(manualCarbs,   factor),
      calculatedFat:      calcNutrient(manualFat,     factor),
    };
  });
};

// ── calculateTotals ───────────────────────────────────────────────────────────

/** Sum all macro totals across processed ingredients. */
export const calculateTotals = (ingredients: Ingredient[]): MacroTotals => {
  return ingredients.reduce<MacroTotals>(
    (acc, ing) => ({
      calories: acc.calories + (ing.calculatedCalories ?? 0),
      protein:  acc.protein  + (ing.calculatedProtein  ?? 0),
      carbs:    acc.carbs    + (ing.calculatedCarbs     ?? 0),
      fat:      acc.fat      + (ing.calculatedFat       ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
};

/**
 * Backward-compatible wrapper.
 * @deprecated Use calculateTotals() and read .calories instead.
 */
export const calculateTotalCalories = (ingredients: Ingredient[]): number =>
  calculateTotals(ingredients).calories;

// ── createFoodEntry ───────────────────────────────────────────────────────────

export const createFoodEntry = (
  mealName: string,
  category: FoodCategory,
  timestamp: string,
  processedIngredients: Ingredient[],
  photoUri?: string,
): FoodEntry => {
  const totals = calculateTotals(processedIngredients);

  return {
    id: generateId(),
    mealName: mealName.trim(),
    category,
    timestamp,
    ingredients: processedIngredients,
    totalCalories: totals.calories > 0 ? totals.calories : undefined,
    totalProtein:  totals.protein  > 0 ? totals.protein  : undefined,
    totalCarbs:    totals.carbs    > 0 ? totals.carbs    : undefined,
    totalFat:      totals.fat      > 0 ? totals.fat      : undefined,
    photoUri,
  };
};
