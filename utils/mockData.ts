/**
 * Mock data utilities for permanent test data
 * 
 * This file provides realistic mock data for development and testing purposes.
 * Mock data is automatically loaded in development mode (NODE_ENV=development)
 * or when EXPO_PUBLIC_USE_MOCK_DATA=true is set.
 * 
 * The mock data uses random generation from predefined arrays to create entries
 * for the last 7 days with varied meal types, ingredients, and timing.
 * 
 * FOOD ENTRIES: 3-4 entries per day across 7 days
 * WATER ENTRIES: 3-5 entries per day across 7 days
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

// Random number generator with seed for consistent results in development
let seed = 12345;
const random = (): number => {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
};

const randomInt = (min: number, max: number): number => {
  return Math.floor(random() * (max - min + 1)) + min;
};

const randomChoice = <T>(array: readonly T[]): T => {
  return array[Math.floor(random() * array.length)];
};

/**
 * Base meal names array (10 options)
 */
const MEAL_NAMES = [
  'Greek Yogurt Bowl',
  'Grilled Chicken Salad',
  'Salmon with Quinoa',
  'Turkey Sandwich',
  'Beef Stir Fry',
  'Vegetable Pasta',
  'Smoothie Bowl',
  'Avocado Toast',
  'Fish Tacos',
  'Mediterranean Bowl'
] as const;

/**
 * Base food ingredients array (20 options) with nutritional data
 */
const FOOD_INGREDIENTS = [
  { name: 'Chicken breast', unit: 'g' as const, caloriesPer100g: 165, minAmount: 80, maxAmount: 200 },
  { name: 'Salmon fillet', unit: 'g' as const, caloriesPer100g: 208, minAmount: 100, maxAmount: 180 },
  { name: 'Greek yogurt', unit: 'g' as const, caloriesPer100g: 59, minAmount: 150, maxAmount: 300 },
  { name: 'Quinoa', unit: 'g' as const, caloriesPer100g: 120, minAmount: 60, maxAmount: 120 },
  { name: 'Brown rice', unit: 'g' as const, caloriesPer100g: 111, minAmount: 80, maxAmount: 150 },
  { name: 'Avocado', unit: 'g' as const, caloriesPer100g: 160, minAmount: 50, maxAmount: 150 },
  { name: 'Mixed berries', unit: 'g' as const, caloriesPer100g: 57, minAmount: 80, maxAmount: 150 },
  { name: 'Spinach', unit: 'g' as const, caloriesPer100g: 23, minAmount: 50, maxAmount: 100 },
  { name: 'Broccoli', unit: 'g' as const, caloriesPer100g: 34, minAmount: 100, maxAmount: 200 },
  { name: 'Sweet potato', unit: 'g' as const, caloriesPer100g: 86, minAmount: 150, maxAmount: 300 },
  { name: 'Olive oil', unit: 'ml' as const, caloriesPer100g: 884, minAmount: 5, maxAmount: 20 },
  { name: 'Almonds', unit: 'g' as const, caloriesPer100g: 579, minAmount: 15, maxAmount: 40 },
  { name: 'Eggs', unit: 'piece' as const, caloriesPer100g: 155, minAmount: 1, maxAmount: 3 },
  { name: 'Whole wheat bread', unit: 'piece' as const, caloriesPer100g: 247, minAmount: 1, maxAmount: 2 },
  { name: 'Bell peppers', unit: 'g' as const, caloriesPer100g: 31, minAmount: 80, maxAmount: 150 },
  { name: 'Tomatoes', unit: 'g' as const, caloriesPer100g: 18, minAmount: 100, maxAmount: 200 },
  { name: 'Cucumber', unit: 'g' as const, caloriesPer100g: 16, minAmount: 80, maxAmount: 150 },
  { name: 'Feta cheese', unit: 'g' as const, caloriesPer100g: 264, minAmount: 30, maxAmount: 80 },
  { name: 'Honey', unit: 'g' as const, caloriesPer100g: 304, minAmount: 10, maxAmount: 25 },
  { name: 'Lemon juice', unit: 'ml' as const, caloriesPer100g: 22, minAmount: 5, maxAmount: 20 }
] as const;

