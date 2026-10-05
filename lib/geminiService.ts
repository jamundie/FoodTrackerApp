/**
 * Meal-photo analysis — reads the photo on-device and sends it to the
 * analyse-meal-photo Supabase Edge Function, which calls Gemini Vision with a
 * server-side key (no EXPO_PUBLIC_ key in the bundle). Results come back in the
 * same FoodSearchResult shape used by Open Food Facts, so the downstream
 * ingredient pipeline needs no changes.
 */

import * as FileSystem from 'expo-file-system';
import { analyseMealPhotoRemote } from './trackingService';
import type { FoodSearchResult } from './openFoodFactsService';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Read a local file:// URI and return its base64-encoded contents. */
async function uriToBase64(uri: string): Promise<string> {
  // expo-file-system can only read file:// URIs
  const localUri = uri.startsWith('file://') ? uri : `file://${uri}`;
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return base64;
}

/** Detect MIME type from the URI extension (Gemini requires it). */
function mimeTypeFromUri(uri: string): string {
  const lower = uri.toLowerCase();
  if (lower.endsWith('.png'))  return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif'))  return 'image/gif';
  return 'image/jpeg'; // default for .jpg / .jpeg / camera output
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Analyse a meal photo and return detected ingredients as FoodSearchResult[].
 * Each result maps to one ingredient row via applyNutritionToIngredient().
 *
 * @param photoUri - local file:// URI from expo-image-picker
 * @throws Error with a user-facing message on network/API failure
 */
export async function analyseMealPhoto(photoUri: string): Promise<FoodSearchResult[]> {
  const base64Data = await uriToBase64(photoUri);
  const ingredients = await analyseMealPhotoRemote(base64Data, mimeTypeFromUri(photoUri));

  // Map to the shared FoodSearchResult contract
  return ingredients.map((item): FoodSearchResult => ({
    productName:     item.name,
    estimatedWeightG: item.estimatedWeightG,
    nutritionData: {
      caloriesPer100g: item.caloriesPer100g,
      proteinPer100g:  item.proteinPer100g,
      carbsPer100g:    item.carbsPer100g,
      fatPer100g:      item.fatPer100g,
      fiberPer100g:    item.fiberPer100g,
    },
  }));
}
