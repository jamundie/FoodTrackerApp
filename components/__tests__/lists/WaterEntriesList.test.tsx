import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import WaterEntriesList from '../../WaterEntriesList';
import { WaterEntry } from '../../../types/tracking';

const mockWaterEntries: WaterEntry[] = [
  {
    id: '1',
    entryName: 'Morning hydration',
    timestamp: '2025-08-04T08:00:00.000Z',
    ingredients: [
      { id: '1-1', name: 'Lemon juice', amount: 30, unit: 'ml', caloriesPer100g: 22, calculatedCalories: 6.6 },
    ],
    volumePresetId: 'glass',
    volumeMl: 250,
    totalVolume: 280,
  },
  {
    id: '2',
    entryName: 'Post-workout drink',
    timestamp: '2025-08-04T15:30:00.000Z',
    ingredients: [
      { id: '2-1', name: 'Protein powder', amount: 25, unit: 'g', caloriesPer100g: 380, calculatedCalories: 95 },
      { id: '2-2', name: 'Water', amount: 500, unit: 'ml' },
    ],
    volumePresetId: 'pint',
    volumeMl: 568,
    totalVolume: 1068,
  },
  {
    id: '3',
    entryName: 'Plain water',
    timestamp: '2025-08-03T12:00:00.000Z',
    ingredients: [],
    volumePresetId: 'glass',
    volumeMl: 250,
    totalVolume: 250,
  },
  {
    id: '4',
    entryName: 'Evening tea',
    timestamp: '2025-08-02T20:00:00.000Z',
    ingredients: [
      { id: '4-1', name: 'Honey', amount: 1, unit: 'piece', caloriesPer100g: 304, calculatedCalories: 304 },
    ],
    volumePresetId: 'cup_regular',
    volumeMl: 240,
    totalVolume: 240,
  },
];

describe('WaterEntriesList', () => {
  it('renders nothing when no water entries', () => {
    const { queryByText } = render(<WaterEntriesList waterEntries={[]} />);
    expect(queryByText('Recent Water Entries')).toBeNull();
  });

  it('displays all entries (no cap)', () => {
    const { getByText } = render(<WaterEntriesList waterEntries={mockWaterEntries} />);
    expect(getByText('Morning hydration')).toBeTruthy();
    expect(getByText('Post-workout drink')).toBeTruthy();
    expect(getByText('Plain water')).toBeTruthy();
    expect(getByText('Evening tea')).toBeTruthy();
  });

  it('displays section title with correct count', () => {
    const { getByText } = render(<WaterEntriesList waterEntries={mockWaterEntries} />);
    expect(getByText('Recent Water Entries (4)')).toBeTruthy();
  });

  it('displays ingredients count and volume when available', () => {
    const { getByText, getAllByText } = render(<WaterEntriesList waterEntries={mockWaterEntries} />);
    expect(getByText('1 Glass • 280 ml')).toBeTruthy();
    // '1 ingredient' appears for entries 1 and 4 — use getAllByText
    expect(getAllByText('1 ingredient').length).toBeGreaterThanOrEqual(1);
    expect(getByText('1 Pint • 1068 ml')).toBeTruthy();
    expect(getByText('2 ingredients')).toBeTruthy();
  });

  it('displays volume even when there are no ingredients', () => {
    const { getByText } = render(<WaterEntriesList waterEntries={mockWaterEntries} />);
    expect(getByText('1 Glass • 250 ml')).toBeTruthy();
  });

  it('does not display ingredients line when no ingredients', () => {
    const { queryByText } = render(<WaterEntriesList waterEntries={mockWaterEntries} />);
    expect(queryByText('0 ingredients')).toBeNull();
  });

  it('does not render edit/delete buttons when callbacks are not provided', () => {
    const { queryByTestId } = render(<WaterEntriesList waterEntries={[mockWaterEntries[0]]} />);
    expect(queryByTestId('edit-water-entry-1')).toBeNull();
    expect(queryByTestId('delete-water-entry-1')).toBeNull();
  });

  it('renders edit button and calls onEditEntry when pressed', () => {
    const onEdit = jest.fn();
    const { getByTestId } = render(
      <WaterEntriesList waterEntries={[mockWaterEntries[0]]} onEditEntry={onEdit} />
    );
    fireEvent.press(getByTestId('edit-water-entry-1'));
    expect(onEdit).toHaveBeenCalledWith(mockWaterEntries[0]);
  });

  it('renders delete button and shows confirmation alert', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const onDelete = jest.fn();
    const { getByTestId } = render(
      <WaterEntriesList waterEntries={[mockWaterEntries[0]]} onDeleteEntry={onDelete} />
    );
    fireEvent.press(getByTestId('delete-water-entry-1'));
    expect(alertSpy).toHaveBeenCalledWith(
      'Delete Entry',
      'Delete "Morning hydration"?',
      expect.any(Array)
    );
  });

  it('uses correct plural form for ingredients', () => {
    const { getByText } = render(
      <WaterEntriesList waterEntries={[mockWaterEntries[0]]} />
    );
    expect(getByText('1 ingredient')).toBeTruthy();
  });
});