/**
 * Water entry names array
 */
const WATER_ENTRY_NAMES = [
  'Morning Hydration',
  'Coffee Break Water',
  'Pre-Workout Drink',
  'Post-Workout Recovery',
  'Lunch Hydration',
  'Afternoon Refresh',
  'Evening Tea',
  'Bedtime Water',
  'Midday Break',
  'Energy Boost'
] as const;

/**
 * Water ingredients array (max 5 per entry)
 */
const WATER_INGREDIENTS = [
  { name: 'Water', unit: 'ml' as const, caloriesPer100g: 0, minAmount: 200, maxAmount: 750 },
  { name: 'Sparkling water', unit: 'ml' as const, caloriesPer100g: 0, minAmount: 250, maxAmount: 500 },
  { name: 'Coconut water', unit: 'ml' as const, caloriesPer100g: 19, minAmount: 200, maxAmount: 400 },
  { name: 'Lemon juice', unit: 'ml' as const, caloriesPer100g: 22, minAmount: 5, maxAmount: 20 },
  { name: 'Lime juice', unit: 'ml' as const, caloriesPer100g: 25, minAmount: 5, maxAmount: 15 },
  { name: 'Mint leaves', unit: 'g' as const, caloriesPer100g: 70, minAmount: 2, maxAmount: 10 },
  { name: 'Cucumber slices', unit: 'g' as const, caloriesPer100g: 16, minAmount: 10, maxAmount: 30 },
  { name: 'Green tea', unit: 'g' as const, caloriesPer100g: 0, minAmount: 1, maxAmount: 3 },
  { name: 'Honey', unit: 'g' as const, caloriesPer100g: 304, minAmount: 5, maxAmount: 15 },
  { name: 'Electrolyte powder', unit: 'g' as const, caloriesPer100g: 300, minAmount: 3, maxAmount: 8 }
] as const;

/**
 * Food categories for random assignment
 */
