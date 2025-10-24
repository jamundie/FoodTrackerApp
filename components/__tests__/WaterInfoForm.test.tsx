import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import WaterInfoForm, { WaterInfoData } from '../WaterInfoForm';

const mockWaterInfo: WaterInfoData = {
  entryName: 'Test Water Entry',
  selectedDate: new Date('2023-08-01'),
  selectedTime: { hours: 14, minutes: 30 },
};

const mockProps = {
  waterInfo: mockWaterInfo,
  onUpdateEntryName: jest.fn(),
  onShowDatePicker: jest.fn(),
  onShowTimePicker: jest.fn(),
  formatDisplayDate: jest.fn().mockReturnValue('Today'),
  formatDisplayTime: jest.fn().mockReturnValue('2:30 PM'),
};

describe('WaterInfoForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with water info', () => {
    const { getByText, getByDisplayValue } = render(<WaterInfoForm {...mockProps} />);
    
    expect(getByText('Water Entry Name')).toBeTruthy();
    expect(getByText('Date & Time')).toBeTruthy();
    expect(getByDisplayValue('Test Water Entry')).toBeTruthy();
    expect(getByText('Today')).toBeTruthy();
    expect(getByText('2:30 PM')).toBeTruthy();
  });

  it('does not render category field', () => {
    const { queryByText } = render(<WaterInfoForm {...mockProps} />);
    
    expect(queryByText('Category')).toBeNull();
  });

  it('calls onUpdateEntryName when entry name is changed', () => {
    const { getByDisplayValue } = render(<WaterInfoForm {...mockProps} />);
    
    fireEvent.changeText(getByDisplayValue('Test Water Entry'), 'New Water Entry');
    
    expect(mockProps.onUpdateEntryName).toHaveBeenCalledWith('New Water Entry');
  });

  it('calls onShowDatePicker when date button is pressed', () => {
    const { getByTestId } = render(<WaterInfoForm {...mockProps} />);
    
    fireEvent.press(getByTestId('date-picker-button'));
    
    expect(mockProps.onShowDatePicker).toHaveBeenCalled();
  });

  it('calls onShowTimePicker when time button is pressed', () => {
    const { getByTestId } = render(<WaterInfoForm {...mockProps} />);
    
    fireEvent.press(getByTestId('time-picker-button'));
    
    expect(mockProps.onShowTimePicker).toHaveBeenCalled();
  });

  it('displays placeholder text for entry name', () => {
    const emptyWaterInfo = { ...mockWaterInfo, entryName: '' };
    const { getByPlaceholderText } = render(
      <WaterInfoForm {...mockProps} waterInfo={emptyWaterInfo} />
    );
    
    expect(getByPlaceholderText('e.g., Morning hydration, Post-workout drink')).toBeTruthy();
  });

  it('calls format functions with correct parameters', () => {
    render(<WaterInfoForm {...mockProps} />);
    
    expect(mockProps.formatDisplayDate).toHaveBeenCalledWith(mockWaterInfo.selectedDate);
    expect(mockProps.formatDisplayTime).toHaveBeenCalledWith(
      mockWaterInfo.selectedTime.hours, 
      mockWaterInfo.selectedTime.minutes
    );
  });
});