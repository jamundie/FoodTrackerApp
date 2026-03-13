export type FoodEntry = {
  id: string;
  mealName: string;          // "Lasagne"
  category: FoodCategory;    // Use the FoodCategory type instead of string
  timestamp: string;         // ISO date-time
  ingredients: Ingredient[]; // list of manually entered ingredients
  totalCalories?: number;    // optional: computed based on ingredients
  photoUri?: string;         // URI of the meal photo; used for future AI analysis
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

// Shared form data type for ingredient inputs (food and water forms)
export type IngredientFormData = {
  name: string;
  amount: string;
  unit: Unit;
  caloriesPer100g: string;
};

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

export type VolumePresetId =
  | "glass"
  | "pint"
  | "wine_small"
  | "wine_standard"
  | "wine_large"
  | "cup_small"
  | "cup_regular"
  | "cup_large";

export type VolumePreset = {
  id: VolumePresetId;
  label: string;
  ml: number;
};

export const VOLUME_PRESETS: readonly VolumePreset[] = [
  { id: "glass",         label: "1 Glass",              ml: 250 },
  { id: "pint",          label: "1 Pint",               ml: 568 },
  { id: "wine_small",    label: "Small Wine Glass",      ml: 125 },
  { id: "wine_standard", label: "Standard Wine Glass",   ml: 175 },
  { id: "wine_large",    label: "Large Wine Glass",      ml: 250 },
  { id: "cup_small",     label: "Small Cup",             ml: 150 },
  { id: "cup_regular",   label: "Regular Cup",           ml: 240 },
  { id: "cup_large",     label: "Large Cup",             ml: 350 },
] as const;

export type WaterEntry = {
  id: string;
  entryName: string;              // "Morning hydration", "Post-workout drink", etc.
  timestamp: string;              // ISO date-time
  ingredients: Ingredient[];      // optional: flavoring, supplements, etc.
  volumePresetId: VolumePresetId; // selected drink-size preset
  volumeMl: number;               // ml from the preset
  totalVolume?: number;           // preset ml + any ml ingredients
};

export type TrackingData = {
  foodEntries: FoodEntry[];
  waterEntries: WaterEntry[];
};

export type UserProfile = {
  displayName: string;
  age?: number;
  weightKg?: number;
  heightCm?: number;
  dailyWaterGoalMl?: number;
  defaultVolumePresetId: VolumePresetId;
};