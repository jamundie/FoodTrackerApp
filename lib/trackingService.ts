/**
 * Supabase persistence layer — all DB and storage operations.
 * TrackingContext calls these; components never import this directly.
 */
import { supabase } from '@/lib/supabase';
import { FoodEntry, WaterEntry, UserProfile, Ingredient } from '@/types/tracking';

// ── helpers ──────────────────────────────────────────────────

const toISOString = (ts: string) => new Date(ts).toISOString();

// ── user profile ─────────────────────────────────────────────

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;

  return {
    displayName: data.display_name ?? '',
    age: data.age ?? undefined,
    weightKg: data.weight_kg ?? undefined,
    heightCm: data.height_cm ?? undefined,
    dailyWaterGoalMl: data.daily_water_goal_ml ?? undefined,
    defaultVolumePresetId: data.default_volume_preset_id ?? 'glass',
  };
}

export async function upsertUserProfile(userId: string, profile: UserProfile): Promise<void> {
  const { error } = await supabase.from('user_profiles').upsert({
    id: userId,
    display_name: profile.displayName,
    age: profile.age ?? null,
    weight_kg: profile.weightKg ?? null,
    height_cm: profile.heightCm ?? null,
    daily_water_goal_ml: profile.dailyWaterGoalMl ?? null,
    default_volume_preset_id: profile.defaultVolumePresetId,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(`upsertUserProfile failed: ${error.message}`);
}

// ── food entries ─────────────────────────────────────────────

export async function fetchFoodEntries(userId: string): Promise<FoodEntry[]> {
  const { data: entries, error } = await supabase
    .from('food_entries')
    .select('*, food_ingredients(*)')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });

  if (error || !entries) return [];

  return entries.map((row) => ({
    id: row.id,
    mealName: row.meal_name,
    category: row.category,
    timestamp: row.timestamp,
    totalCalories: row.total_calories ?? undefined,
    // photo_storage_path stored here; resolved to signed URL by the hook that displays it
    photoUri: row.photo_storage_path ?? undefined,
    ingredients: (row.food_ingredients as any[]).map(mapIngredientRow),
  }));
}

export async function insertFoodEntry(userId: string, entry: FoodEntry): Promise<void> {
  const { error } = await supabase.from('food_entries').insert({
    id: entry.id,
    user_id: userId,
    meal_name: entry.mealName,
    category: entry.category,
    timestamp: toISOString(entry.timestamp),
    total_calories: entry.totalCalories ?? null,
    photo_storage_path: entry.photoUri ?? null,
  });
  if (error) throw new Error(`insertFoodEntry failed: ${error.message}`);

  if (entry.ingredients.length > 0) {
    const { error: ingError } = await supabase.from('food_ingredients').insert(
      entry.ingredients.map((ing) => mapFoodIngredientToRow(ing, userId, entry.id))
    );
    if (ingError) throw new Error(`insertFoodIngredients failed: ${ingError.message}`);
  }
}

// ── water entries ─────────────────────────────────────────────

export async function fetchWaterEntries(userId: string): Promise<WaterEntry[]> {
  const { data: entries, error } = await supabase
    .from('water_entries')
    .select('*, water_ingredients(*)')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });

  if (error || !entries) return [];

  return entries.map((row) => ({
    id: row.id,
    entryName: row.entry_name,
    timestamp: row.timestamp,
    volumePresetId: row.volume_preset_id,
    volumeMl: row.volume_ml,
    totalVolume: row.total_volume ?? undefined,
    ingredients: (row.water_ingredients as any[]).map(mapIngredientRow),
  }));
}

export async function insertWaterEntry(userId: string, entry: WaterEntry): Promise<void> {
  const { error } = await supabase.from('water_entries').insert({
    id: entry.id,
    user_id: userId,
    entry_name: entry.entryName,
    timestamp: toISOString(entry.timestamp),
    volume_preset_id: entry.volumePresetId,
    volume_ml: entry.volumeMl,
    total_volume: entry.totalVolume ?? null,
  });
  if (error) throw new Error(`insertWaterEntry failed: ${error.message}`);

  if (entry.ingredients.length > 0) {
    const { error: ingError } = await supabase.from('water_ingredients').insert(
      entry.ingredients.map((ing) => mapWaterIngredientToRow(ing, userId, entry.id))
    );
    if (ingError) throw new Error(`insertWaterIngredients failed: ${ingError.message}`);
  }
}

// ── photo storage ─────────────────────────────────────────────

/**
 * Upload a local photo URI to the private meal-photos bucket.
 * Returns the storage path (not a public URL).
 */
export async function uploadMealPhoto(
  userId: string,
  entryId: string,
  localUri: string
): Promise<string | null> {
  const ext = localUri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `${userId}/${entryId}.${ext}`;

  const response = await fetch(localUri);
  const blob = await response.blob();

  const { error } = await supabase.storage
    .from('meal-photos')
    .upload(path, blob, { contentType: `image/${ext}`, upsert: true });

  if (error) {
    console.warn('Photo upload failed:', error.message);
    return null;
  }
  return path;
}

/**
 * Generate a short-lived signed URL for a stored photo.
 * Expires in 60 seconds — enough to render on screen.
 */
export async function getPhotoSignedUrl(storagePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('meal-photos')
    .createSignedUrl(storagePath, 60);

  if (error || !data) return null;
  return data.signedUrl;
}

// ── private row mappers ───────────────────────────────────────

function mapIngredientRow(row: any): Ingredient {
  return {
    id: row.id,
    name: row.name,
    amount: Number(row.amount),
    unit: row.unit,
    caloriesPer100g: row.calories_per_100g ?? undefined,
    calculatedCalories: row.calculated_calories ?? undefined,
  };
}

function mapFoodIngredientToRow(ing: Ingredient, userId: string, entryId: string) {
  return {
    id: ing.id,
    food_entry_id: entryId,
    user_id: userId,
    name: ing.name,
    amount: ing.amount,
    unit: ing.unit,
    calories_per_100g: ing.caloriesPer100g ?? null,
    calculated_calories: ing.calculatedCalories ?? null,
  };
}

function mapWaterIngredientToRow(ing: Ingredient, userId: string, entryId: string) {
  return {
    id: ing.id,
    water_entry_id: entryId,
    user_id: userId,
    name: ing.name,
    amount: ing.amount,
    unit: ing.unit,
    calories_per_100g: ing.caloriesPer100g ?? null,
    calculated_calories: ing.calculatedCalories ?? null,
  };
}
