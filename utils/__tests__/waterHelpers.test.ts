import { calculateTotalVolume, processWaterIngredients, createWaterEntry } from '../waterHelpers';
import { WaterIngredientFormData } from '../../components/WaterIngredientsForm';

describe('waterHelpers', () => {
  describe('calculateTotalVolume', () => {
    test('calculates total volume from ml ingredients', () => {
      const ingredients = [
        { id: '1', name: 'Water', amount: 500, unit: 'ml' as const },
        { id: '2', name: 'Juice', amount: 250, unit: 'ml' as const },
      ];
      
      expect(calculateTotalVolume(ingredients)).toBe(750);
    });

    test('ignores non-ml ingredients in volume calculation', () => {
      const ingredients = [
        { id: '1', name: 'Water', amount: 500, unit: 'ml' as const },
        { id: '2', name: 'Powder', amount: 25, unit: 'g' as const },
        { id: '3', name: 'Honey', amount: 2, unit: 'piece' as const },
      ];
      
      expect(calculateTotalVolume(ingredients)).toBe(500);
    });

    test('returns 0 for empty ingredients', () => {
      expect(calculateTotalVolume([])).toBe(0);
    });

    test('returns 0 when no ml ingredients', () => {
      const ingredients = [
        { id: '1', name: 'Powder', amount: 25, unit: 'g' as const },
        { id: '2', name: 'Tablets', amount: 2, unit: 'piece' as const },
      ];
      
      expect(calculateTotalVolume(ingredients)).toBe(0);
    });
  });

  describe('processWaterIngredients', () => {
    test('processes valid ingredients correctly', () => {
      const formData: WaterIngredientFormData[] = [
        { name: 'Lemon juice', amount: '30', unit: 'ml', caloriesPer100g: '22' },
        { name: 'Honey', amount: '1', unit: 'piece', caloriesPer100g: '304' },
      ];

      const result = processWaterIngredients(formData);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        name: 'Lemon juice',
        amount: 30,
        unit: 'ml',
        caloriesPer100g: 22,
        calculatedCalories: 6.6, // 30 * 22 / 100
      });
      expect(result[1]).toMatchObject({
        name: 'Honey',
        amount: 1,
        unit: 'piece',
        caloriesPer100g: 304,
        calculatedCalories: 304, // 1 * 304
      });
    });

    test('filters out invalid ingredients', () => {
      const formData: WaterIngredientFormData[] = [
        { name: 'Lemon juice', amount: '30', unit: 'ml', caloriesPer100g: '22' },
        { name: '', amount: '50', unit: 'ml', caloriesPer100g: '0' }, // Empty name
        { name: 'Water', amount: '', unit: 'ml', caloriesPer100g: '' }, // Empty amount
        { name: '  ', amount: '100', unit: 'ml', caloriesPer100g: '' }, // Whitespace name
      ];

      const result = processWaterIngredients(formData);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Lemon juice');
    });

    test('handles ingredients without calories', () => {
      const formData: WaterIngredientFormData[] = [
        { name: 'Water', amount: '500', unit: 'ml', caloriesPer100g: '' },
      ];

      const result = processWaterIngredients(formData);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        name: 'Water',
        amount: 500,
        unit: 'ml',
        caloriesPer100g: undefined,
        calculatedCalories: undefined,
      });
    });

    test('calculates calories correctly for different units', () => {
      const formData: WaterIngredientFormData[] = [
        { name: 'Juice', amount: '250', unit: 'ml', caloriesPer100g: '45' }, // ml
        { name: 'Powder', amount: '20', unit: 'g', caloriesPer100g: '350' }, // g
        { name: 'Tablet', amount: '2', unit: 'piece', caloriesPer100g: '50' }, // piece
      ];

      const result = processWaterIngredients(formData);

      expect(result[0].calculatedCalories).toBe(112.5); // 250 * 45 / 100
      expect(result[1].calculatedCalories).toBe(70); // 20 * 350 / 100
      expect(result[2].calculatedCalories).toBe(100); // 2 * 50
    });

    test('generates unique IDs for ingredients', () => {
      const formData: WaterIngredientFormData[] = [
        { name: 'Ingredient 1', amount: '10', unit: 'ml', caloriesPer100g: '' },
        { name: 'Ingredient 2', amount: '20', unit: 'ml', caloriesPer100g: '' },
      ];

      const result = processWaterIngredients(formData);

      expect(result[0].id).toBeDefined();
      expect(result[1].id).toBeDefined();
      expect(result[0].id).not.toBe(result[1].id);
    });

    test('handles zero amounts correctly', () => {
      const formData: WaterIngredientFormData[] = [
        { name: 'Test', amount: '0', unit: 'ml', caloriesPer100g: '100' },
      ];

      const result = processWaterIngredients(formData);

      expect(result[0].amount).toBe(0);
      expect(result[0].calculatedCalories).toBeUndefined(); // Zero amount doesn't calculate calories
    });
  });

  describe('createWaterEntry', () => {
    test('creates water entry with all fields', () => {
      const ingredients = [
        { id: '1', name: 'Lemon juice', amount: 30, unit: 'ml' as const, caloriesPer100g: 22, calculatedCalories: 6.6 },
      ];
      const timestamp = '2025-08-04T14:30:00.000Z';
      const entryName = 'Afternoon hydration';

      const result = createWaterEntry(entryName, timestamp, ingredients);

      expect(result).toMatchObject({
        entryName: 'Afternoon hydration',
        timestamp: '2025-08-04T14:30:00.000Z',
        ingredients,
        totalVolume: 30,
      });
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe('string');
    });

    test('trims entry name', () => {
      const result = createWaterEntry('  Test Entry  ', '2025-08-04T14:30:00.000Z', []);

      expect(result.entryName).toBe('Test Entry');
    });

    test('handles no volume when no ml ingredients', () => {
      const ingredients = [
        { id: '1', name: 'Powder', amount: 25, unit: 'g' as const },
      ];

      const result = createWaterEntry('Test', '2025-08-04T14:30:00.000Z', ingredients);

      expect(result.totalVolume).toBeUndefined();
    });

    test('handles empty ingredients array', () => {
      const result = createWaterEntry('Plain water', '2025-08-04T14:30:00.000Z', []);

      expect(result.ingredients).toEqual([]);
      expect(result.totalVolume).toBeUndefined();
    });

    test('generates unique ID', async () => {
      const entry1 = createWaterEntry('Entry 1', '2025-08-04T14:30:00.000Z', []);
      // Small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 1));
      const entry2 = createWaterEntry('Entry 2', '2025-08-04T14:30:00.000Z', []);

      expect(entry1.id).not.toBe(entry2.id);
    });
  });
});