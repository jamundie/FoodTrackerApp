import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import IngredientForm, { IngredientFormData } from '../IngredientForm';
import { Unit } from '../../types/tracking';

const mockIngredients: IngredientFormData[] = [
  { name: 'Chicken', amount: '200', unit: 'g' as Unit, caloriesPer100g: '165' },
];

const mockProps = {
  ingredients: mockIngredients,
  onUpdateIngredient: jest.fn(),
  onAddIngredient: jest.fn(),
  onRemoveIngredient: jest.fn(),
};

describe('IngredientForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with ingredients', () => {
    const { getByText, getByDisplayValue } = render(<IngredientForm {...mockProps} />);
    
    expect(getByText('Ingredients')).toBeTruthy();
    expect(getByText('Ingredient 1')).toBeTruthy();
    expect(getByDisplayValue('Chicken')).toBeTruthy();
    expect(getByDisplayValue('200')).toBeTruthy();
    expect(getByDisplayValue('165')).toBeTruthy();
  });

  it('calls onAddIngredient when add button is pressed', () => {
    const { getByTestId } = render(<IngredientForm {...mockProps} />);
    
    fireEvent.press(getByTestId('add-ingredient-button'));
    
    expect(mockProps.onAddIngredient).toHaveBeenCalledTimes(1);
  });

  it('calls onUpdateIngredient when ingredient name is changed', () => {
    const { getByDisplayValue } = render(<IngredientForm {...mockProps} />);
    
    fireEvent.changeText(getByDisplayValue('Chicken'), 'Beef');
    
    expect(mockProps.onUpdateIngredient).toHaveBeenCalledWith(0, 'name', 'Beef');
  });

  it('calls onRemoveIngredient when remove button is pressed', () => {
    const multipleIngredients = [
      ...mockIngredients,
      { name: 'Rice', amount: '100', unit: 'g' as Unit, caloriesPer100g: '130' },
    ];
    
    const { getByTestId } = render(
      <IngredientForm {...mockProps} ingredients={multipleIngredients} />
    );
    
    fireEvent.press(getByTestId('remove-ingredient-0'));
    
    expect(mockProps.onRemoveIngredient).toHaveBeenCalledWith(0);
  });

  it('does not show remove button for single ingredient', () => {
    const { queryByText } = render(<IngredientForm {...mockProps} />);
    
    expect(queryByText('Remove')).toBeNull();
  });

  it('shows remove button for multiple ingredients', () => {
    const multipleIngredients = [
      ...mockIngredients,
      { name: 'Rice', amount: '100', unit: 'g' as Unit, caloriesPer100g: '130' },
    ];
    
    const { getAllByText } = render(
      <IngredientForm {...mockProps} ingredients={multipleIngredients} />
    );
    
    expect(getAllByText('Remove')).toHaveLength(2);
  });

  it('calls onUpdateIngredient when unit is changed', () => {
    const { getByText } = render(<IngredientForm {...mockProps} />);
    
    fireEvent.press(getByText('ml'));
    
    expect(mockProps.onUpdateIngredient).toHaveBeenCalledWith(0, 'unit', 'ml');
  });
});
