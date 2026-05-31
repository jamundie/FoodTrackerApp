/**
 * Tests for openFoodFactsService — search and mapping logic.
 * Fetch is mocked so tests run fully offline.
 */

import { searchFoodByName, searchFoodByBarcode } from '../../../lib/openFoodFactsService';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const validProduct = {
  product_name: 'Whole Milk',
  brands: 'Generic',
  image_small_url: 'https://example.com/milk.jpg',
  nutriments: {
    'energy-kcal_100g': 61,
    'proteins_100g': 3.2,
    'carbohydrates_100g': 4.8,
    'fat_100g': 3.3,
    'fiber_100g': 0,
    'sugars_100g': 4.7,
    'salt_100g': 0.1,
  },
};

const productNoCalories = {
  product_name: 'Mystery Food',
  brands: 'Unknown',
  nutriments: {},
};

const productNoName = {
  product_name: '',
  nutriments: { 'energy-kcal_100g': 100 },
};

beforeEach(() => {
  mockFetch.mockReset();
});

describe('searchFoodByName', () => {
  it('returns empty array for blank query', async () => {
    const results = await searchFoodByName('   ');
    expect(results).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('maps a valid OFF product to FoodSearchResult', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ products: [validProduct], count: 1 }),
    });

    const results = await searchFoodByName('milk');
    expect(results).toHaveLength(1);

    const r = results[0];
    expect(r.productName).toBe('Whole Milk');
    expect(r.brand).toBe('Generic');
    expect(r.thumbnailUrl).toBe('https://example.com/milk.jpg');
    expect(r.nutritionData.caloriesPer100g).toBe(61);
    expect(r.nutritionData.proteinPer100g).toBe(3.2);
    expect(r.nutritionData.carbsPer100g).toBe(4.8);
    expect(r.nutritionData.fatPer100g).toBe(3.3);
  });

  it('filters out products with no calorie data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ products: [productNoCalories, validProduct], count: 2 }),
    });

    const results = await searchFoodByName('food');
    expect(results).toHaveLength(1);
    expect(results[0].productName).toBe('Whole Milk');
  });

  it('filters out products with no name', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ products: [productNoName], count: 1 }),
    });

    const results = await searchFoodByName('food');
    expect(results).toHaveLength(0);
  });

  it('returns at most 10 results', async () => {
    const manyProducts = Array.from({ length: 20 }, (_, i) => ({
      ...validProduct,
      product_name: `Product ${i}`,
    }));
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ products: manyProducts, count: 20 }),
    });

    const results = await searchFoodByName('food');
    expect(results).toHaveLength(10);
  });

  it('throws on non-ok HTTP response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(searchFoodByName('milk')).rejects.toThrow('500');
  });

  it('sends correct search URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ products: [], count: 0 }),
    });

    await searchFoodByName('chicken breast');
    const url: string = mockFetch.mock.calls[0][0];
    expect(url).toContain('search_terms=chicken%20breast');
    expect(url).toContain('json=1');
  });
});

describe('searchFoodByBarcode', () => {
  it('returns null for a 404 response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    const result = await searchFoodByBarcode('1234567890123');
    expect(result).toBeNull();
  });

  it('returns null when status is 0 (product not found)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 0, product: null }),
    });
    const result = await searchFoodByBarcode('0000000000000');
    expect(result).toBeNull();
  });

  it('maps a found product', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 1, product: validProduct }),
    });
    const result = await searchFoodByBarcode('5000112546415');
    expect(result).not.toBeNull();
    expect(result!.productName).toBe('Whole Milk');
    expect(result!.nutritionData.caloriesPer100g).toBe(61);
  });
});
