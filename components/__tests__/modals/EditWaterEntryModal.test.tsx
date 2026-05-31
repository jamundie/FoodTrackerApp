import React from 'react';
import { render } from '@testing-library/react-native';
import EditWaterEntryModal from '../../EditWaterEntryModal';
import { TrackingProvider } from '../../../hooks/TrackingContext';
import { WaterEntry } from '../../../types/tracking';

const mockEntry: WaterEntry = {
  id: 'water-1',
  entryName: 'Morning Glass',
  timestamp: '2025-08-04T08:00:00.000Z',
  ingredients: [],
  volumePresetId: 'glass',
  volumeMl: 250,
  totalVolume: 250,
};

describe('EditWaterEntryModal', () => {
  it('renders with pre-filled entry name when visible', () => {
    const { getByDisplayValue } = render(
      <TrackingProvider>
        <EditWaterEntryModal entry={mockEntry} visible={true} onClose={jest.fn()} />
      </TrackingProvider>
    );
    expect(getByDisplayValue('Morning Glass')).toBeTruthy();
  });

  it('does not render content when not visible', () => {
    const { queryByText } = render(
      <TrackingProvider>
        <EditWaterEntryModal entry={mockEntry} visible={false} onClose={jest.fn()} />
      </TrackingProvider>
    );
    expect(queryByText('Edit Water Entry')).toBeNull();
  });
});
