/**
 * Supabase persistence layer — all DB and storage operations.
 * TrackingContext calls these; components never import this directly.
 */
import { Buffer } from 'buffer';
import * as FileSystem from 'expo-file-system';
import { supabase } from '@/lib/supabase';
import { Ingredient } from '@/types/ingredient';
import { FoodEntry, WaterEntry, BowelEntry, BristolType, BowelUrgency, UserProfile } from '@/types/tracking';
import { generateId } from '@/utils/dateUtils';
import { encryptPhoto, decryptPhoto } from '@/utils/photoEncryption';

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
    dailyCalorieGoal: data.daily_calorie_goal ?? undefined,
    dailyProteinGoal: data.daily_protein_goal ?? undefined,
    dailyCarbGoal:    data.daily_carb_goal    ?? undefined,
    dailyFatGoal:     data.daily_fat_goal     ?? undefined,
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
    daily_calorie_goal: profile.dailyCalorieGoal ?? null,
    daily_protein_goal: profile.dailyProteinGoal ?? null,
    daily_carb_goal:    profile.dailyCarbGoal    ?? null,
    daily_fat_goal:     profile.dailyFatGoal     ?? null,
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
    totalProtein:  row.total_protein  ?? undefined,
    totalCarbs:    row.total_carbs    ?? undefined,
    totalFat:      row.total_fat      ?? undefined,
    totalFiber:    row.total_fiber    ?? undefined,
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
    total_protein:  entry.totalProtein  ?? null,
    total_carbs:    entry.totalCarbs    ?? null,
    total_fat:      entry.totalFat      ?? null,
    total_fiber:    entry.totalFiber    ?? null,
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

export async function deleteFoodEntry(userId: string, entryId: string): Promise<void> {
  // Delete child rows first (safety net in case CASCADE is not set)
  await supabase.from('food_ingredients').delete().eq('food_entry_id', entryId);
  const { error } = await supabase
    .from('food_entries')
    .delete()
    .eq('id', entryId)
    .eq('user_id', userId);
  if (error) throw new Error(`deleteFoodEntry failed: ${error.message}`);
}

export async function updateFoodEntry(userId: string, entry: FoodEntry): Promise<void> {
  const { error } = await supabase.from('food_entries').update({
    meal_name: entry.mealName,
    category: entry.category,
    timestamp: toISOString(entry.timestamp),
    total_calories: entry.totalCalories ?? null,
    total_protein:  entry.totalProtein  ?? null,
    total_carbs:    entry.totalCarbs    ?? null,
    total_fat:      entry.totalFat      ?? null,
    total_fiber:    entry.totalFiber    ?? null,
    photo_storage_path: entry.photoUri ?? null,
  }).eq('id', entry.id).eq('user_id', userId);
  if (error) throw new Error(`updateFoodEntry failed: ${error.message}`);

  // Replace ingredients: delete old, insert new
  await supabase.from('food_ingredients').delete().eq('food_entry_id', entry.id);
  if (entry.ingredients.length > 0) {
    const { error: ingError } = await supabase.from('food_ingredients').insert(
      entry.ingredients.map((ing) => mapFoodIngredientToRow(ing, userId, entry.id))
    );
    if (ingError) throw new Error(`updateFoodIngredients failed: ${ingError.message}`);
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

export async function deleteWaterEntry(userId: string, entryId: string): Promise<void> {
  await supabase.from('water_ingredients').delete().eq('water_entry_id', entryId);
  const { error } = await supabase
    .from('water_entries')
    .delete()
    .eq('id', entryId)
    .eq('user_id', userId);
  if (error) throw new Error(`deleteWaterEntry failed: ${error.message}`);
}

export async function updateWaterEntry(userId: string, entry: WaterEntry): Promise<void> {
  const { error } = await supabase.from('water_entries').update({
    entry_name: entry.entryName,
    timestamp: toISOString(entry.timestamp),
    volume_preset_id: entry.volumePresetId,
    volume_ml: entry.volumeMl,
    total_volume: entry.totalVolume ?? null,
  }).eq('id', entry.id).eq('user_id', userId);
  if (error) throw new Error(`updateWaterEntry failed: ${error.message}`);

  await supabase.from('water_ingredients').delete().eq('water_entry_id', entry.id);
  if (entry.ingredients.length > 0) {
    const { error: ingError } = await supabase.from('water_ingredients').insert(
      entry.ingredients.map((ing) => mapWaterIngredientToRow(ing, userId, entry.id))
    );
    if (ingError) throw new Error(`updateWaterIngredients failed: ${ingError.message}`);
  }
}

// ── bowel entries ─────────────────────────────────────────────

export async function fetchBowelEntries(userId: string): Promise<BowelEntry[]> {
  const { data: entries, error } = await supabase
    .from('bowel_entries')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });

  if (error || !entries) return [];

  return entries.map((row) => ({
    id: row.id,
    timestamp: row.timestamp,
    falseAlarm: row.false_alarm,
    bristolType: row.bristol_type != null ? (row.bristol_type as BristolType) : undefined,
    urgency: row.urgency as BowelUrgency,
    hasBlood: row.has_blood,
    painLevel: row.pain_level,
    notes: row.notes ?? undefined,
    photoUri: row.photo_storage_path ?? undefined,
  }));
}

export async function insertBowelEntry(userId: string, entry: BowelEntry): Promise<void> {
  const { error } = await supabase.from('bowel_entries').insert({
    id: entry.id,
    user_id: userId,
    timestamp: toISOString(entry.timestamp),
    false_alarm: entry.falseAlarm,
    bristol_type: entry.bristolType ?? null,
    urgency: entry.urgency,
    has_blood: entry.hasBlood,
    pain_level: entry.painLevel,
    notes: entry.notes ?? null,
    photo_storage_path: entry.photoUri ?? null,
  });
  if (error) throw new Error(`insertBowelEntry failed: ${error.message}`);
}

