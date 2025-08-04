export type FoodEntry = {
  id: string;
  mealName: string;          // "Lasagne"
  category: string;          // "Pasta", "Main Dish", etc.
  timestamp: string;         // ISO date-time
  ingredients: Ingredient[]; // list of manually entered ingredients
  totalCalories?: number;    // optional: computed based on ingredients
};

export type Ingredient = {
  id: string;
  name: string;            // "Minced beef", "Cheese", etc.
  amount: number;          // 100
  unit: "g" | "ml" | "piece"; // or a more extensible Unit enum
  caloriesPer100g?: number; // optional, if known
  calculatedCalories?: number; // amount * (caloriesPer100g / 100)
};

export type Unit = "g" | "ml" | "piece";

export type TrackingData = {
  waterIntake: number;
  foodEntries: FoodEntry[];
};