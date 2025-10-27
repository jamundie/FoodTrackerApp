import React from 'react';
import { render } from '@testing-library/react-native';
import ProgressChart from '../../ProgressChart';
import { FoodEntry, WaterEntry } from '@/types/tracking';

const mockFoodEntries: FoodEntry[] = [
  {
    id: '1',
    timestamp: new Date().toISOString(),
    mealName: 'Test Meal',
    ingredients: [],
    totalCalories: 500,
    category: 'Breakfast',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    mealName: 'Test Meal 2',
    ingredients: [],
    totalCalories: 600,
    category: 'Lunch',
  },
];

const mockWaterEntries: WaterEntry[] = [
  {
    id: '1',
    timestamp: new Date().toISOString(),
    entryName: 'Morning Water',
    ingredients: [],
    totalVolume: 250,
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    entryName: 'Afternoon Water',
    ingredients: [],
    totalVolume: 500,
  },
];

describe('ProgressChart', () => {
  it('renders chart title and components', () => {
    const { getByText } = render(<ProgressChart foodEntries={mockFoodEntries} waterEntries={mockWaterEntries} />);
    
    expect(getByText('Daily Progress (Last 7 Days)')).toBeTruthy();
  });

  it('renders with empty food entries', () => {
    const { getByText } = render(<ProgressChart foodEntries={[]} waterEntries={[]} />);
    
    expect(getByText('Daily Progress (Last 7 Days)')).toBeTruthy();
  });

  it('displays day labels', () => {
    const { getByText } = render(<ProgressChart foodEntries={mockFoodEntries} waterEntries={mockWaterEntries} />);
    
    // Check for some common day abbreviations
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let foundDays = 0;
    
    days.forEach(day => {
      try {
        getByText(day);
        foundDays++;
      } catch (e) {
        // Day not found, which is okay since we only check if any are rendered
      }
    });
    
    // Should find at least one day label
    expect(foundDays).toBeGreaterThan(0);
  });

  it('displays legend for calories and water', () => {
    const { getByText } = render(<ProgressChart foodEntries={mockFoodEntries} waterEntries={mockWaterEntries} />);
    
    expect(getByText('Calories')).toBeTruthy();
    expect(getByText('Water (ml)')).toBeTruthy();
    expect(getByText('Target (2500 cal)')).toBeTruthy();
  });

  it('renders with only food entries', () => {
    const { getByText } = render(<ProgressChart foodEntries={mockFoodEntries} waterEntries={[]} />);
    
    expect(getByText('Daily Progress (Last 7 Days)')).toBeTruthy();
    expect(getByText('Calories')).toBeTruthy();
    expect(getByText('Water (ml)')).toBeTruthy();
  });

  it('renders with only water entries', () => {
    const { getByText } = render(<ProgressChart foodEntries={[]} waterEntries={mockWaterEntries} />);
    
    expect(getByText('Daily Progress (Last 7 Days)')).toBeTruthy();
    expect(getByText('Calories')).toBeTruthy();
    expect(getByText('Water (ml)')).toBeTruthy();
    expect(getByText('Target (2500 cal)')).toBeTruthy();
  });

  it('displays target reference line in legend', () => {
    const { getByText } = render(<ProgressChart foodEntries={mockFoodEntries} waterEntries={mockWaterEntries} />);
    
    expect(getByText('Target (2500 cal)')).toBeTruthy();
  });
});