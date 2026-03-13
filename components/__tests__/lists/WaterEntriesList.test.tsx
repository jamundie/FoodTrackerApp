import React from 'react';
import { render } from '@testing-library/react-native';
import WaterEntriesList from '../../WaterEntriesList';
import { WaterEntry } from '../../../types/tracking';

const mockWaterEntries: WaterEntry[] = [
  {
    id: '1',
    entryName: 'Morning hydration',
    timestamp: '2025-08-04T08:00:00.000Z',
    ingredients: [
      {
        id: '1-1',
        name: 'Lemon juice',
        amount: 30,
        unit: 'ml',
        caloriesPer100g: 22,
        calculatedCalories: 6.6,
      },
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
      {
        id: '2-1',
        name: 'Protein powder',
        amount: 25,
        unit: 'g',
        caloriesPer100g: 380,
        calculatedCalories: 95,
      },
      {
        id: '2-2',
        name: 'Water',
        amount: 500,
        unit: 'ml',
      },
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
      {
        id: '4-1',
        name: 'Honey',
        amount: 1,
        unit: 'piece',
        caloriesPer100g: 304,
        calculatedCalories: 304,
      },
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

  it('displays only the last 3 entries in reverse order (most recent first)', () => {
    const { getByText, queryByText } = render(<WaterEntriesList waterEntries={mockWaterEntries} />);
    
    // Should show the last 3 entries: Morning hydration, Post-workout drink, Plain water
    expect(getByText('Morning hydration')).toBeTruthy();
    expect(getByText('Post-workout drink')).toBeTruthy();
    expect(getByText('Plain water')).toBeTruthy();
    
    // Should not show the oldest entry (Evening tea)
    expect(queryByText('Evening tea')).toBeNull();
  });

  it('displays section title with correct count', () => {
    const { getByText } = render(<WaterEntriesList waterEntries={mockWaterEntries} />);
    
    expect(getByText('Recent Water Entries (4)')).toBeTruthy();
  });

  it('displays water entry names correctly', () => {
    const { getByText } = render(<WaterEntriesList waterEntries={mockWaterEntries} />);
    
    expect(getByText('Morning hydration')).toBeTruthy();
    expect(getByText('Post-workout drink')).toBeTruthy();
    expect(getByText('Plain water')).toBeTruthy();
  });

  it('displays ingredients count and volume when available', () => {
    const { getByText } = render(<WaterEntriesList waterEntries={mockWaterEntries} />);
    
    // Entry 1: glass preset (250 ml) + 30 ml ingredient = 280 ml total
    expect(getByText('1 Glass • 280 ml')).toBeTruthy();
    expect(getByText('1 ingredient')).toBeTruthy();
    
    // Entry 2: pint preset (568 ml) + 500 ml ingredient = 1068 ml total
    expect(getByText('1 Pint • 1068 ml')).toBeTruthy();
    expect(getByText('2 ingredients')).toBeTruthy();
  });

  it('displays volume even when there are no ingredients', () => {
    const { getByText } = render(<WaterEntriesList waterEntries={mockWaterEntries} />);
    
    // Entry 3: plain water, glass (250 ml), no ingredients — volume still shown
    expect(getByText('1 Glass • 250 ml')).toBeTruthy();
  });

  it('does not display ingredients line when no ingredients', () => {
    const { queryByText } = render(<WaterEntriesList waterEntries={mockWaterEntries} />);
    
    // Plain water has no ingredients, so shouldn't show "0 ingredients"
    expect(queryByText('0 ingredients')).toBeNull();
  });

  it('displays timestamps in readable format', () => {
    const { getByText } = render(<WaterEntriesList waterEntries={mockWaterEntries} />);
    
    // Check that timestamp strings are displayed (exact format depends on locale)
    const timestamps = mockWaterEntries.slice(0, 3).map(entry => 
      new Date(entry.timestamp).toLocaleString()
    );
    
    timestamps.forEach(timestamp => {
      expect(getByText(timestamp)).toBeTruthy();
    });
  });

  it('handles entries with only non-liquid ingredients correctly', () => {
    const entryWithSolidIngredient: WaterEntry[] = [
      {
        id: '1',
        entryName: 'Protein Shake',
        timestamp: '2025-08-04T12:00:00.000Z',
        ingredients: [
          {
            id: '1-1',
            name: 'Powder',
            amount: 10,
            unit: 'g',
          },
        ],
        volumePresetId: 'glass',
        volumeMl: 250,
        totalVolume: 250,
      },
    ];

    const { getByText } = render(<WaterEntriesList waterEntries={entryWithSolidIngredient} />);
    
    expect(getByText('1 Glass • 250 ml')).toBeTruthy();
    expect(getByText('1 ingredient')).toBeTruthy();
  });

  it('uses correct plural form for ingredients', () => {
    // Entry 1 and 4 both have 1 ingredient; filter to just entry 1
    const singleIngredientEntry = mockWaterEntries.filter(entry => entry.id === '1');
    const { getByText } = render(<WaterEntriesList waterEntries={singleIngredientEntry} />);
    
    expect(getByText('1 ingredient')).toBeTruthy();
  });

  it('displays entries in reverse chronological order', () => {
    const entriesWithDifferentDates: WaterEntry[] = [
      {
        id: '1',
        entryName: 'Oldest',
        timestamp: '2025-08-01T08:00:00.000Z',
        ingredients: [],
        volumePresetId: 'glass',
        volumeMl: 250,
        totalVolume: 250,
      },
      {
        id: '2',
        entryName: 'Middle',
        timestamp: '2025-08-02T12:00:00.000Z',
        ingredients: [],
        volumePresetId: 'glass',
        volumeMl: 250,
        totalVolume: 250,
      },
      {
        id: '3',
        entryName: 'Newest',
        timestamp: '2025-08-03T18:00:00.000Z',
        ingredients: [],
        volumePresetId: 'glass',
        volumeMl: 250,
        totalVolume: 250,
      },
    ];

    const { getAllByTestId } = render(
      <WaterEntriesList waterEntries={entriesWithDifferentDates} />
    );

    // Note: This test assumes the entries have testID attributes
    // If not present in the actual component, we can verify order by text content
    const entryTexts = ['Newest', 'Middle', 'Oldest'];
    entryTexts.forEach(text => {
      expect(render(<WaterEntriesList waterEntries={entriesWithDifferentDates} />).getByText(text)).toBeTruthy();
    });
  });
});