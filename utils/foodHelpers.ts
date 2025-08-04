import { Ingredient, FoodEntry, FoodCategory } from '../types/tracking';
import { IngredientFormData } from '../components/IngredientForm';

/**
 * Calculates total calories from processed ingredients
 */
export const calculateTotalCalories = (processedIngredients: Ingredient[]): number => {
  return processedIngredients.reduce((total, ingredient) => {
    return total + (ingredient.calculatedCalories || 0);
  }, 0);
};

/**
 * Processes raw ingredient form data into proper Ingredient objects
 */
export const processIngredients = (ingredients: IngredientFormData[]): Ingredient[] => {
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
 * Creates a complete FoodEntry object from form data
 */
export const createFoodEntry = (
  mealName: string,
  category: FoodCategory,
  timestamp: string,
  processedIngredients: Ingredient[]
): FoodEntry => {
  const totalCalories = calculateTotalCalories(processedIngredients);

  return {
    id: Date.now().toString(),
    mealName: mealName.trim(),
    category,
    timestamp,
    ingredients: processedIngredients,
    totalCalories: totalCalories > 0 ? totalCalories : undefined,
  };
};
