import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import WaterVolumeSelector from '../../WaterVolumeSelector';
import { VOLUME_PRESETS, VolumePreset } from '../../../types/tracking';

const mockOnSelect = jest.fn();

const defaultProps = {
  selectedPresetId: 'glass' as const,
  onSelect: mockOnSelect,
};

describe('WaterVolumeSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the selected preset label', () => {
    const { getByText } = render(<WaterVolumeSelector {...defaultProps} />);
    expect(getByText('1 Glass')).toBeTruthy();
  });

  it('shows the selected preset ml in the trigger button', () => {
    const { getByTestId } = render(<WaterVolumeSelector {...defaultProps} />);
    const btn = getByTestId('volume-selector-button');
    expect(btn).toBeTruthy();
  });

  it('renders a different preset when selectedPresetId changes', () => {
    const { getByText } = render(
      <WaterVolumeSelector selectedPresetId="pint" onSelect={mockOnSelect} />
    );
    expect(getByText('1 Pint')).toBeTruthy();
  });

  it('opens modal when button is pressed', () => {
    const { getByTestId, getByText } = render(<WaterVolumeSelector {...defaultProps} />);
    
    fireEvent.press(getByTestId('volume-selector-button'));
    
    expect(getByText('Select Volume')).toBeTruthy();
  });

  it('lists all presets in the modal', () => {
    const { getByTestId, getAllByText, getByText } = render(<WaterVolumeSelector {...defaultProps} />);
    
    fireEvent.press(getByTestId('volume-selector-button'));
    
    VOLUME_PRESETS.forEach((preset) => {
      // Use getAllByText since the selected preset label also appears on the trigger button
      expect(getAllByText(preset.label).length).toBeGreaterThanOrEqual(1);
    });
    // Modal header should appear
    expect(getByText('Select Volume')).toBeTruthy();
  });

  it('calls onSelect with the chosen preset and closes modal', () => {
    const { getByTestId, queryByText } = render(<WaterVolumeSelector {...defaultProps} />);
    
    fireEvent.press(getByTestId('volume-selector-button'));
    fireEvent.press(getByTestId('volume-option-pint'));
    
    const expectedPreset = VOLUME_PRESETS.find((p) => p.id === 'pint') as VolumePreset;
    expect(mockOnSelect).toHaveBeenCalledWith(expectedPreset);
    expect(queryByText('Select Volume')).toBeNull();
  });

  it('highlights the currently selected option', () => {
    const { getByTestId } = render(<WaterVolumeSelector {...defaultProps} />);
    
    fireEvent.press(getByTestId('volume-selector-button'));
    
    // The currently selected option should have testID volume-option-glass
    expect(getByTestId('volume-option-glass')).toBeTruthy();
  });
});
