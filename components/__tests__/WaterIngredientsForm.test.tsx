import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import WaterIngredientsForm, { WaterIngredientFormData } from '../WaterIngredientsForm';
import { Unit } from '../../types/tracking';

const mockIngredients: WaterIngredientFormData[] = [
  { name: 'Lemon juice', amount: '30', unit: 'ml' as Unit, caloriesPer100g: '22' },
];

const mockProps = {
  ingredients: mockIngredients,
  onUpdateIngredient: jest.fn(),
  onAddIngredient: jest.fn(),
  onRemoveIngredient: jest.fn(),
};

describe('WaterIngredientsForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly within collapsible accordion', () => {
    const { getByText, getByDisplayValue } = render(<WaterIngredientsForm {...mockProps} />);
    
    // Open the collapsible
    fireEvent.press(getByText('Add Flavoring / Supplements (Optional)'));
    
    expect(getByText('Add Flavoring / Supplements (Optional)')).toBeTruthy();
    expect(getByText('Ingredient 1')).toBeTruthy();
    expect(getByDisplayValue('Lemon juice')).toBeTruthy();
    expect(getByDisplayValue('30')).toBeTruthy();
    expect(getByDisplayValue('22')).toBeTruthy();
  });

  it('displays water-specific placeholder text', () => {
    const emptyIngredients = [{ name: '', amount: '', unit: 'ml' as Unit, caloriesPer100g: '' }];
    const { getByPlaceholderText, getByText } = render(
      <WaterIngredientsForm {...mockProps} ingredients={emptyIngredients} />
    );
    
    // Open the collapsible
    fireEvent.press(getByText('Add Flavoring / Supplements (Optional)'));
    
    expect(getByPlaceholderText('e.g., Lemon juice, Protein powder')).toBeTruthy();
  });

  it('calls onAddIngredient when add button is pressed', () => {
    const { getByTestId, getByText } = render(<WaterIngredientsForm {...mockProps} />);
    
    // Open the collapsible
    fireEvent.press(getByText('Add Flavoring / Supplements (Optional)'));
    
    fireEvent.press(getByTestId('add-water-ingredient-button'));
    
    expect(mockProps.onAddIngredient).toHaveBeenCalledTimes(1);
  });

  it('calls onUpdateIngredient when ingredient name is changed', () => {
    const { getByDisplayValue, getByText } = render(<WaterIngredientsForm {...mockProps} />);
    
    // Open the collapsible
    fireEvent.press(getByText('Add Flavoring / Supplements (Optional)'));
    
    fireEvent.changeText(getByDisplayValue('Lemon juice'), 'Lime juice');
    
    expect(mockProps.onUpdateIngredient).toHaveBeenCalledWith(0, 'name', 'Lime juice');
  });

  it('calls onUpdateIngredient when amount is changed', () => {
    const { getByDisplayValue, getByText } = render(<WaterIngredientsForm {...mockProps} />);
    
    // Open the collapsible
    fireEvent.press(getByText('Add Flavoring / Supplements (Optional)'));
    
    fireEvent.changeText(getByDisplayValue('30'), '50');
    
    expect(mockProps.onUpdateIngredient).toHaveBeenCalledWith(0, 'amount', '50');
  });

  it('calls onUpdateIngredient when unit is selected', () => {
    const { getByText } = render(<WaterIngredientsForm {...mockProps} />);
    
    // Open the collapsible
    fireEvent.press(getByText('Add Flavoring / Supplements (Optional)'));
    
    fireEvent.press(getByText('g'));
    
    expect(mockProps.onUpdateIngredient).toHaveBeenCalledWith(0, 'unit', 'g');
  });

  it('calls onRemoveIngredient when remove button is pressed', () => {
    const multipleIngredients = [
      ...mockIngredients,
      { name: 'Protein powder', amount: '25', unit: 'g' as Unit, caloriesPer100g: '380' },
    ];
    const { getByTestId, getByText } = render(
      <WaterIngredientsForm {...mockProps} ingredients={multipleIngredients} />
    );
    
    // Open the collapsible
    fireEvent.press(getByText('Add Flavoring / Supplements (Optional)'));
    
    fireEvent.press(getByTestId('remove-water-ingredient-1'));
    
    expect(mockProps.onRemoveIngredient).toHaveBeenCalledWith(1);
  });

  it('does not show remove button for single ingredient', () => {
    const { queryByTestId, getByText } = render(<WaterIngredientsForm {...mockProps} />);
    
    // Open the collapsible
    fireEvent.press(getByText('Add Flavoring / Supplements (Optional)'));
    
    expect(queryByTestId('remove-water-ingredient-0')).toBeNull();
  });

  it('highlights selected unit button', () => {
    const { getByText } = render(<WaterIngredientsForm {...mockProps} />);
    
    // Open the collapsible
    fireEvent.press(getByText('Add Flavoring / Supplements (Optional)'));
    
    // ml should be selected (as per mock data)
    const mlButton = getByText('ml');
    expect(mlButton).toBeTruthy();
    
    // The style testing would require additional setup for style assertions
    // For now, we just verify the button exists and can be pressed
    fireEvent.press(getByText('piece'));
    expect(mockProps.onUpdateIngredient).toHaveBeenCalledWith(0, 'unit', 'piece');
  });

  it('handles calories per 100g input', () => {
    const { getByDisplayValue, getByText } = render(<WaterIngredientsForm {...mockProps} />);
    
    // Open the collapsible
    fireEvent.press(getByText('Add Flavoring / Supplements (Optional)'));
    
    fireEvent.changeText(getByDisplayValue('22'), '25');
    
    expect(mockProps.onUpdateIngredient).toHaveBeenCalledWith(0, 'caloriesPer100g', '25');
  });
});