// ── photo storage ─────────────────────────────────────────────

/**
 * Encrypt and upload a local photo URI to the private user-photos bucket.
 * The file is AES-256-GCM encrypted on-device before leaving the app.
 * Returns the storage path (not a URL), or null on failure.
 */
export async function uploadPhoto(
  userId: string,
  entryId: string,
  localUri: string
): Promise<string | null> {
  // Storage path has no extension — the encrypted blob is not a valid image file
  const path = `${userId}/${entryId}.enc`;

  // Read the raw image bytes as base64, then convert to ArrayBuffer
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const binary = atob(base64);
  const plainBuffer = new ArrayBuffer(binary.length);
  const view = new Uint8Array(plainBuffer);
  for (let i = 0; i < binary.length; i++) {
    view[i] = binary.charCodeAt(i);
  }

  // Encrypt on-device — Supabase receives only opaque ciphertext
  const encryptedBuffer = await encryptPhoto(plainBuffer);

  // encryptPhoto returns quick-crypto's Buffer (typed as ArrayBufferLike internally).
  // Convert to a standard ArrayBuffer via base64 round-trip so Supabase accepts it.
  const encryptedBase64 = encryptedBuffer.toString('base64');
  const encBinary = atob(encryptedBase64);
  const uploadBuffer = new ArrayBuffer(encBinary.length);
  const uploadView = new Uint8Array(uploadBuffer);
  for (let i = 0; i < encBinary.length; i++) {
    uploadView[i] = encBinary.charCodeAt(i);
  }

  const { error } = await supabase.storage
    .from('user-photos')
    .upload(path, uploadBuffer, {
      contentType: 'application/octet-stream',
      upsert: true,
    });

  if (error) {
    console.warn('Photo upload failed:', error.message);
    return null;
  }
  return path;
}

/**
 * Download an encrypted photo, decrypt it on-device, and return a
 * local file:// URI suitable for use in an <Image> source prop.
 * Returns null if the download or decryption fails.
 */
export async function getDecryptedPhotoUri(storagePath: string): Promise<string | null> {
  // Get a short-lived signed URL to fetch the ciphertext
  const { data, error: urlError } = await supabase.storage
    .from('user-photos')
    .createSignedUrl(storagePath, 60);

  if (urlError || !data) return null;

  // Download ciphertext
  const response = await fetch(data.signedUrl);
  if (!response.ok) return null;
  const encryptedBuffer = await response.arrayBuffer();

  // Decrypt on-device — decryptPhoto returns quick-crypto's Buffer type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let plainBuffer: any;
  try {
    plainBuffer = await decryptPhoto(encryptedBuffer);
  } catch {
    console.warn('Photo decryption failed — key mismatch or corrupt data');
    return null;
  }

  // Write decrypted bytes to a temp file so <Image> can read it
  const tempUri = `${FileSystem.cacheDirectory}photo_${generateId()}.jpg`;
  const base64 = Buffer.from(plainBuffer as Buffer).toString('base64');
  await FileSystem.writeAsStringAsync(tempUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return tempUri;
}

// ── private row mappers ───────────────────────────────────────

function mapIngredientRow(row: any): Ingredient {
  const nd = {
    caloriesPer100g: row.calories_per_100g ?? undefined,
    proteinPer100g:  row.protein_per_100g  ?? undefined,
    carbsPer100g:    row.carbs_per_100g    ?? undefined,
    fatPer100g:      row.fat_per_100g      ?? undefined,
    fiberPer100g:    row.fiber_per_100g    ?? undefined,
    sugarPer100g:    row.sugar_per_100g    ?? undefined,
    saltPer100g:     row.salt_per_100g     ?? undefined,
  };
  const hasNutrition = nd.caloriesPer100g !== undefined;
  return {
    id: row.id,
    name: row.name,
    amount: Number(row.amount),
    unit: row.unit,
    nutritionData:      hasNutrition ? nd : undefined,
    caloriesPer100g:    nd.caloriesPer100g,
    calculatedCalories: row.calculated_calories ?? undefined,
    calculatedProtein:  row.calculated_protein  ?? undefined,
    calculatedCarbs:    row.calculated_carbs    ?? undefined,
    calculatedFat:      row.calculated_fat      ?? undefined,
    calculatedFiber:    row.calculated_fiber    ?? undefined,
  };
}

function mapFoodIngredientToRow(ing: Ingredient, userId: string, entryId: string) {
  const nd = ing.nutritionData;
  return {
    id: ing.id,
    food_entry_id: entryId,
    user_id: userId,
    name: ing.name,
    amount: ing.amount,
    unit: ing.unit,
    calories_per_100g:  ing.caloriesPer100g        ?? nd?.caloriesPer100g ?? null,
    protein_per_100g:   nd?.proteinPer100g          ?? null,
    carbs_per_100g:     nd?.carbsPer100g            ?? null,
    fat_per_100g:       nd?.fatPer100g              ?? null,
    fiber_per_100g:     nd?.fiberPer100g            ?? null,
    sugar_per_100g:     nd?.sugarPer100g            ?? null,
    salt_per_100g:      nd?.saltPer100g             ?? null,
    calculated_calories: ing.calculatedCalories     ?? null,
    calculated_protein:  ing.calculatedProtein      ?? null,
    calculated_carbs:    ing.calculatedCarbs        ?? null,
    calculated_fat:      ing.calculatedFat          ?? null,
    calculated_fiber:    ing.calculatedFiber        ?? null,
    nutrition_source:    null, // populated by future Gemini hook
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
