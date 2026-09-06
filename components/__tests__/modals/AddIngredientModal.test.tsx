import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AddIngredientModal from '../../AddIngredientModal';
import { IngredientFormData } from '../../../types/ingredient';

jest.spyOn(Alert, 'alert');

describe('AddIngredientModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('food mode — add flow', () => {
    it('renders the food search input and barcode scan icon', () => {
      const { getByPlaceholderText, getByTestId } = render(
        <AddIngredientModal visible={true} mode="food" onSave={jest.fn()} onClose={jest.fn()} />
      );

      expect(getByPlaceholderText('Search ingredient or product…')).toBeTruthy();
      expect(getByTestId('scan-barcode-button')).toBeTruthy();
    });

    it('shows an error when saving without a name or amount', () => {
      const onSave = jest.fn();
      const { getByTestId } = render(
        <AddIngredientModal visible={true} mode="food" onSave={onSave} onClose={jest.fn()} />
      );

      fireEvent.press(getByTestId('add-ingredient-modal-save'));

      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Please enter an ingredient name and amount'
      );
      expect(onSave).not.toHaveBeenCalled();
    });

    it('calls onSave with the draft and shows Add Another / Done on success', () => {
      const onSave = jest.fn();
      const { getByPlaceholderText, getByTestId, getByText } = render(
        <AddIngredientModal visible={true} mode="food" onSave={onSave} onClose={jest.fn()} />
      );

      fireEvent.changeText(getByPlaceholderText('Search ingredient or product…'), 'Chicken');
      fireEvent.changeText(getByPlaceholderText('Amount'), '200');
      fireEvent.press(getByTestId('add-ingredient-modal-save'));

      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Chicken', amount: '200', unit: 'g' })
      );
      expect(getByText('Ingredient added')).toBeTruthy();
      expect(getByTestId('add-ingredient-modal-add-another')).toBeTruthy();
      expect(getByTestId('add-ingredient-modal-done')).toBeTruthy();
    });

    it('resets to a blank form when "Add Another" is pressed', () => {
      const onSave = jest.fn();
      const { getByPlaceholderText, getByTestId, queryByText } = render(
        <AddIngredientModal visible={true} mode="food" onSave={onSave} onClose={jest.fn()} />
      );

      fireEvent.changeText(getByPlaceholderText('Search ingredient or product…'), 'Chicken');
      fireEvent.changeText(getByPlaceholderText('Amount'), '200');
      fireEvent.press(getByTestId('add-ingredient-modal-save'));

      fireEvent.press(getByTestId('add-ingredient-modal-add-another'));

      expect(queryByText('Ingredient added')).toBeNull();
      expect(getByPlaceholderText('Search ingredient or product…').props.value).toBe('');
      expect(getByPlaceholderText('Amount').props.value).toBe('');
    });

    it('calls onClose when "Done" is pressed', () => {
      const onClose = jest.fn();
      const { getByPlaceholderText, getByTestId } = render(
        <AddIngredientModal visible={true} mode="food" onSave={jest.fn()} onClose={onClose} />
      );

      fireEvent.changeText(getByPlaceholderText('Search ingredient or product…'), 'Chicken');
      fireEvent.changeText(getByPlaceholderText('Amount'), '200');
      fireEvent.press(getByTestId('add-ingredient-modal-save'));
      fireEvent.press(getByTestId('add-ingredient-modal-done'));

      expect(onClose).toHaveBeenCalled();
    });

    it('calls onClose when Cancel is pressed', () => {
      const onClose = jest.fn();
      const { getByTestId } = render(
        <AddIngredientModal visible={true} mode="food" onSave={jest.fn()} onClose={onClose} />
      );

      fireEvent.press(getByTestId('add-ingredient-modal-cancel'));

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('food mode — edit flow', () => {
    const initialData: IngredientFormData = {
      name: 'Chicken',
      amount: '200',
      unit: 'g',
      caloriesRef: '165',
    };

    it('pre-fills the form from initialData', () => {
      const { getByDisplayValue, getByText } = render(
        <AddIngredientModal
          visible={true}
          mode="food"
          initialData={initialData}
          onSave={jest.fn()}
          onClose={jest.fn()}
        />
      );

      expect(getByText('Edit Ingredient')).toBeTruthy();
      expect(getByDisplayValue('Chicken')).toBeTruthy();
      expect(getByDisplayValue('200')).toBeTruthy();
      expect(getByDisplayValue('165')).toBeTruthy();
    });

    it('calls onSave once and onClose immediately — no Add Another prompt', () => {
      const onSave = jest.fn();
      const onClose = jest.fn();
      const { getByDisplayValue, getByTestId, queryByText } = render(
        <AddIngredientModal
          visible={true}
          mode="food"
          initialData={initialData}
          onSave={onSave}
          onClose={onClose}
        />
      );

      fireEvent.changeText(getByDisplayValue('Chicken'), 'Beef');
      fireEvent.press(getByTestId('add-ingredient-modal-save'));

      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ name: 'Beef' }));
      expect(onClose).toHaveBeenCalled();
      expect(queryByText('Ingredient added')).toBeNull();
    });
  });

  describe('water mode', () => {
    it('renders a plain text field instead of the food search input', () => {
      const { getByPlaceholderText, queryByTestId } = render(
        <AddIngredientModal visible={true} mode="water" onSave={jest.fn()} onClose={jest.fn()} />
      );

      expect(getByPlaceholderText('e.g., Lemon juice, Protein powder')).toBeTruthy();
      expect(queryByTestId('scan-barcode-button')).toBeNull();
    });

    it('defaults the unit to ml', () => {
      const onSave = jest.fn();
      const { getByPlaceholderText, getByTestId } = render(
        <AddIngredientModal visible={true} mode="water" onSave={onSave} onClose={jest.fn()} />
      );

      fireEvent.changeText(getByPlaceholderText('e.g., Lemon juice, Protein powder'), 'Lemon juice');
      fireEvent.changeText(getByPlaceholderText('Amount'), '30');
      fireEvent.press(getByTestId('add-ingredient-modal-save'));

      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ unit: 'ml' }));
    });
  });

  describe('visibility', () => {
    it('renders nothing when visible is false', () => {
      const { queryByText } = render(
        <AddIngredientModal visible={false} mode="food" onSave={jest.fn()} onClose={jest.fn()} />
      );

      expect(queryByText('Add Ingredient')).toBeNull();
    });
  });
});
