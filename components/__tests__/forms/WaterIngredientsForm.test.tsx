import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import WaterIngredientsForm from '../../WaterIngredientsForm';
import { Unit, IngredientFormData } from '../../../types/ingredient';

jest.spyOn(Alert, 'alert');

const mockIngredients: IngredientFormData[] = [
  { name: 'Lemon juice', amount: '30', unit: 'ml' as Unit, caloriesRef: '22' },
];

const mockProps = {
  ingredients: mockIngredients,
  onUpdateIngredient: jest.fn(),
  onAddIngredient: jest.fn(),
  onRemoveIngredient: jest.fn(),
};

const openCollapsible = (getByText: any) =>
  fireEvent.press(getByText('Add Flavoring / Supplements (Optional)'));

describe('WaterIngredientsForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the compact ingredient list within the collapsible accordion', () => {
    const { getByText } = render(<WaterIngredientsForm {...mockProps} />);

    openCollapsible(getByText);

    expect(getByText('Add Flavoring / Supplements (Optional)')).toBeTruthy();
    expect(getByText('Lemon juice')).toBeTruthy();
    expect(getByText('30 ml')).toBeTruthy();
  });

  it('shows edit and delete icons for each ingredient row', () => {
    const { getByText, getByTestId } = render(<WaterIngredientsForm {...mockProps} />);

    openCollapsible(getByText);

    expect(getByTestId('edit-water-ingredient-0')).toBeTruthy();
    expect(getByTestId('delete-water-ingredient-0')).toBeTruthy();
  });

  it('opens the add-ingredient modal when "+ Add Ingredient" is pressed', () => {
    const { getByText, getByTestId } = render(<WaterIngredientsForm {...mockProps} />);

    openCollapsible(getByText);
    fireEvent.press(getByTestId('add-water-ingredient-button'));

    expect(getByText('Add Ingredient')).toBeTruthy();
  });

  it('uses the water-specific placeholder text in the modal', () => {
    const { getByText, getByTestId, getByPlaceholderText } = render(
      <WaterIngredientsForm {...mockProps} />
    );

    openCollapsible(getByText);
    fireEvent.press(getByTestId('add-water-ingredient-button'));

    expect(getByPlaceholderText('e.g., Lemon juice, Protein powder')).toBeTruthy();
  });

  it('calls onAddIngredient and writes fields when saving a new ingredient', () => {
    const { getByText, getByTestId, getByPlaceholderText } = render(
      <WaterIngredientsForm {...mockProps} />
    );

    openCollapsible(getByText);
    fireEvent.press(getByTestId('add-water-ingredient-button'));

    fireEvent.changeText(getByPlaceholderText('e.g., Lemon juice, Protein powder'), 'Lime juice');
    fireEvent.changeText(getByPlaceholderText('Amount'), '50');
    fireEvent.press(getByTestId('add-ingredient-modal-save'));

    expect(mockProps.onAddIngredient).toHaveBeenCalledTimes(1);
    expect(mockProps.onUpdateIngredient).toHaveBeenCalledWith(1, 'name', 'Lime juice');
    expect(mockProps.onUpdateIngredient).toHaveBeenCalledWith(1, 'amount', '50');
  });

  it('opens the modal pre-filled when editing an existing ingredient', () => {
    const { getByText, getByTestId, getByDisplayValue } = render(
      <WaterIngredientsForm {...mockProps} />
    );

    openCollapsible(getByText);
    fireEvent.press(getByTestId('edit-water-ingredient-0'));

    expect(getByDisplayValue('Lemon juice')).toBeTruthy();
    expect(getByDisplayValue('30')).toBeTruthy();
    expect(getByDisplayValue('22')).toBeTruthy();
  });

  it('updates the ingredient in place on Save when editing', () => {
    const { getByText, getByTestId, getByDisplayValue } = render(
      <WaterIngredientsForm {...mockProps} />
    );

    openCollapsible(getByText);
    fireEvent.press(getByTestId('edit-water-ingredient-0'));
    fireEvent.changeText(getByDisplayValue('Lemon juice'), 'Lime juice');
    fireEvent.press(getByTestId('add-ingredient-modal-save'));

    expect(mockProps.onUpdateIngredient).toHaveBeenCalledWith(0, 'name', 'Lime juice');
  });

  it('shows a delete confirmation Alert when the trash icon is pressed', () => {
    const { getByText, getByTestId } = render(<WaterIngredientsForm {...mockProps} />);

    openCollapsible(getByText);
    fireEvent.press(getByTestId('delete-water-ingredient-0'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Delete ingredient?',
      expect.stringContaining('Lemon juice'),
      expect.any(Array)
    );
  });

  it('calls onRemoveIngredient after confirming delete', () => {
    const { getByText, getByTestId } = render(<WaterIngredientsForm {...mockProps} />);

    openCollapsible(getByText);
    fireEvent.press(getByTestId('delete-water-ingredient-0'));

    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const deleteButton = alertCall[2].find((b: any) => b.text === 'Delete');
    deleteButton.onPress();

    expect(mockProps.onRemoveIngredient).toHaveBeenCalledWith(0);
  });

  it('does not render any ingredient rows when the list is empty', () => {
    const { getByText, queryByTestId } = render(
      <WaterIngredientsForm {...mockProps} ingredients={[]} />
    );

    openCollapsible(getByText);

    expect(queryByTestId('edit-water-ingredient-0')).toBeNull();
  });
});
