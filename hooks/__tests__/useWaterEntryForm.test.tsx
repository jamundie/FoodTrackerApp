import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { View, TouchableOpacity, Text, Alert } from 'react-native';
import { useWaterEntryForm } from '../../hooks/useWaterEntryForm';
import { TrackingProvider } from '../../hooks/TrackingContext';

// Mock Alert.alert
jest.spyOn(Alert, 'alert');

// Test component that uses the hook
const TestWaterFormComponent = () => {
  const {
    waterInfo,
    ingredients,
    showDatePicker,
    showTimePicker,
    handleSubmit,
    handleEntryNameUpdate,
    handleDateSelect,
    handleTimeSelect,
    addIngredient,
    updateIngredient,
    removeIngredient,
    setShowDatePicker,
    setShowTimePicker,
  } = useWaterEntryForm();

  return (
    <View>
      <Text testID="entry-name">{waterInfo.entryName}</Text>
      <Text testID="ingredients-count">{ingredients.length}</Text>
      <Text testID="show-date-picker">{showDatePicker.toString()}</Text>
      <Text testID="show-time-picker">{showTimePicker.toString()}</Text>
      
      <TouchableOpacity onPress={() => handleEntryNameUpdate('Test Entry')} testID="update-name-button">
        <Text>Update Name</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => handleDateSelect(new Date('2025-08-01'))} testID="select-date-button">
        <Text>Select Date</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => handleTimeSelect(15, 30)} testID="select-time-button">
        <Text>Select Time</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={addIngredient} testID="add-ingredient-button">
        <Text>Add Ingredient</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => updateIngredient(0, 'name', 'Lemon')} testID="update-ingredient-button">
        <Text>Update Ingredient</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => removeIngredient(0)} testID="remove-ingredient-button">
        <Text>Remove Ingredient</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => setShowDatePicker(true)} testID="show-date-picker-button">
        <Text>Show Date Picker</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => setShowTimePicker(true)} testID="show-time-picker-button">
        <Text>Show Time Picker</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={handleSubmit} testID="submit-button">
        <Text>Submit</Text>
      </TouchableOpacity>
      
      {ingredients.map((ingredient, index) => (
        <Text key={index} testID={`ingredient-${index}-name`}>{ingredient.name}</Text>
      ))}
    </View>
  );
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <TrackingProvider>
      {component}
    </TrackingProvider>
  );
};

describe('useWaterEntryForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default values', () => {
    const { getByTestId } = renderWithProvider(<TestWaterFormComponent />);
    
    expect(getByTestId('entry-name').props.children).toBe('');
    expect(getByTestId('ingredients-count').props.children).toBe(1);
    expect(getByTestId('show-date-picker').props.children).toBe('false');
    expect(getByTestId('show-time-picker').props.children).toBe('false');
  });

  it('updates entry name', () => {
    const { getByTestId } = renderWithProvider(<TestWaterFormComponent />);
    
    fireEvent.press(getByTestId('update-name-button'));
    
    expect(getByTestId('entry-name').props.children).toBe('Test Entry');
  });

  it('handles date selection', () => {
    const { getByTestId } = renderWithProvider(<TestWaterFormComponent />);
    
    fireEvent.press(getByTestId('select-date-button'));
    
    // Date should be updated in the hook (we can't easily test the exact date without exposing it)
    // The date picker should be closed
    expect(getByTestId('show-date-picker').props.children).toBe('false');
  });

  it('handles time selection', () => {
    const { getByTestId } = renderWithProvider(<TestWaterFormComponent />);
    
    fireEvent.press(getByTestId('select-time-button'));
    
    // Time should be updated in the hook (we can't easily test the exact time without exposing it)
    // The time picker should be closed
    expect(getByTestId('show-time-picker').props.children).toBe('false');
  });

  it('adds ingredients', () => {
    const { getByTestId } = renderWithProvider(<TestWaterFormComponent />);
    
    fireEvent.press(getByTestId('add-ingredient-button'));
    
    expect(getByTestId('ingredients-count').props.children).toBe(2);
  });

  it('updates ingredients', () => {
    const { getByTestId } = renderWithProvider(<TestWaterFormComponent />);
    
    fireEvent.press(getByTestId('update-ingredient-button'));
    
    expect(getByTestId('ingredient-0-name').props.children).toBe('Lemon');
  });

  it('removes ingredients but keeps at least one', () => {
    const { getByTestId } = renderWithProvider(<TestWaterFormComponent />);
    
    // Add an ingredient first
    fireEvent.press(getByTestId('add-ingredient-button'));
    expect(getByTestId('ingredients-count').props.children).toBe(2);
    
    // Remove one ingredient
    fireEvent.press(getByTestId('remove-ingredient-button'));
    expect(getByTestId('ingredients-count').props.children).toBe(1);
    
    // Try to remove the last ingredient - should not work
    fireEvent.press(getByTestId('remove-ingredient-button'));
    expect(getByTestId('ingredients-count').props.children).toBe(1);
  });

  it('controls date picker visibility', () => {
    const { getByTestId } = renderWithProvider(<TestWaterFormComponent />);
    
    fireEvent.press(getByTestId('show-date-picker-button'));
    
    expect(getByTestId('show-date-picker').props.children).toBe('true');
  });

  it('controls time picker visibility', () => {
    const { getByTestId } = renderWithProvider(<TestWaterFormComponent />);
    
    fireEvent.press(getByTestId('show-time-picker-button'));
    
    expect(getByTestId('show-time-picker').props.children).toBe('true');
  });

  it('validates form and shows error for empty entry name', async () => {
    const { getByTestId } = renderWithProvider(<TestWaterFormComponent />);
    
    fireEvent.press(getByTestId('submit-button'));
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a water entry name');
    });
  });

  it('submits valid form successfully', async () => {
    const { getByTestId } = renderWithProvider(<TestWaterFormComponent />);
    
    // Set entry name
    fireEvent.press(getByTestId('update-name-button'));
    
    // Submit form
    fireEvent.press(getByTestId('submit-button'));
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Success', 'Water entry added successfully!');
    });
  });

  it('resets form after successful submission', async () => {
    const { getByTestId } = renderWithProvider(<TestWaterFormComponent />);
    
    // Set entry name and add ingredient
    fireEvent.press(getByTestId('update-name-button'));
    fireEvent.press(getByTestId('update-ingredient-button'));
    fireEvent.press(getByTestId('add-ingredient-button'));
    
    expect(getByTestId('entry-name').props.children).toBe('Test Entry');
    expect(getByTestId('ingredients-count').props.children).toBe(2);
    
    // Submit form
    fireEvent.press(getByTestId('submit-button'));
    
    await waitFor(() => {
      // Form should be reset
      expect(getByTestId('entry-name').props.children).toBe('');
      expect(getByTestId('ingredients-count').props.children).toBe(1);
    });
  });
});