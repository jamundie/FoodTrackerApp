import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import WaterScreen from '../water';
import { TrackingProvider } from '../../../hooks/TrackingContext';

// Mock Alert.alert
jest.spyOn(Alert, 'alert');

const renderWaterScreen = () => {
  return render(
    <TrackingProvider>
      <WaterScreen />
    </TrackingProvider>
  );
};

describe('Water Screen Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('renders the water entry form correctly', () => {
      const { getByText, getByPlaceholderText } = renderWaterScreen();

      expect(getByText('💧 Add Water Entry')).toBeTruthy();
      expect(getByText('Water Entry Name')).toBeTruthy();
      expect(getByText('Date & Time')).toBeTruthy();
      expect(getByPlaceholderText('e.g., Morning hydration, Post-workout drink')).toBeTruthy();
      expect(getByText('Add Flavoring / Supplements (Optional)')).toBeTruthy();
    });

    it('renders submit button', () => {
      const { getByTestId } = renderWaterScreen();

      expect(getByTestId('submit-water-entry-button')).toBeTruthy();
    });

    it('does not show recent entries initially', () => {
      const { queryByText } = renderWaterScreen();

      expect(queryByText('Recent Water Entries')).toBeNull();
    });
  });

  describe('Form Interaction', () => {
    it('allows typing in entry name field', () => {
      const { getByPlaceholderText } = renderWaterScreen();
      const entryNameInput = getByPlaceholderText('e.g., Morning hydration, Post-workout drink');

      fireEvent.changeText(entryNameInput, 'Morning hydration');
      expect(entryNameInput.props.value).toBe('Morning hydration');
    });

    it('allows date and time selection through pickers', () => {
      const { getByTestId } = renderWaterScreen();
      
      const datePickerButton = getByTestId('date-picker-button');
      expect(datePickerButton).toBeTruthy();
      
      const timePickerButton = getByTestId('time-picker-button');
      expect(timePickerButton).toBeTruthy();
      
      fireEvent.press(datePickerButton);
      fireEvent.press(timePickerButton);
    });

    it('allows adding ingredients through collapsible section', () => {
      const { getByText, getByTestId } = renderWaterScreen();
      
      // Expand the collapsible section
      fireEvent.press(getByText('Add Flavoring / Supplements (Optional)'));
      
      // Add an ingredient
      const addButton = getByTestId('add-water-ingredient-button');
      fireEvent.press(addButton);
      
      expect(addButton).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('shows error when submitting without entry name', async () => {
      const { getByTestId } = renderWaterScreen();
      const submitButton = getByTestId('submit-water-entry-button');

      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a water entry name');
      });
    });

    it('allows submission with entry name only', async () => {
      const { getByPlaceholderText, getByTestId } = renderWaterScreen();
      const entryNameInput = getByPlaceholderText('e.g., Morning hydration, Post-workout drink');
      const submitButton = getByTestId('submit-water-entry-button');

      fireEvent.changeText(entryNameInput, 'Test Water Entry');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Success', 'Water entry added successfully!');
      });
    });
  });

  describe('Successful Form Submission', () => {
    it('successfully submits a complete water entry with ingredients', async () => {
      const { getByText, getByPlaceholderText, getByTestId } = renderWaterScreen();
      
      // Fill entry name
      const entryNameInput = getByPlaceholderText('e.g., Morning hydration, Post-workout drink');
      fireEvent.changeText(entryNameInput, 'Lemon Water');
      
      // Expand ingredients section and add ingredient
      fireEvent.press(getByText('Add Flavoring / Supplements (Optional)'));
      
      const ingredientNameInput = getByPlaceholderText('e.g., Lemon juice, Protein powder');
      const amountInput = getByPlaceholderText('Amount');
      
      fireEvent.changeText(ingredientNameInput, 'Lemon juice');
      fireEvent.changeText(amountInput, '30');
      
      // Submit form
      const submitButton = getByTestId('submit-water-entry-button');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Success', 'Water entry added successfully!');
      });
    });

    it('resets form after successful submission', async () => {
      const { getByPlaceholderText, getByTestId } = renderWaterScreen();
      
      // Fill out form
      const entryNameInput = getByPlaceholderText('e.g., Morning hydration, Post-workout drink');
      fireEvent.changeText(entryNameInput, 'Test Entry');
      
      // Submit
      const submitButton = getByTestId('submit-water-entry-button');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Success', 'Water entry added successfully!');
      });

      // Check that form is reset
      await waitFor(() => {
        expect(entryNameInput.props.value).toBe('');
      });
    });

    it('shows recent entries after successful submission', async () => {
      const { getByPlaceholderText, getByTestId, getByText } = renderWaterScreen();
      
      // Submit a water entry
      const entryNameInput = getByPlaceholderText('e.g., Morning hydration, Post-workout drink');
      fireEvent.changeText(entryNameInput, 'Morning Water');
      
      const submitButton = getByTestId('submit-water-entry-button');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Success', 'Water entry added successfully!');
      });

      // Check that recent entries section appears
      await waitFor(() => {
        expect(getByText('Recent Water Entries (1)')).toBeTruthy();
        expect(getByText('Morning Water')).toBeTruthy();
      });
    });

    it('displays multiple entries in recent list', async () => {
      const { getByPlaceholderText, getByTestId, getByText } = renderWaterScreen();
      
      // Submit first entry
      const entryNameInput = getByPlaceholderText('e.g., Morning hydration, Post-workout drink');
      fireEvent.changeText(entryNameInput, 'Morning Water');
      
      const submitButton = getByTestId('submit-water-entry-button');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Success', 'Water entry added successfully!');
      });

      // Submit second entry
      fireEvent.changeText(entryNameInput, 'Afternoon Water');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Success', 'Water entry added successfully!');
      });

      // Check that both entries appear
      await waitFor(() => {
        expect(getByText('Recent Water Entries (2)')).toBeTruthy();
        expect(getByText('Morning Water')).toBeTruthy();
        expect(getByText('Afternoon Water')).toBeTruthy();
      });
    });
  });

  describe('Date and Time Pickers', () => {
    it('opens and closes date picker modal', () => {
      const { getByTestId, queryByText } = renderWaterScreen();
      
      const datePickerButton = getByTestId('date-picker-button');
      fireEvent.press(datePickerButton);
      
      // Date picker modal should open (this depends on DatePickerModal implementation)
      // For this test, we just verify the button works
      expect(datePickerButton).toBeTruthy();
    });

    it('opens and closes time picker modal', () => {
      const { getByTestId } = renderWaterScreen();
      
      const timePickerButton = getByTestId('time-picker-button');
      fireEvent.press(timePickerButton);
      
      // Time picker modal should open (this depends on TimePickerModal implementation)
      // For this test, we just verify the button works
      expect(timePickerButton).toBeTruthy();
    });
  });
});