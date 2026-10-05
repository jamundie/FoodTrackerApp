import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { useDataExport } from '../useDataExport';
import { useTracking } from '../TrackingContext';
import { shareWorkbook } from '../../utils/exportWorkbook';

jest.mock('../TrackingContext');
jest.mock('../../utils/exportWorkbook');

const mockUseTracking = useTracking as jest.Mock;
const mockShare = shareWorkbook as jest.Mock;

const ts = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
};

describe('useDataExport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockShare.mockResolvedValue(undefined);
    mockUseTracking.mockReturnValue({
      data: {
        foodEntries: [{
          id: 'f1', mealName: 'Toast', category: 'Breakfast', timestamp: ts(1),
          ingredients: [], totalCalories: 200,
        }],
        waterEntries: [],
        bowelEntries: [],
      },
      userProfile: null,
    });
  });

  it('builds the workbook for the chosen range and shares it', async () => {
    const { result } = renderHook(() => useDataExport());
    await act(async () => {
      await result.current.exportData('7d');
    });

    expect(mockShare).toHaveBeenCalledTimes(1);
    const [sheets, range] = mockShare.mock.calls[0];
    expect(range.key).toBe('7d');
    expect(sheets.food).toHaveLength(2); // header + Toast
    expect(result.current.exporting).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('exposes the error message and resets exporting when sharing fails', async () => {
    mockShare.mockRejectedValueOnce(new Error('Sharing is not available on this device.'));
    const { result } = renderHook(() => useDataExport());
    await act(async () => {
      await result.current.exportData('30d');
    });

    expect(result.current.error).toBe('Sharing is not available on this device.');
    expect(result.current.exporting).toBe(false);
  });

  it('clears a previous error on the next attempt', async () => {
    mockShare.mockRejectedValueOnce(new Error('boom'));
    const { result } = renderHook(() => useDataExport());
    await act(async () => {
      await result.current.exportData('all');
    });
    expect(result.current.error).toBe('boom');

    await act(async () => {
      await result.current.exportData('all');
    });
    expect(result.current.error).toBeNull();
  });
});
