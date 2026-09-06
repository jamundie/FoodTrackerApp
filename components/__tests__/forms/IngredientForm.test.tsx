import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import IngredientForm from '../../IngredientForm';
import { Unit, IngredientFormData } from '../../../types/ingredient';

jest.spyOn(Alert, 'alert');

const mockIngredients: IngredientFormData[] = [
  { name: 'Chicken', amount: '200', unit: 'g' as Unit, caloriesRef: '165' },
];

const mockProps = {
  ingredients: mockIngredients,
  onUpdateIngredient: jest.fn(),
  onApplyNutrition: jest.fn(),
  onAddIngredient: jest.fn(),
  onRemoveIngredient: jest.fn(),
};

describe('IngredientForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the compact ingredient list', () => {
    const { getByText } = render(<IngredientForm {...mockProps} />);

    expect(getByText('Ingredients')).toBeTruthy();
    expect(getByText('Chicken')).toBeTruthy();
    expect(getByText('200 g')).toBeTruthy();
  });

  it('shows the add ingredient button', () => {
    const { getByTestId } = render(<IngredientForm {...mockProps} />);
    expect(getByTestId('add-ingredient-button')).toBeTruthy();
  });

  it('shows edit and delete icons for each ingredient row', () => {
    const { getByTestId } = render(<IngredientForm {...mockProps} />);

    expect(getByTestId('edit-ingredient-0')).toBeTruthy();
    expect(getByTestId('delete-ingredient-0')).toBeTruthy();
  });

  it('opens the add-ingredient modal when "+ Add Ingredient" is pressed', () => {
    const { getByTestId, getByText } = render(<IngredientForm {...mockProps} />);

    fireEvent.press(getByTestId('add-ingredient-button'));

    expect(getByText('Add Ingredient')).toBeTruthy();
  });

  it('calls onAddIngredient and writes fields when saving a new ingredient', () => {
    const { getByTestId, getByPlaceholderText } = render(<IngredientForm {...mockProps} />);

    fireEvent.press(getByTestId('add-ingredient-button'));

    fireEvent.changeText(getByPlaceholderText('Search ingredient or product…'), 'Rice');
    fireEvent.changeText(getByPlaceholderText('Amount'), '100');
    fireEvent.press(getByTestId('add-ingredient-modal-save'));

    expect(mockProps.onAddIngredient).toHaveBeenCalledTimes(1);
    // New ingredient is appended at index === current length (1)
    expect(mockProps.onUpdateIngredient).toHaveBeenCalledWith(1, 'name', 'Rice');
    expect(mockProps.onUpdateIngredient).toHaveBeenCalledWith(1, 'amount', '100');
  });

  it('shows Add Another / Done after saving a new ingredient', () => {
    const { getByTestId, getByPlaceholderText, getByText } = render(<IngredientForm {...mockProps} />);

    fireEvent.press(getByTestId('add-ingredient-button'));
    fireEvent.changeText(getByPlaceholderText('Search ingredient or product…'), 'Rice');
    fireEvent.changeText(getByPlaceholderText('Amount'), '100');
    fireEvent.press(getByTestId('add-ingredient-modal-save'));

    expect(getByText('Ingredient added')).toBeTruthy();
    expect(getByTestId('add-ingredient-modal-add-another')).toBeTruthy();
    expect(getByTestId('add-ingredient-modal-done')).toBeTruthy();
  });

  it('opens the modal pre-filled when editing an existing ingredient', () => {
    const { getByTestId, getByDisplayValue } = render(<IngredientForm {...mockProps} />);

    fireEvent.press(getByTestId('edit-ingredient-0'));

    expect(getByDisplayValue('Chicken')).toBeTruthy();
    expect(getByDisplayValue('200')).toBeTruthy();
    expect(getByDisplayValue('165')).toBeTruthy();
  });

  it('updates the ingredient in place on Save when editing (no add-another prompt)', () => {
    const { getByTestId, getByDisplayValue, queryByText } = render(<IngredientForm {...mockProps} />);

    fireEvent.press(getByTestId('edit-ingredient-0'));
    fireEvent.changeText(getByDisplayValue('Chicken'), 'Beef');
    fireEvent.press(getByTestId('add-ingredient-modal-save'));

    expect(mockProps.onUpdateIngredient).toHaveBeenCalledWith(0, 'name', 'Beef');
    expect(queryByText('Ingredient added')).toBeNull();
  });

  it('shows a delete confirmation Alert when the trash icon is pressed', () => {
    const { getByTestId } = render(<IngredientForm {...mockProps} />);

    fireEvent.press(getByTestId('delete-ingredient-0'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Delete ingredient?',
      expect.stringContaining('Chicken'),
      expect.any(Array)
    );
  });

  it('calls onRemoveIngredient after confirming delete', () => {
    const { getByTestId } = render(<IngredientForm {...mockProps} />);

    fireEvent.press(getByTestId('delete-ingredient-0'));

    // Simulate pressing "Delete" in the Alert
    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const deleteButton = alertCall[2].find((b: any) => b.text === 'Delete');
    deleteButton.onPress();

    expect(mockProps.onRemoveIngredient).toHaveBeenCalledWith(0);
  });

  it('shows the barcode scan icon in the add-ingredient modal', () => {
    const { getByTestId } = render(<IngredientForm {...mockProps} />);

    fireEvent.press(getByTestId('add-ingredient-button'));

    // BarcodeScannerModal itself is exercised in its own test suite; here we
    // only verify the scan entry point is wired up and pressable.
    expect(getByTestId('scan-barcode-button')).toBeTruthy();
    fireEvent.press(getByTestId('scan-barcode-button'));
  });
});
