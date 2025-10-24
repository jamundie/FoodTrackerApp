/**
 * Mock data utilities for permanent test data
 * 
 * This file provides realistic mock data for development and testing purposes.
 * Mock data is automatically loaded in development mode (NODE_ENV=development)
 * or when EXPO_PUBLIC_USE_MOCK_DATA=true is set.
 * 
 * The mock data includes comprehensive entries for the last 3 days:
 * 
 * FOOD ENTRIES (12 total):
 * - Today: 4 entries (Breakfast, Lunch, Snack, Dinner)
 * - Yesterday: 4 entries (Breakfast, Lunch, Dinner, Dessert)
 * - Day before: 4 entries (Breakfast, Lunch, Snack, Dinner)
 * 
 * WATER ENTRIES (13 total):
 * - Today: 4 entries (Morning, Midday, Post-workout, Evening)
 * - Yesterday: 4 entries (Wake up, Lunch, Afternoon, Dinner)
 * - Day before: 5 entries (Morning, Coffee break, Sparkling water, Pre-dinner, Herbal tea)
 * 
 * All entries use realistic timestamps and ingredients with proper nutritional data
 * to simulate natural usage patterns across multiple days.
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
 * Generate mock food entries for the last 3 days
 */
export const createMockFoodEntries = (): FoodEntry[] => {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const dayBeforeYesterday = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  
  return [
    // TODAY'S ENTRIES
    {
      id: generateMockId('food', 1),
      mealName: 'Greek Yogurt with Berries',
      category: 'Breakfast' as FoodCategory,
      timestamp: createTimestamp(now, { hours: 8, minutes: 15 }),
      ingredients: createMockIngredients([
        { name: 'Greek yogurt', amount: 200, unit: 'g', caloriesPer100g: 59 },
        { name: 'Mixed berries', amount: 100, unit: 'g', caloriesPer100g: 57 },
        { name: 'Honey', amount: 20, unit: 'g', caloriesPer100g: 304 },
      ]),
      totalCalories: 0, // Will be calculated
    },
    {
      id: generateMockId('food', 2),
      mealName: 'Grilled Chicken Salad',
      category: 'Lunch' as FoodCategory,
      timestamp: createTimestamp(now, { hours: 12, minutes: 30 }),
      ingredients: createMockIngredients([
        { name: 'Chicken breast', amount: 150, unit: 'g', caloriesPer100g: 165 },
        { name: 'Mixed greens', amount: 100, unit: 'g', caloriesPer100g: 22 },
        { name: 'Cherry tomatoes', amount: 80, unit: 'g', caloriesPer100g: 18 },
        { name: 'Olive oil', amount: 15, unit: 'ml', caloriesPer100g: 884 },
      ]),
      totalCalories: 0, // Will be calculated
    },
    {
      id: generateMockId('food', 3),
      mealName: 'Afternoon Apple',
      category: 'Snack' as FoodCategory,
      timestamp: createTimestamp(now, { hours: 15, minutes: 45 }),
      ingredients: createMockIngredients([
        { name: 'Apple', amount: 1, unit: 'piece', caloriesPer100g: 52 },
        { name: 'Almond butter', amount: 15, unit: 'g', caloriesPer100g: 614 },
      ]),
      totalCalories: 0, // Will be calculated
    },
    {
      id: generateMockId('food', 4),
      mealName: 'Salmon with Quinoa',
      category: 'Dinner' as FoodCategory,
      timestamp: createTimestamp(now, { hours: 19, minutes: 0 }),
      ingredients: createMockIngredients([
        { name: 'Salmon fillet', amount: 150, unit: 'g', caloriesPer100g: 208 },
        { name: 'Quinoa', amount: 100, unit: 'g', caloriesPer100g: 120 },
        { name: 'Broccoli', amount: 150, unit: 'g', caloriesPer100g: 34 },
        { name: 'Olive oil', amount: 10, unit: 'ml', caloriesPer100g: 884 },
      ]),
      totalCalories: 0, // Will be calculated
    },

    // YESTERDAY'S ENTRIES
    {
      id: generateMockId('food', 5),
      mealName: 'Oatmeal with Banana',
      category: 'Breakfast' as FoodCategory,
      timestamp: createTimestamp(yesterday, { hours: 7, minutes: 30 }),
      ingredients: createMockIngredients([
        { name: 'Rolled oats', amount: 50, unit: 'g', caloriesPer100g: 389 },
        { name: 'Banana', amount: 1, unit: 'piece', caloriesPer100g: 89 },
        { name: 'Milk', amount: 200, unit: 'ml', caloriesPer100g: 42 },
        { name: 'Walnuts', amount: 20, unit: 'g', caloriesPer100g: 654 },
      ]),
      totalCalories: 0, // Will be calculated
    },
    {
      id: generateMockId('food', 6),
      mealName: 'Turkey Sandwich',
      category: 'Lunch' as FoodCategory,
      timestamp: createTimestamp(yesterday, { hours: 13, minutes: 15 }),
      ingredients: createMockIngredients([
        { name: 'Whole wheat bread', amount: 2, unit: 'piece', caloriesPer100g: 247 },
        { name: 'Turkey breast', amount: 100, unit: 'g', caloriesPer100g: 104 },
        { name: 'Avocado', amount: 50, unit: 'g', caloriesPer100g: 160 },
        { name: 'Lettuce', amount: 30, unit: 'g', caloriesPer100g: 15 },
      ]),
      totalCalories: 0, // Will be calculated
    },
    {
      id: generateMockId('food', 7),
      mealName: 'Beef Stir Fry',
      category: 'Dinner' as FoodCategory,
      timestamp: createTimestamp(yesterday, { hours: 18, minutes: 45 }),
      ingredients: createMockIngredients([
        { name: 'Beef strips', amount: 120, unit: 'g', caloriesPer100g: 250 },
        { name: 'Bell peppers', amount: 100, unit: 'g', caloriesPer100g: 31 },
        { name: 'Brown rice', amount: 80, unit: 'g', caloriesPer100g: 111 },
        { name: 'Soy sauce', amount: 10, unit: 'ml', caloriesPer100g: 8 },
      ]),
      totalCalories: 0, // Will be calculated
    },
    {
      id: generateMockId('food', 8),
      mealName: 'Dark Chocolate Square',
      category: 'Dessert' as FoodCategory,
      timestamp: createTimestamp(yesterday, { hours: 21, minutes: 0 }),
      ingredients: createMockIngredients([
        { name: 'Dark chocolate', amount: 20, unit: 'g', caloriesPer100g: 546 },
      ]),
      totalCalories: 0, // Will be calculated
    },

    // DAY BEFORE YESTERDAY'S ENTRIES
    {
      id: generateMockId('food', 9),
      mealName: 'Scrambled Eggs with Toast',
      category: 'Breakfast' as FoodCategory,
      timestamp: createTimestamp(dayBeforeYesterday, { hours: 8, minutes: 0 }),
      ingredients: createMockIngredients([
        { name: 'Eggs', amount: 2, unit: 'piece', caloriesPer100g: 155 },
        { name: 'Sourdough bread', amount: 2, unit: 'piece', caloriesPer100g: 289 },
        { name: 'Butter', amount: 10, unit: 'g', caloriesPer100g: 717 },
        { name: 'Spinach', amount: 50, unit: 'g', caloriesPer100g: 23 },
      ]),
      totalCalories: 0, // Will be calculated
    },
    {
      id: generateMockId('food', 10),
      mealName: 'Mediterranean Bowl',
      category: 'Lunch' as FoodCategory,
      timestamp: createTimestamp(dayBeforeYesterday, { hours: 12, minutes: 45 }),
      ingredients: createMockIngredients([
        { name: 'Chicken thigh', amount: 130, unit: 'g', caloriesPer100g: 209 },
        { name: 'Chickpeas', amount: 100, unit: 'g', caloriesPer100g: 164 },
        { name: 'Cucumber', amount: 80, unit: 'g', caloriesPer100g: 16 },
        { name: 'Feta cheese', amount: 40, unit: 'g', caloriesPer100g: 264 },
        { name: 'Tahini', amount: 15, unit: 'g', caloriesPer100g: 595 },
      ]),
      totalCalories: 0, // Will be calculated
    },
    {
      id: generateMockId('food', 11),
      mealName: 'Trail Mix',
      category: 'Snack' as FoodCategory,
      timestamp: createTimestamp(dayBeforeYesterday, { hours: 16, minutes: 30 }),
      ingredients: createMockIngredients([
        { name: 'Almonds', amount: 20, unit: 'g', caloriesPer100g: 579 },
        { name: 'Dried cranberries', amount: 15, unit: 'g', caloriesPer100g: 308 },
        { name: 'Dark chocolate chips', amount: 10, unit: 'g', caloriesPer100g: 501 },
      ]),
      totalCalories: 0, // Will be calculated
    },
    {
      id: generateMockId('food', 12),
      mealName: 'Vegetable Pasta',
      category: 'Dinner' as FoodCategory,
      timestamp: createTimestamp(dayBeforeYesterday, { hours: 19, minutes: 30 }),
      ingredients: createMockIngredients([
        { name: 'Whole wheat pasta', amount: 100, unit: 'g', caloriesPer100g: 124 },
        { name: 'Zucchini', amount: 150, unit: 'g', caloriesPer100g: 17 },
        { name: 'Tomato sauce', amount: 100, unit: 'g', caloriesPer100g: 29 },
        { name: 'Parmesan cheese', amount: 25, unit: 'g', caloriesPer100g: 431 },
        { name: 'Olive oil', amount: 12, unit: 'ml', caloriesPer100g: 884 },
      ]),
      totalCalories: 0, // Will be calculated
    },
  ];
};

