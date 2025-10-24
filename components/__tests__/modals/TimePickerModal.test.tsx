import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TimePickerModal from '../../TimePickerModal';

const mockProps = {
  visible: true,
  onTimeSelect: jest.fn(),
  onClose: jest.fn(),
};

describe('TimePickerModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when visible', () => {
    const { getByText } = render(<TimePickerModal {...mockProps} />);
    
    expect(getByText('Select Time')).toBeTruthy();
    expect(getByText('Close')).toBeTruthy();
  });

  it('does not render when not visible', () => {
    const { queryByText } = render(<TimePickerModal {...mockProps} visible={false} />);
    
    expect(queryByText('Select Time')).toBeNull();
  });

  it('renders all time options correctly', () => {
    const { getByText } = render(<TimePickerModal {...mockProps} />);
    
    // Test a few specific time options
    expect(getByText('00:00')).toBeTruthy();
    expect(getByText('00:15')).toBeTruthy();
    expect(getByText('00:30')).toBeTruthy();
    expect(getByText('00:45')).toBeTruthy();
    expect(getByText('12:00')).toBeTruthy();
    expect(getByText('23:45')).toBeTruthy();
  });

  it('calls onTimeSelect when a time option is pressed', () => {
    const { getByTestId } = render(<TimePickerModal {...mockProps} />);
    
    fireEvent.press(getByTestId('time-12-30'));
    
    expect(mockProps.onTimeSelect).toHaveBeenCalledTimes(1);
    expect(mockProps.onTimeSelect).toHaveBeenCalledWith(12, 30);
  });

  it('calls onTimeSelect with correct parameters for different times', () => {
    const { getByTestId } = render(<TimePickerModal {...mockProps} />);
    
    // Test morning time
    fireEvent.press(getByTestId('time-9-15'));
    expect(mockProps.onTimeSelect).toHaveBeenCalledWith(9, 15);
    
    // Test evening time
    fireEvent.press(getByTestId('time-18-45'));
    expect(mockProps.onTimeSelect).toHaveBeenCalledWith(18, 45);
    
    // Test midnight
    fireEvent.press(getByTestId('time-0-0'));
    expect(mockProps.onTimeSelect).toHaveBeenCalledWith(0, 0);
  });

  it('calls onClose when close button is pressed', () => {
    const { getByText } = render(<TimePickerModal {...mockProps} />);
    
    fireEvent.press(getByText('Close'));
    
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('generates correct number of time options', () => {
    const { getAllByText } = render(<TimePickerModal {...mockProps} />);
    
    // There should be 24 hours × 4 quarter-hour intervals = 96 time options
    // We can test this by checking for specific patterns
    const timeOptions = getAllByText(/^\d{2}:\d{2}$/);
    expect(timeOptions).toHaveLength(96);
  });

  it('formats time strings correctly', () => {
    const { getByText, queryByText } = render(<TimePickerModal {...mockProps} />);
    
    // Test that single digits are padded with zeros
    expect(getByText('09:00')).toBeTruthy(); // 9 AM should be formatted as 09:00
    expect(queryByText('09:05')).toBeFalsy(); // 9:05 shouldn't exist (only 15-minute intervals)
  });
});
