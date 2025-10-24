/**
 * Mock data utilities for permanent test data
 * 
 * This file provides realistic mock data for development and testing purposes.
 * Mock data is automatically loaded in development mode (NODE_ENV=development)
 * or when EXPO_PUBLIC_USE_MOCK_DATA=true is set.
 * 
 * The mock data includes:
 * - 3 food entries (Breakfast, Lunch, Snack) with realistic ingredients and calories
 * - 2 water entries (Morning Hydration, Post-Workout) with flavoring and supplements
 * 
 * All entries use realistic timestamps relative to the current time to simulate
 * natural usage patterns.
 */

import { FoodEntry, WaterEntry, Ingredient, FoodCategory } from '../types/tracking';
import { createTimestamp } from './dateUtils';

/**
 * Generate unique IDs for mock data
 */
const generateMockId = (prefix: string, index: number): string => {
  return `mock-${prefix}-${index}-${Date.now()}`;
};

/**
 * Create mock ingredients with realistic nutritional data
 */
const createMockIngredients = (ingredientData: Array<{
  name: string;
  amount: number;
  unit: "g" | "ml" | "piece";
  caloriesPer100g?: number;
}>): Ingredient[] => {
  return ingredientData.map((data, index) => ({
    id: generateMockId('ingredient', index),
    name: data.name,
    amount: data.amount,
    unit: data.unit,
    caloriesPer100g: data.caloriesPer100g,
    calculatedCalories: data.caloriesPer100g 
      ? (data.amount * (data.caloriesPer100g / 100))
      : undefined,
  }));
};

/**
 * Generate mock food entries
 */
export const createMockFoodEntries = (): FoodEntry[] => {
  const now = new Date();
  
  return [
    {
      id: generateMockId('food', 1),
      mealName: 'Grilled Chicken Salad',
      category: 'Lunch' as FoodCategory,
      timestamp: createTimestamp(
        new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        { hours: 12, minutes: 30 }
      ),
      ingredients: createMockIngredients([
        { name: 'Chicken breast', amount: 150, unit: 'g', caloriesPer100g: 165 },
        { name: 'Mixed greens', amount: 100, unit: 'g', caloriesPer100g: 22 },
        { name: 'Cherry tomatoes', amount: 80, unit: 'g', caloriesPer100g: 18 },
        { name: 'Olive oil', amount: 15, unit: 'ml', caloriesPer100g: 884 },
      ]),
      totalCalories: 0, // Will be calculated
    },
    {
      id: generateMockId('food', 2),
      mealName: 'Greek Yogurt with Berries',
      category: 'Breakfast' as FoodCategory,
      timestamp: createTimestamp(
        now,
        { hours: 8, minutes: 15 }
      ),
      ingredients: createMockIngredients([
        { name: 'Greek yogurt', amount: 200, unit: 'g', caloriesPer100g: 59 },
        { name: 'Mixed berries', amount: 100, unit: 'g', caloriesPer100g: 57 },
        { name: 'Honey', amount: 20, unit: 'g', caloriesPer100g: 304 },
      ]),
      totalCalories: 0, // Will be calculated
    },
    {
      id: generateMockId('food', 3),
      mealName: 'Evening Smoothie',
      category: 'Snack' as FoodCategory,
      timestamp: createTimestamp(
        new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
        { hours: 19, minutes: 45 }
      ),
      ingredients: createMockIngredients([
        { name: 'Banana', amount: 1, unit: 'piece', caloriesPer100g: 89 },
        { name: 'Spinach', amount: 50, unit: 'g', caloriesPer100g: 23 },
        { name: 'Protein powder', amount: 30, unit: 'g', caloriesPer100g: 400 },
        { name: 'Almond milk', amount: 250, unit: 'ml', caloriesPer100g: 17 },
      ]),
      totalCalories: 0, // Will be calculated
    },
  ];
};

/**
 * Generate mock water entries
 */
export const createMockWaterEntries = (): WaterEntry[] => {
  const now = new Date();
  
  return [
    {
      id: generateMockId('water', 1),
      entryName: 'Morning Hydration',
      timestamp: createTimestamp(
        now,
        { hours: 7, minutes: 0 }
      ),
      ingredients: createMockIngredients([
        { name: 'Water', amount: 500, unit: 'ml' },
        { name: 'Lemon juice', amount: 10, unit: 'ml', caloriesPer100g: 22 },
      ]),
      totalVolume: 510,
    },
    {
      id: generateMockId('water', 2),
      entryName: 'Post-Workout Drink',
      timestamp: createTimestamp(
        new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
        { hours: 16, minutes: 30 }
      ),
      ingredients: createMockIngredients([
        { name: 'Water', amount: 750, unit: 'ml' },
        { name: 'Electrolyte powder', amount: 5, unit: 'g', caloriesPer100g: 300 },
      ]),
      totalVolume: 755,
    },
  ];
};

/**
 * Calculate total calories for food entries
 */
export const calculateMockFoodCalories = (foodEntries: FoodEntry[]): FoodEntry[] => {
  return foodEntries.map(entry => ({
    ...entry,
    totalCalories: entry.ingredients.reduce((total, ingredient) => {
      return total + (ingredient.calculatedCalories || 0);
    }, 0),
  }));
};