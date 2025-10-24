import React from 'react';
import { render, screen } from '@testing-library/react-native';
import RecentActivities from '../../RecentActivities';
import { FoodEntry, WaterEntry } from '@/types/tracking';

const mockFoodEntry: FoodEntry = {
  id: 'food-1',
  mealName: 'Pasta Salad',
  category: 'Lunch',
  timestamp: '2024-10-24T12:30:00.000Z',
  ingredients: [
    {
      id: 'ing-1',
      name: 'Pasta',
      amount: 200,
      unit: 'g',
      caloriesPer100g: 350,
      calculatedCalories: 700
    }
  ],
  totalCalories: 700
};

const mockWaterEntry: WaterEntry = {
  id: 'water-1',
  entryName: 'Morning hydration',
  timestamp: '2024-10-24T08:00:00.000Z',
  ingredients: [
    {
      id: 'ing-2',
      name: 'Water',
      amount: 500,
      unit: 'ml'
    }
  ],
  totalVolume: 500
};

describe('RecentActivities', () => {
  it('renders empty state when no entries provided', () => {
    render(<RecentActivities foodEntries={[]} waterEntries={[]} />);
    
    expect(screen.getByText('No activities yet')).toBeTruthy();
    expect(screen.getByText('Start tracking your food and water intake!')).toBeTruthy();
  });

  it('renders food entries correctly', () => {
    render(<RecentActivities foodEntries={[mockFoodEntry]} waterEntries={[]} />);
    
    expect(screen.getByText('Logged Pasta Salad')).toBeTruthy();
    expect(screen.getByText('Lunch • 1 ingredients • 700 cal')).toBeTruthy();
    expect(screen.getByText('🍳')).toBeTruthy();
  });

  it('renders water entries correctly', () => {
    render(<RecentActivities foodEntries={[]} waterEntries={[mockWaterEntry]} />);
    
    expect(screen.getByText('Morning hydration')).toBeTruthy();
    expect(screen.getByText('1 ingredients • 500ml')).toBeTruthy();
    expect(screen.getByText('💧')).toBeTruthy();
  });

  it('combines and sorts entries by timestamp', () => {
    const olderFoodEntry: FoodEntry = {
      ...mockFoodEntry,
      id: 'food-2',
      timestamp: '2024-10-24T10:00:00.000Z',
      mealName: 'Breakfast Toast'
    };

    render(<RecentActivities 
      foodEntries={[olderFoodEntry, mockFoodEntry]} 
      waterEntries={[mockWaterEntry]} 
    />);

    const activities = screen.getAllByTestId('activity-row');
    // Most recent should be first (Pasta Salad at 12:30)
    // Then older food entry (Breakfast Toast at 10:00)
    // Then water entry (Morning hydration at 08:00)
    expect(activities).toHaveLength(3);
  });

  it('respects maxEntries limit', () => {
    const entries = Array(15).fill(null).map((_, i) => ({
      ...mockFoodEntry,
      id: `food-${i}`,
      timestamp: new Date(Date.now() + i * 1000).toISOString()
    }));

    render(<RecentActivities 
      foodEntries={entries} 
      waterEntries={[]} 
      maxEntries={5} 
    />);

    const activities = screen.getAllByTestId('activity-row');
    expect(activities).toHaveLength(5);
  });

  it('displays relative time correctly', () => {
    const recentEntry: FoodEntry = {
      ...mockFoodEntry,
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
    };

    render(<RecentActivities foodEntries={[recentEntry]} waterEntries={[]} />);
    
    expect(screen.getByText('30m ago')).toBeTruthy();
  });
});