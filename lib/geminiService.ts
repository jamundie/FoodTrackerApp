/**
 * Gemini Vision service — analyses a meal photo and returns detected ingredients
 * with estimated nutrition data in the same FoodSearchResult shape used by
 * Open Food Facts, so the downstream ingredient pipeline needs no changes.
 *
 * Model: gemini-2.5-flash
 *
 * FUTURE WORK — Client-side rate limiting:
 * Add a per-user call budget enforced in this service (e.g. 10 requests/hour)
 * to protect against runaway usage on a paid-tier key. Implementation sketch:
 *   - Store call timestamps in expo-secure-store under a 'gemini_call_log' key
 *   - On each call, prune entries older than 1 hour and count the remainder
 *   - Reject with a user-facing error if count >= LIMIT before making the fetch
 * This is a client-side guard only; pair with a server-side quota or a proxy
 * function (e.g. Supabase Edge Function) for production-grade enforcement.
 * API key: EXPO_PUBLIC_GEMINI_API_KEY in .env.local
 */

import * as FileSystem from 'expo-file-system';
import type { FoodSearchResult } from './openFoodFactsService';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
const MODEL   = 'gemini-2.5-flash';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

// ── Prompt ────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a nutrition analysis assistant. Analyse the meal photo and identify each distinct ingredient or food item visible.

Return ONLY a JSON array — no markdown, no explanation, no code fences. Each element must have:
- "name": string — the ingredient or food item name
- "estimatedWeightG": number — estimated weight in grams (your best guess for a typical serving)
- "caloriesPer100g": number — approximate kcal per 100g
- "proteinPer100g": number — approximate grams of protein per 100g
- "carbsPer100g": number — approximate grams of carbohydrates per 100g
- "fatPer100g": number — approximate grams of fat per 100g
- "fiberPer100g": number — approximate grams of dietary fibre per 100g

Be as accurate as possible using standard nutritional values. If you cannot confidently identify an item, omit it. Return an empty array [] if no food is visible.

Example output:
[
  {"name":"Chicken breast","estimatedWeightG":150,"caloriesPer100g":165,"proteinPer100g":31,"carbsPer100g":0,"fatPer100g":3.6,"fiberPer100g":0},
  {"name":"Brown rice","estimatedWeightG":180,"caloriesPer100g":112,"proteinPer100g":2.6,"carbsPer100g":23,"fatPer100g":0.9,"fiberPer100g":1.8}
]`;

// ── Raw Gemini response shapes ────────────────────────────────────────────────

type GeminiIngredient = {
  name: string;
  estimatedWeightG: number;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
    finishReason?: string;
  }>;
  error?: { message: string; code: number };
};

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

/** Strip markdown fences if the model ignores the "no fences" instruction. */
function stripFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

/** Parse the raw text from Gemini into a typed array. Returns [] on failure. */
function parseIngredients(text: string): GeminiIngredient[] {
  try {
    const cleaned = stripFences(text);
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is GeminiIngredient =>
        typeof item?.name === 'string' &&
        typeof item?.caloriesPer100g === 'number'
    );
  } catch {
    return [];
  }
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
  if (!API_KEY) {
    throw new Error('Gemini API key is not configured. Add EXPO_PUBLIC_GEMINI_API_KEY to .env.local.');
  }

  const base64Data = await uriToBase64(photoUri);
  const mimeType   = mimeTypeFromUri(photoUri);

  const body = {
    contents: [
      {
        parts: [
          { text: SYSTEM_PROMPT },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Data,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,   // low temperature for factual nutrition estimates
      maxOutputTokens: 4096,
    },
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const json: GeminiResponse = await response.json();

  if (!response.ok || json.error) {
    const msg = json.error?.message ?? `Gemini API error ${response.status}`;
    throw new Error(msg);
  }

  const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const ingredients = parseIngredients(text);

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
