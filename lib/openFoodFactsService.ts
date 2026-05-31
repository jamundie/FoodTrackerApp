/**
 * Open Food Facts API client.
 * Free, no API key required. Results are mapped to NutritionData so the
 * downstream ingredient pipeline is identical regardless of data source.
 *
 * Option B (Gemini Vision) produces the same NutritionData / FoodSearchResult
 * shape — no changes needed to this file or anything downstream when that is
 * integrated.
 */

import type { NutritionData } from '../types/ingredient';

const BASE_URL = 'https://world.openfoodfacts.org';
const SEARCH_FIELDS = 'product_name,brands,image_small_url,nutriments';

export type FoodSearchResult = {
  productName: string;
  brand?: string;
  thumbnailUrl?: string;
  nutritionData: NutritionData;
};

// ── Raw OFF API shapes ────────────────────────────────────────────────────────

type OFFNutriments = {
  'energy-kcal_100g'?: number;
  'proteins_100g'?:    number;
  'carbohydrates_100g'?: number;
  'fat_100g'?:         number;
  'fiber_100g'?:       number;
  'sugars_100g'?:      number;
  'salt_100g'?:        number;
};

type OFFProduct = {
  product_name?: string;
  brands?:       string;
  image_small_url?: string;
  nutriments?:   OFFNutriments;
};

type OFFSearchResponse = {
  products: OFFProduct[];
  count:    number;
};

// ── Mapping ───────────────────────────────────────────────────────────────────

function mapNutriments(n: OFFNutriments): NutritionData | null {
  const kcal = n['energy-kcal_100g'];
  if (kcal === undefined || kcal === null) return null;
  return {
    caloriesPer100g: kcal,
    proteinPer100g:  n['proteins_100g'],
    carbsPer100g:    n['carbohydrates_100g'],
    fatPer100g:      n['fat_100g'],
    fiberPer100g:    n['fiber_100g'],
    sugarPer100g:    n['sugars_100g'],
    saltPer100g:     n['salt_100g'],
  };
}

function mapProduct(p: OFFProduct): FoodSearchResult | null {
  const name = p.product_name?.trim();
  if (!name) return null;
  const nutritionData = p.nutriments ? mapNutriments(p.nutriments) : null;
  if (!nutritionData) return null;
  return {
    productName:  name,
    brand:        p.brands?.split(',')[0]?.trim() || undefined,
    thumbnailUrl: p.image_small_url || undefined,
    nutritionData,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Search Open Food Facts by ingredient or product name.
 * Returns up to 10 results that have calorie data.
 * Throws on network error so the caller can show an error state.
 */
export async function searchFoodByName(query: string): Promise<FoodSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const url =
    `${BASE_URL}/cgi/search.pl` +
    `?search_terms=${encodeURIComponent(trimmed)}` +
    `&json=1&page_size=20&fields=${SEARCH_FIELDS}`;

  const response = await fetch(url, {
    headers: { 'User-Agent': 'FoodTrackerApp/1.0 (health tracker; contact via GitHub)' },
  });

  if (!response.ok) {
    throw new Error(`Open Food Facts search failed: ${response.status}`);
  }

  const data: OFFSearchResponse = await response.json();

  // Map and filter; take the first 10 with usable calorie data
  const results: FoodSearchResult[] = [];
  for (const product of data.products ?? []) {
    const mapped = mapProduct(product);
    if (mapped) results.push(mapped);
    if (results.length === 10) break;
  }
  return results;
}

/**
 * Look up a single product by barcode (EAN-13 / UPC).
 * Returns null when the product is not found or has no calorie data.
 * Reserved for Option C (barcode scanning) — not wired to UI yet.
 */
export async function searchFoodByBarcode(barcode: string): Promise<FoodSearchResult | null> {
  const url =
    `${BASE_URL}/api/v2/product/${encodeURIComponent(barcode)}.json` +
    `?fields=${SEARCH_FIELDS}`;

  const response = await fetch(url, {
    headers: { 'User-Agent': 'FoodTrackerApp/1.0 (health tracker; contact via GitHub)' },
  });

  if (!response.ok) return null;

  const data: { product?: OFFProduct; status?: number } = await response.json();
  if (data.status === 0 || !data.product) return null;

  return mapProduct(data.product);
}
