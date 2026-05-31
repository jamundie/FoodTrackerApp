import React from 'react';
import { render } from '@testing-library/react-native';
import EditFoodEntryModal from '../../EditFoodEntryModal';
import { TrackingProvider } from '../../../hooks/TrackingContext';
import { FoodEntry } from '../../../types/tracking';

const mockEntry: FoodEntry = {
  id: 'entry-1',
  mealName: 'Test Meal',
  category: 'Lunch',
  timestamp: '2025-08-04T12:00:00.000Z',
  ingredients: [
    { id: 'ing-1', name: 'Chicken', amount: 100, unit: 'g', caloriesPer100g: 165, calculatedCalories: 165 },
  ],
  totalCalories: 165,
};

describe('EditFoodEntryModal', () => {
  it('renders with pre-filled meal name when visible', () => {
    const { getByDisplayValue } = render(
      <TrackingProvider>
        <EditFoodEntryModal entry={mockEntry} visible={true} onClose={jest.fn()} />
      </TrackingProvider>
    );
    expect(getByDisplayValue('Test Meal')).toBeTruthy();
  });

  it('does not render content when not visible', () => {
    const { queryByText } = render(
      <TrackingProvider>
        <EditFoodEntryModal entry={mockEntry} visible={false} onClose={jest.fn()} />
      </TrackingProvider>
    );
    expect(queryByText('Edit Entry')).toBeNull();
  });
});
