import { Ingredient, WaterEntry } from '../types/tracking';
import { WaterIngredientFormData } from '../components/WaterIngredientsForm';

/**
 * Calculates total volume from processed ingredients (for water-based drinks)
 */
export const calculateTotalVolume = (processedIngredients: Ingredient[]): number => {
  return processedIngredients.reduce((total, ingredient) => {
    // Only count liquid ingredients (ml) for total volume calculation
    if (ingredient.unit === "ml") {
      return total + ingredient.amount;
    }
    return total;
  }, 0);
};

/**
 * Processes raw water ingredient form data into proper Ingredient objects
 */
export const processWaterIngredients = (ingredients: WaterIngredientFormData[]): Ingredient[] => {
  const validIngredients = ingredients.filter(
    (ingredient) => ingredient.name.trim() && ingredient.amount.trim()
  );

  return validIngredients.map((ingredient, index) => {
    const amount = parseFloat(ingredient.amount) || 0;
    const caloriesPer100g = parseFloat(ingredient.caloriesPer100g) || undefined;

    let calculatedCalories: number | undefined;
    if (caloriesPer100g && amount > 0) {
      if (ingredient.unit === "g") {
        calculatedCalories = (amount * caloriesPer100g) / 100;
      } else if (ingredient.unit === "ml") {
        calculatedCalories = (amount * caloriesPer100g) / 100;
      } else if (ingredient.unit === "piece") {
        calculatedCalories = amount * caloriesPer100g;
      }
    }

    return {
      id: `${Date.now()}-${index}`,
      name: ingredient.name.trim(),
      amount,
      unit: ingredient.unit,
      caloriesPer100g,
      calculatedCalories,
    };
  });
};

/**
 * Creates a complete WaterEntry object from form data
 */
export const createWaterEntry = (
  entryName: string,
  timestamp: string,
  processedIngredients: Ingredient[]
): WaterEntry => {
  const totalVolume = calculateTotalVolume(processedIngredients);

  return {
    id: Date.now().toString(),
    entryName: entryName.trim(),
    timestamp,
    ingredients: processedIngredients,
    totalVolume: totalVolume > 0 ? totalVolume : undefined,
  };
};