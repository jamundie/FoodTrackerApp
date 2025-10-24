import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { View, TouchableOpacity, Text } from 'react-native';
import { TrackingProvider, useTracking } from '../TrackingContext';
import { FoodEntry, WaterEntry } from '../../types/tracking';

// Test component that uses the context
const TestTrackingComponent = () => {
  const { data, addWater, addFoodEntry, addWaterEntry } = useTracking();

  const mockFoodEntry: FoodEntry = {
    id: '1',
    mealName: 'Test Meal',
    category: 'Lunch',
    timestamp: '2025-08-04T12:00:00.000Z',
    ingredients: [],
  };

  const mockWaterEntry: WaterEntry = {
    id: '1',
    entryName: 'Test Water Entry',
    timestamp: '2025-08-04T14:00:00.000Z',
    ingredients: [],
  };

  return (
    <View>
      <Text testID="water-intake">{data.waterIntake}</Text>
      <Text testID="food-entries-count">{data.foodEntries.length}</Text>
      <Text testID="water-entries-count">{data.waterEntries.length}</Text>
      
      <TouchableOpacity onPress={addWater} testID="add-water-button">
        <Text>Add Water</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => addFoodEntry(mockFoodEntry)} testID="add-food-entry-button">
        <Text>Add Food Entry</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => addWaterEntry(mockWaterEntry)} testID="add-water-entry-button">
        <Text>Add Water Entry</Text>
      </TouchableOpacity>
    </View>
  );
};

describe('TrackingContext', () => {
  it('provides initial state', () => {
    const { getByTestId } = render(
      <TrackingProvider>
        <TestTrackingComponent />
      </TrackingProvider>
    );
    
    expect(getByTestId('water-intake').props.children).toBe(0);
    expect(getByTestId('food-entries-count').props.children).toBe(0);
    expect(getByTestId('water-entries-count').props.children).toBe(0);
  });

  it('increments water intake', () => {
    const { getByTestId } = render(
      <TrackingProvider>
        <TestTrackingComponent />
      </TrackingProvider>
    );
    
    fireEvent.press(getByTestId('add-water-button'));
    
    expect(getByTestId('water-intake').props.children).toBe(1);
    
    fireEvent.press(getByTestId('add-water-button'));
    
    expect(getByTestId('water-intake').props.children).toBe(2);
  });

  it('adds food entries', () => {
    const { getByTestId } = render(
      <TrackingProvider>
        <TestTrackingComponent />
      </TrackingProvider>
    );
    
    fireEvent.press(getByTestId('add-food-entry-button'));
    
    expect(getByTestId('food-entries-count').props.children).toBe(1);
    
    fireEvent.press(getByTestId('add-food-entry-button'));
    
    expect(getByTestId('food-entries-count').props.children).toBe(2);
  });

  it('adds water entries', () => {
    const { getByTestId } = render(
      <TrackingProvider>
        <TestTrackingComponent />
      </TrackingProvider>
    );
    
    fireEvent.press(getByTestId('add-water-entry-button'));
    
    expect(getByTestId('water-entries-count').props.children).toBe(1);
    
    fireEvent.press(getByTestId('add-water-entry-button'));
    
    expect(getByTestId('water-entries-count').props.children).toBe(2);
  });

  it('maintains separate counters for water intake and entries', () => {
    const { getByTestId } = render(
      <TrackingProvider>
        <TestTrackingComponent />
      </TrackingProvider>
    );
    
    // Add simple water intake
    fireEvent.press(getByTestId('add-water-button'));
    fireEvent.press(getByTestId('add-water-button'));
    
    // Add water entries
    fireEvent.press(getByTestId('add-water-entry-button'));
    
    expect(getByTestId('water-intake').props.children).toBe(2);
    expect(getByTestId('water-entries-count').props.children).toBe(1);
  });

  it('throws error when used outside provider', () => {
    // Mock console.error to avoid test output pollution
    const originalError = console.error;
    console.error = jest.fn();
    
    const TestComponentWithoutProvider = () => {
      try {
        useTracking();
        return <Text>Should not render</Text>;
      } catch (error) {
        return <Text testID="error">{(error as Error).message}</Text>;
      }
    };
    
    const { getByTestId } = render(<TestComponentWithoutProvider />);
    
    expect(getByTestId('error').props.children).toBe('useTracking must be used within a TrackingProvider');
    
    // Restore console.error
    console.error = originalError;
  });

  it('preserves existing data when adding new entries', () => {
    const { getByTestId } = render(
      <TrackingProvider>
        <TestTrackingComponent />
      </TrackingProvider>
    );
    
    // Add water intake
    fireEvent.press(getByTestId('add-water-button'));
    
    // Add food entry
    fireEvent.press(getByTestId('add-food-entry-button'));
    
    // Add water entry
    fireEvent.press(getByTestId('add-water-entry-button'));
    
    // All should be preserved
    expect(getByTestId('water-intake').props.children).toBe(1);
    expect(getByTestId('food-entries-count').props.children).toBe(1);
    expect(getByTestId('water-entries-count').props.children).toBe(1);
  });
});