/**
 * Generate mock water entries for the last 3 days
 */
export const createMockWaterEntries = (): WaterEntry[] => {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const dayBeforeYesterday = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  
  return [
    // TODAY'S ENTRIES
    {
      id: generateMockId('water', 1),
      entryName: 'Morning Hydration',
      timestamp: createTimestamp(now, { hours: 7, minutes: 0 }),
      ingredients: createMockIngredients([
        { name: 'Water', amount: 500, unit: 'ml' },
        { name: 'Lemon juice', amount: 10, unit: 'ml', caloriesPer100g: 22 },
      ]),
      totalVolume: 510,
    },
    {
      id: generateMockId('water', 2),
      entryName: 'Midday Water Break',
      timestamp: createTimestamp(now, { hours: 11, minutes: 30 }),
      ingredients: createMockIngredients([
        { name: 'Water', amount: 400, unit: 'ml' },
      ]),
      totalVolume: 400,
    },
    {
      id: generateMockId('water', 3),
      entryName: 'Post-Workout Drink',
      timestamp: createTimestamp(now, { hours: 16, minutes: 30 }),
      ingredients: createMockIngredients([
        { name: 'Water', amount: 750, unit: 'ml' },
        { name: 'Electrolyte powder', amount: 5, unit: 'g', caloriesPer100g: 300 },
      ]),
      totalVolume: 755,
    },
    {
      id: generateMockId('water', 4),
      entryName: 'Evening Tea',
      timestamp: createTimestamp(now, { hours: 20, minutes: 15 }),
      ingredients: createMockIngredients([
        { name: 'Water', amount: 250, unit: 'ml' },
        { name: 'Green tea', amount: 2, unit: 'g' },
      ]),
      totalVolume: 252,
    },

    // YESTERDAY'S ENTRIES
    {
      id: generateMockId('water', 5),
      entryName: 'Wake Up Water',
      timestamp: createTimestamp(yesterday, { hours: 6, minutes: 45 }),
      ingredients: createMockIngredients([
        { name: 'Water', amount: 350, unit: 'ml' },
      ]),
      totalVolume: 350,
    },
    {
      id: generateMockId('water', 6),
      entryName: 'Lunch Hydration',
      timestamp: createTimestamp(yesterday, { hours: 13, minutes: 45 }),
      ingredients: createMockIngredients([
        { name: 'Water', amount: 300, unit: 'ml' },
        { name: 'Cucumber slices', amount: 20, unit: 'g', caloriesPer100g: 16 },
      ]),
      totalVolume: 320,
    },
    {
      id: generateMockId('water', 7),
      entryName: 'Afternoon Coconut Water',
      timestamp: createTimestamp(yesterday, { hours: 15, minutes: 0 }),
      ingredients: createMockIngredients([
        { name: 'Coconut water', amount: 330, unit: 'ml', caloriesPer100g: 19 },
      ]),
      totalVolume: 330,
    },
    {
      id: generateMockId('water', 8),
      entryName: 'Dinner Water',
      timestamp: createTimestamp(yesterday, { hours: 19, minutes: 15 }),
      ingredients: createMockIngredients([
        { name: 'Water', amount: 400, unit: 'ml' },
      ]),
      totalVolume: 400,
    },

    // DAY BEFORE YESTERDAY'S ENTRIES
    {
      id: generateMockId('water', 9),
      entryName: 'Morning Start',
      timestamp: createTimestamp(dayBeforeYesterday, { hours: 7, minutes: 15 }),
      ingredients: createMockIngredients([
        { name: 'Water', amount: 450, unit: 'ml' },
        { name: 'Mint leaves', amount: 5, unit: 'g', caloriesPer100g: 70 },
      ]),
      totalVolume: 455,
    },
    {
      id: generateMockId('water', 10),
      entryName: 'Coffee Break Hydration',
      timestamp: createTimestamp(dayBeforeYesterday, { hours: 10, minutes: 30 }),
      ingredients: createMockIngredients([
        { name: 'Water', amount: 250, unit: 'ml' },
      ]),
      totalVolume: 250,
    },
    {
      id: generateMockId('water', 11),
      entryName: 'Sparkling Water',
      timestamp: createTimestamp(dayBeforeYesterday, { hours: 14, minutes: 20 }),
      ingredients: createMockIngredients([
        { name: 'Sparkling water', amount: 330, unit: 'ml' },
        { name: 'Lime juice', amount: 5, unit: 'ml', caloriesPer100g: 25 },
      ]),
      totalVolume: 335,
    },
    {
      id: generateMockId('water', 12),
      entryName: 'Pre-Dinner Water',
      timestamp: createTimestamp(dayBeforeYesterday, { hours: 18, minutes: 0 }),
      ingredients: createMockIngredients([
        { name: 'Water', amount: 500, unit: 'ml' },
      ]),
      totalVolume: 500,
    },
    {
      id: generateMockId('water', 13),
      entryName: 'Herbal Tea',
      timestamp: createTimestamp(dayBeforeYesterday, { hours: 21, minutes: 30 }),
      ingredients: createMockIngredients([
        { name: 'Water', amount: 200, unit: 'ml' },
        { name: 'Chamomile tea', amount: 2, unit: 'g' },
        { name: 'Honey', amount: 5, unit: 'g', caloriesPer100g: 304 },
      ]),
      totalVolume: 207,
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