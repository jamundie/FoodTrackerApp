import React from 'react';
import { render } from '@testing-library/react-native';
import ProgressChart from '../../ProgressChart';
import { FoodEntry } from '@/types/tracking';

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

describe('ProgressChart', () => {
  it('renders chart title and components', () => {
    const { getByText } = render(<ProgressChart foodEntries={mockFoodEntries} />);
    
    expect(getByText('Daily Calorie Intake (Last 7 Days)')).toBeTruthy();
  });

  it('renders with empty food entries', () => {
    const { getByText } = render(<ProgressChart foodEntries={[]} />);
    
    expect(getByText('Daily Calorie Intake (Last 7 Days)')).toBeTruthy();
  });

  it('displays day labels', () => {
    const { getByText } = render(<ProgressChart foodEntries={mockFoodEntries} />);
    
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
});