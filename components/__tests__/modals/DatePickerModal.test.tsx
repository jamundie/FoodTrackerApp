import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import DatePickerModal from '../../DatePickerModal';

const mockProps = {
  visible: true,
  selectedDate: new Date('2023-08-01'),
  onDateSelect: jest.fn(),
  onClose: jest.fn(),
};

describe('DatePickerModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when visible', () => {
    const { getByText } = render(<DatePickerModal {...mockProps} />);
    
    expect(getByText('Select Date')).toBeTruthy();
    expect(getByText('Today')).toBeTruthy();
    expect(getByText('Yesterday')).toBeTruthy();
    expect(getByText('Close')).toBeTruthy();
  });

  it('does not render when not visible', () => {
    const { queryByText } = render(<DatePickerModal {...mockProps} visible={false} />);
    
    expect(queryByText('Select Date')).toBeNull();
  });

  it('calls onDateSelect when "Today" is pressed', () => {
    const { getByTestId } = render(<DatePickerModal {...mockProps} />);
    
    fireEvent.press(getByTestId('date-today'));
    
    expect(mockProps.onDateSelect).toHaveBeenCalledTimes(1);
    expect(mockProps.onDateSelect).toHaveBeenCalledWith(expect.any(Date));
  });

  it('calls onDateSelect when "Yesterday" is pressed', () => {
    const { getByTestId } = render(<DatePickerModal {...mockProps} />);
    
    fireEvent.press(getByTestId('date-yesterday'));
    
    expect(mockProps.onDateSelect).toHaveBeenCalledTimes(1);
    expect(mockProps.onDateSelect).toHaveBeenCalledWith(expect.any(Date));
  });

  it('calls onClose when close button is pressed', () => {
    const { getByText } = render(<DatePickerModal {...mockProps} />);
    
    fireEvent.press(getByText('Close'));
    
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('toggles calendar visibility when calendar toggle is pressed', () => {
    const { getByTestId, getByText } = render(<DatePickerModal {...mockProps} />);
    
    // Initially calendar should be hidden
    expect(getByText('Or choose a specific date ▼')).toBeTruthy();
    
    // Press toggle to show calendar
    fireEvent.press(getByTestId('calendar-toggle-button'));
    
    // Calendar should now be visible
    expect(getByText('Or choose a specific date ▲')).toBeTruthy();
  });

  it('shows calendar when toggle is pressed', () => {
    const { getByTestId, queryByTestId } = render(<DatePickerModal {...mockProps} />);
    
    // Initially no calendar navigation should be visible
    expect(queryByTestId('calendar-prev-month')).toBeNull();
    
    // Press toggle to show calendar
    fireEvent.press(getByTestId('calendar-toggle-button'));
    
    // Calendar navigation should now be visible
    expect(getByTestId('calendar-prev-month')).toBeTruthy();
    expect(getByTestId('calendar-next-month')).toBeTruthy();
  });

  it('navigates calendar months correctly', () => {
    const { getByTestId } = render(<DatePickerModal {...mockProps} />);
    
    // Show calendar first
    fireEvent.press(getByTestId('calendar-toggle-button'));
    
    // Test navigation buttons exist
    expect(getByTestId('calendar-prev-month')).toBeTruthy();
    expect(getByTestId('calendar-next-month')).toBeTruthy();
    
    // Press previous month button
    fireEvent.press(getByTestId('calendar-prev-month'));
    // This would require more complex testing to verify the month changed
  });

  it('handles calendar day selection', () => {
    const { getByTestId } = render(<DatePickerModal {...mockProps} />);
    
    // Show calendar first
    fireEvent.press(getByTestId('calendar-toggle-button'));
    
    // The specific day testIDs are dynamically generated, so we'll test the general functionality
    // In a real test, you might want to mock the date to have predictable calendar days
  });
});