const FOOD_CATEGORIES: FoodCategory[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'];

/**
 * Generate random ingredients for food entries
 */
const generateRandomFoodIngredients = (count: number): Ingredient[] => {
  const selectedIngredients: Ingredient[] = [];
  const availableIngredients = [...FOOD_INGREDIENTS];
  
  for (let i = 0; i < count && availableIngredients.length > 0; i++) {
    const randomIndex = randomInt(0, availableIngredients.length - 1);
    const ingredient = availableIngredients.splice(randomIndex, 1)[0];
    const amount = randomInt(ingredient.minAmount, ingredient.maxAmount);
    
    selectedIngredients.push({
      id: generateMockId('ingredient', i),
      name: ingredient.name,
      amount: amount,
      unit: ingredient.unit,
      caloriesPer100g: ingredient.caloriesPer100g,
      calculatedCalories: ingredient.caloriesPer100g 
        ? (amount * (ingredient.caloriesPer100g / 100))
        : undefined,
    });
  }
  
  return selectedIngredients;
};

/**
 * Generate random ingredients for water entries (max 5)
 */
const generateRandomWaterIngredients = (): Ingredient[] => {
  const count = randomInt(1, 5); // 1-5 ingredients max
  const selectedIngredients: Ingredient[] = [];
  const availableIngredients = [...WATER_INGREDIENTS];
  
  // Always include water as base
  const waterIngredient = availableIngredients.find(ing => ing.name === 'Water');
  if (waterIngredient) {
    const amount = randomInt(waterIngredient.minAmount, waterIngredient.maxAmount);
    selectedIngredients.push({
      id: generateMockId('ingredient', 0),
      name: waterIngredient.name,
      amount: amount,
      unit: waterIngredient.unit,
      caloriesPer100g: waterIngredient.caloriesPer100g,
      calculatedCalories: waterIngredient.caloriesPer100g 
        ? (amount * (waterIngredient.caloriesPer100g / 100))
        : undefined,
    });
  }
  
  // Add additional ingredients
  const otherIngredients = availableIngredients.filter(ing => ing.name !== 'Water');
  for (let i = 1; i < count && otherIngredients.length > 0; i++) {
    const randomIndex = randomInt(0, otherIngredients.length - 1);
    const ingredient = otherIngredients.splice(randomIndex, 1)[0];
    const amount = randomInt(ingredient.minAmount, ingredient.maxAmount);
    
    selectedIngredients.push({
      id: generateMockId('ingredient', i),
      name: ingredient.name,
      amount: amount,
      unit: ingredient.unit,
      caloriesPer100g: ingredient.caloriesPer100g,
      calculatedCalories: ingredient.caloriesPer100g 
        ? (amount * (ingredient.caloriesPer100g / 100))
        : undefined,
    });
  }
  
  return selectedIngredients;
};
/**
 * Generate mock food entries for the last 7 days using random generation
 */
export const createMockFoodEntries = (): FoodEntry[] => {
  const entries: FoodEntry[] = [];
  let entryId = 1;
  
  // Generate entries for 7 days
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(Date.now() - dayOffset * 24 * 60 * 60 * 1000);
    const entriesPerDay = randomInt(3, 4); // 3-4 entries per day
    
    for (let entryIndex = 0; entryIndex < entriesPerDay; entryIndex++) {
      const ingredients = generateRandomFoodIngredients(randomInt(2, 5)); // 2-5 ingredients per meal
      const totalCalories = ingredients.reduce((total, ingredient) => {
        return total + (ingredient.calculatedCalories || 0);
      }, 0);
      
      // Generate realistic meal times
      const baseHour = entryIndex === 0 ? 8 : entryIndex === 1 ? 12 : entryIndex === 2 ? 16 : 19;
      const hour = baseHour + randomInt(-1, 1);
      const minutes = randomInt(0, 59);
      
      entries.push({
        id: generateMockId('food', entryId++),
        mealName: randomChoice(MEAL_NAMES),
        category: randomChoice(FOOD_CATEGORIES),
        timestamp: createTimestamp(date, { hours: hour, minutes }),
        ingredients,
        totalCalories,
      });
    }
  }
  
  return entries;
};

/**
 * Generate mock water entries for the last 7 days using random generation
 */
export const createMockWaterEntries = (): WaterEntry[] => {
  const entries: WaterEntry[] = [];
  let entryId = 1;
  
  // Generate entries for 7 days
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(Date.now() - dayOffset * 24 * 60 * 60 * 1000);
    const entriesPerDay = randomInt(3, 5); // 3-5 entries per day
    
    for (let entryIndex = 0; entryIndex < entriesPerDay; entryIndex++) {
      const ingredients = generateRandomWaterIngredients();
      const totalVolume = ingredients.reduce((total, ingredient) => {
        return total + ingredient.amount;
      }, 0);
      
      // Generate realistic hydration times throughout the day
      const baseHour = 7 + (entryIndex * 3) + randomInt(0, 2);
      const minutes = randomInt(0, 59);
      
      entries.push({
        id: generateMockId('water', entryId++),
        entryName: randomChoice(WATER_ENTRY_NAMES),
        timestamp: createTimestamp(date, { hours: baseHour, minutes }),
        ingredients,
        totalVolume,
      });
    }
  }
  
  return entries;
};

/**
 * Calculate total calories for food entries (legacy function for compatibility)
 */
export const calculateMockFoodCalories = (foodEntries: FoodEntry[]): FoodEntry[] => {
  return foodEntries.map(entry => ({
    ...entry,
    totalCalories: entry.ingredients.reduce((total, ingredient) => {
      return total + (ingredient.calculatedCalories || 0);
    }, 0),
  }));
};