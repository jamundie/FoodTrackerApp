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
  label: string;      // Full label shown in the modal picker
  shortLabel: string; // Abbreviated label shown on the trigger button
  ml: number;
};

export const VOLUME_PRESETS: readonly VolumePreset[] = [
  { id: "glass",         label: "1 Glass",              shortLabel: "Glass",    ml: 250 },
  { id: "pint",          label: "1 Pint",               shortLabel: "Pint",     ml: 568 },
  { id: "wine_small",    label: "Small Wine Glass",      shortLabel: "Sm Wine",  ml: 125 },
  { id: "wine_standard", label: "Standard Wine Glass",   shortLabel: "Std Wine", ml: 175 },
  { id: "wine_large",    label: "Large Wine Glass",      shortLabel: "Lg Wine",  ml: 250 },
  { id: "cup_small",     label: "Small Cup",             shortLabel: "Sm Cup",   ml: 150 },
  { id: "cup_regular",   label: "Regular Cup",           shortLabel: "Reg Cup",  ml: 240 },
  { id: "cup_large",     label: "Large Cup",             shortLabel: "Lg Cup",   ml: 350 },
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

// ── Bowel movement tracking ───────────────────────────────────

/**
 * Bristol Stool Scale types 1–7.
 * 1 = separate hard lumps (severe constipation)
 * 2 = lumpy sausage (mild constipation)
 * 3 = cracked sausage (normal)
 * 4 = smooth soft sausage (normal/ideal)
 * 5 = soft blobs (lacking fibre)
 * 6 = fluffy ragged pieces (mild diarrhoea)
 * 7 = watery, no solids (severe diarrhoea)
 */
export type BristolType = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type BowelUrgency = 'none' | 'mild' | 'moderate' | 'urgent';

export type BowelEntry = {
  id: string;
  timestamp: string;          // ISO date-time
  falseAlarm: boolean;        // sensation to go but no movement
  bristolType?: BristolType;  // absent when falseAlarm is true
  urgency: BowelUrgency;
  hasBlood: boolean;          // always false when falseAlarm is true
  painLevel: number;          // 0–10 (0 = no pain)
  notes?: string;
  photoUri?: string;          // storage path after upload; local file:// URI before
};

export const BRISTOL_DESCRIPTIONS: Record<BristolType, string> = {
  1: 'Type 1 — Separate hard lumps',
  2: 'Type 2 — Lumpy sausage',
  3: 'Type 3 — Cracked sausage',
  4: 'Type 4 — Smooth sausage (ideal)',
  5: 'Type 5 — Soft blobs',
  6: 'Type 6 — Fluffy, ragged',
  7: 'Type 7 — Watery',
};

export const BOWEL_URGENCY_LABELS: Record<BowelUrgency, string> = {
  none: 'None',
  mild: 'Mild',
  moderate: 'Moderate',
  urgent: 'Urgent',
};

export type TrackingData = {
  foodEntries: FoodEntry[];
  waterEntries: WaterEntry[];
  bowelEntries: BowelEntry[];
};

export type UserProfile = {
  displayName: string;
  age?: number;
  weightKg?: number;
  heightCm?: number;
  dailyWaterGoalMl?: number;
  defaultVolumePresetId: VolumePresetId;
};