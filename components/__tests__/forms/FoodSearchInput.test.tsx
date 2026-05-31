/**
 * Tests for FoodSearchInput component.
 * Verifies search triggering, result rendering, selection, and error states.
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import FoodSearchInput from '../../../components/FoodSearchInput';
import * as offService from '../../../lib/openFoodFactsService';

jest.mock('../../../lib/openFoodFactsService');
const mockSearch = offService.searchFoodByName as jest.Mock;

const mockResult: offService.FoodSearchResult = {
  productName: 'Whole Milk',
  brand: 'Generic',
  thumbnailUrl: undefined,
  nutritionData: {
    caloriesPer100g: 61,
    proteinPer100g: 3.2,
    carbsPer100g: 4.8,
    fatPer100g: 3.3,
  },
};

beforeEach(() => {
  mockSearch.mockReset();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('FoodSearchInput', () => {
  it('renders a text input', () => {
    const { getByPlaceholderText } = render(
      <FoodSearchInput
        value=""
        onChangeText={jest.fn()}
        onSelectResult={jest.fn()}
      />
    );
    expect(getByPlaceholderText('Search ingredient or product…')).toBeTruthy();
  });

  it('does not search when value is shorter than 2 chars', async () => {
    const { getByPlaceholderText } = render(
      <FoodSearchInput value="" onChangeText={jest.fn()} onSelectResult={jest.fn()} />
    );
    fireEvent.changeText(getByPlaceholderText('Search ingredient or product…'), 'a');
    act(() => jest.advanceTimersByTime(400));
    expect(mockSearch).not.toHaveBeenCalled();
  });

  it('fires search after debounce when value >= 2 chars', async () => {
    mockSearch.mockResolvedValue([mockResult]);

    const { getByPlaceholderText } = render(
      <FoodSearchInput value="mi" onChangeText={jest.fn()} onSelectResult={jest.fn()} />
    );

    // FoodSearchInput triggers search on mount when value is already set,
    // so just advance timers past debounce
    await act(async () => {
      jest.advanceTimersByTime(400);
    });

    expect(mockSearch).toHaveBeenCalledWith('mi');
  });

  it('shows search results in a dropdown', async () => {
    mockSearch.mockResolvedValue([mockResult]);

    const { getByPlaceholderText, findByText } = render(
      <FoodSearchInput value="milk" onChangeText={jest.fn()} onSelectResult={jest.fn()} />
    );

    await act(async () => {
      jest.advanceTimersByTime(400);
    });

    const label = await findByText('Whole Milk');
    expect(label).toBeTruthy();
  });

  it('calls onSelectResult and onChangeText when a result is tapped', async () => {
    mockSearch.mockResolvedValue([mockResult]);
    const onSelectResult = jest.fn();
    const onChangeText = jest.fn();

    const { getByPlaceholderText, findByText } = render(
      <FoodSearchInput
        value="milk"
        onChangeText={onChangeText}
        onSelectResult={onSelectResult}
      />
    );

    await act(async () => {
      jest.advanceTimersByTime(400);
    });

    const resultItem = await findByText('Whole Milk');
    fireEvent.press(resultItem);

    expect(onChangeText).toHaveBeenCalledWith('Whole Milk');
    expect(onSelectResult).toHaveBeenCalledWith(mockResult);
  });

  it('shows an error message when the search fails', async () => {
    mockSearch.mockRejectedValue(new Error('Network error'));

    const { findByText } = render(
      <FoodSearchInput value="milk" onChangeText={jest.fn()} onSelectResult={jest.fn()} />
    );

    await act(async () => {
      jest.advanceTimersByTime(400);
    });

    const errMsg = await findByText(/Could not reach Open Food Facts/i);
    expect(errMsg).toBeTruthy();
  });

  it('shows kcal/100g in result metadata', async () => {
    mockSearch.mockResolvedValue([mockResult]);

    const { findByText } = render(
      <FoodSearchInput value="milk" onChangeText={jest.fn()} onSelectResult={jest.fn()} />
    );

    await act(async () => {
      jest.advanceTimersByTime(400);
    });

    // Metadata line includes "61 kcal/100g"
    const meta = await findByText(/61 kcal\/100g/);
    expect(meta).toBeTruthy();
  });
});
