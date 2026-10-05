import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import DataExportCard from '../../DataExportCard';
import { useDataExport } from '../../../hooks/useDataExport';

jest.mock('../../../hooks/useDataExport');

const mockUseDataExport = useDataExport as jest.Mock;
const exportData = jest.fn();

const setHook = (overrides: Partial<{ exporting: boolean; error: string | null }> = {}) =>
  mockUseDataExport.mockReturnValue({ exporting: false, error: null, exportData, ...overrides });

describe('DataExportCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setHook();
  });

  it('defaults to the last 7 days', () => {
    const { getByTestId } = render(<DataExportCard />);
    fireEvent.press(getByTestId('export-data-button'));
    expect(exportData).toHaveBeenCalledWith('7d');
  });

  it.each([
    ['30d', 'export-range-30d'],
    ['all', 'export-range-all'],
  ])('exports the %s range after selecting it', (key, testID) => {
    const { getByTestId } = render(<DataExportCard />);
    fireEvent.press(getByTestId(testID));
    fireEvent.press(getByTestId('export-data-button'));
    expect(exportData).toHaveBeenCalledWith(key);
  });

  it('disables the button and shows progress while exporting', () => {
    setHook({ exporting: true });
    const { getByTestId, getByText } = render(<DataExportCard />);
    expect(getByText('Preparing…')).toBeTruthy();
    fireEvent.press(getByTestId('export-data-button'));
    expect(exportData).not.toHaveBeenCalled();
  });

  it('ignores range changes made while exporting', () => {
    setHook({ exporting: true });
    const { getByTestId, rerender } = render(<DataExportCard />);
    fireEvent.press(getByTestId('export-range-all'));

    // Same mounted component, export finished: selection must still be the default.
    setHook({ exporting: false });
    rerender(<DataExportCard />);
    fireEvent.press(getByTestId('export-data-button'));
    expect(exportData).toHaveBeenCalledWith('7d');
  });

  it('shows an error message when export fails', () => {
    setHook({ error: 'Sharing is not available on this device.' });
    const { getByTestId } = render(<DataExportCard />);
    expect(getByTestId('export-error').props.children).toBe('Sharing is not available on this device.');
  });

  it('shows no error element when there is no error', () => {
    const { queryByTestId } = render(<DataExportCard />);
    expect(queryByTestId('export-error')).toBeNull();
  });
});
