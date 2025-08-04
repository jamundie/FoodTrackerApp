export type FoodEntry = {
  id: string;
  mealName: string;          // "Lasagne"
  category: FoodCategory;    // Use the FoodCategory type instead of string
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

export type FoodCategory = 
  | "Breakfast"
  | "Lunch"
  | "Dinner"
  | "Snack"
  | "Main Dish"
  | "Side Dish"
  | "Appetizer"
  | "Dessert"
  | "Other";

export const FOOD_CATEGORIES: readonly FoodCategory[] = [
  "Breakfast",
  "Lunch", 
  "Dinner",
  "Snack",
  "Main Dish",
  "Side Dish",
  "Appetizer",
  "Dessert",
  "Other"
] as const;

export type TrackingData = {
  waterIntake: number;
  foodEntries: FoodEntry[];
};