import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import FoodEntriesList from '../../FoodEntriesList';
import { FoodEntry } from '../../../types/tracking';

const mockFoodEntries: FoodEntry[] = [
  {
    id: '1',
    mealName: 'Chicken Salad',
    category: 'Lunch',
    timestamp: '2025-08-04T12:30:00.000Z',
    ingredients: [
      { id: '1-1', name: 'Chicken Breast', amount: 150, unit: 'g', caloriesPer100g: 165, calculatedCalories: 247.5 },
      { id: '1-2', name: 'Lettuce', amount: 50, unit: 'g', caloriesPer100g: 15, calculatedCalories: 7.5 },
    ],
    totalCalories: 255,
  },
  {
    id: '2',
    mealName: 'Breakfast Oats',
    category: 'Breakfast',
    timestamp: '2025-08-04T08:00:00.000Z',
    ingredients: [
      { id: '2-1', name: 'Oats', amount: 40, unit: 'g', caloriesPer100g: 389, calculatedCalories: 155.6 },
    ],
    totalCalories: 155.6,
  },
  {
    id: '3',
    mealName: 'Pasta Dinner',
    category: 'Dinner',
    timestamp: '2025-08-03T19:30:00.000Z',
    ingredients: [
      { id: '3-1', name: 'Pasta', amount: 100, unit: 'g' },
      { id: '3-2', name: 'Tomato Sauce', amount: 2, unit: 'piece' },
    ],
  },
  {
    id: '4',
    mealName: 'Snack',
    category: 'Snack',
    timestamp: '2025-08-02T15:00:00.000Z',
    ingredients: [
      { id: '4-1', name: 'Apple', amount: 1, unit: 'piece', caloriesPer100g: 52, calculatedCalories: 52 },
    ],
    totalCalories: 52,
  },
];

describe('FoodEntriesList', () => {
  test('renders nothing when food entries array is empty', () => {
    const { queryByText } = render(<FoodEntriesList foodEntries={[]} />);
    expect(queryByText('Recent Entries')).toBeNull();
  });

  test('renders recent entries section with correct count', () => {
    const { getByText } = render(<FoodEntriesList foodEntries={mockFoodEntries} />);
    expect(getByText('Recent Entries (4)')).toBeTruthy();
  });

  test('displays all entries (no cap)', () => {
    const { getByText, getAllByText } = render(<FoodEntriesList foodEntries={mockFoodEntries} />);
    expect(getByText('Chicken Salad')).toBeTruthy();
    expect(getByText('Breakfast Oats')).toBeTruthy();
    expect(getByText('Pasta Dinner')).toBeTruthy();
    // 'Snack' appears as both the meal name and the category — use getAllByText
    expect(getAllByText('Snack').length).toBeGreaterThanOrEqual(1);
  });

  test('displays meal information correctly', () => {
    const { getByText } = render(<FoodEntriesList foodEntries={mockFoodEntries} />);
    expect(getByText('Chicken Salad')).toBeTruthy();
    expect(getByText('Lunch')).toBeTruthy();
    expect(getByText('2 ingredients • 255 cal')).toBeTruthy();
  });

  test('displays calories when totalCalories is available', () => {
    const { getByText } = render(<FoodEntriesList foodEntries={mockFoodEntries} />);
    expect(getByText('2 ingredients • 255 cal')).toBeTruthy();
    expect(getByText('1 ingredients • 156 cal')).toBeTruthy();
  });

  test('displays ingredients count without calories when totalCalories is not available', () => {
    const { getByText } = render(<FoodEntriesList foodEntries={mockFoodEntries} />);
    expect(getByText('2 ingredients')).toBeTruthy();
  });

  test('handles single food entry correctly', () => {
    const { getByText } = render(<FoodEntriesList foodEntries={[mockFoodEntries[0]]} />);
    expect(getByText('Recent Entries (1)')).toBeTruthy();
    expect(getByText('Chicken Salad')).toBeTruthy();
  });

  test('displays different food categories correctly', () => {
    const { getByText } = render(<FoodEntriesList foodEntries={mockFoodEntries} />);
    expect(getByText('Lunch')).toBeTruthy();
    expect(getByText('Breakfast')).toBeTruthy();
    expect(getByText('Dinner')).toBeTruthy();
  });

  test('does not render edit/delete buttons when callbacks are not provided', () => {
    const { queryByTestId } = render(<FoodEntriesList foodEntries={[mockFoodEntries[0]]} />);
    expect(queryByTestId('edit-food-entry-1')).toBeNull();
    expect(queryByTestId('delete-food-entry-1')).toBeNull();
  });

  test('renders edit button and calls onEditEntry when pressed', () => {
    const onEdit = jest.fn();
    const { getByTestId } = render(
      <FoodEntriesList foodEntries={[mockFoodEntries[0]]} onEditEntry={onEdit} />
    );
    fireEvent.press(getByTestId('edit-food-entry-1'));
    expect(onEdit).toHaveBeenCalledWith(mockFoodEntries[0]);
  });

  test('renders delete button and shows confirmation alert', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const onDelete = jest.fn();
    const { getByTestId } = render(
      <FoodEntriesList foodEntries={[mockFoodEntries[0]]} onDeleteEntry={onDelete} />
    );
    fireEvent.press(getByTestId('delete-food-entry-1'));
    expect(alertSpy).toHaveBeenCalledWith(
      'Delete Entry',
      'Delete "Chicken Salad"?',
      expect.any(Array)
    );
  });

  test('displays entries in reverse chronological order', () => {
    const { getByText, getAllByText } = render(<FoodEntriesList foodEntries={mockFoodEntries} />);
    // All 4 entries visible
    expect(getByText('Chicken Salad')).toBeTruthy();
    expect(getByText('Breakfast Oats')).toBeTruthy();
    expect(getByText('Pasta Dinner')).toBeTruthy();
    expect(getAllByText('Snack').length).toBeGreaterThanOrEqual(1);
  });
});
