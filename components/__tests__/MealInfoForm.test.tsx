import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MealInfoForm, { MealInfoData } from '../MealInfoForm';
import { FoodCategory } from '../../types/tracking';

const mockMealInfo: MealInfoData = {
  mealName: 'Test Meal',
  category: 'Lunch' as FoodCategory,
  selectedDate: new Date('2023-08-01'),
  selectedTime: { hours: 12, minutes: 30 },
};

const mockProps = {
  mealInfo: mockMealInfo,
  onUpdateMealName: jest.fn(),
  onShowCategoryDropdown: jest.fn(),
  onShowDatePicker: jest.fn(),
  onShowTimePicker: jest.fn(),
  formatDisplayDate: jest.fn().mockReturnValue('Today'),
  formatDisplayTime: jest.fn().mockReturnValue('12:30 PM'),
};

describe('MealInfoForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with meal info', () => {
    const { getByText, getByDisplayValue } = render(<MealInfoForm {...mockProps} />);
    
    expect(getByText('Meal Name')).toBeTruthy();
    expect(getByText('Category')).toBeTruthy();
    expect(getByText('Date & Time')).toBeTruthy();
    expect(getByDisplayValue('Test Meal')).toBeTruthy();
    expect(getByText('Lunch')).toBeTruthy();
    expect(getByText('Today')).toBeTruthy();
    expect(getByText('12:30 PM')).toBeTruthy();
  });

  it('calls onUpdateMealName when meal name is changed', () => {
    const { getByDisplayValue } = render(<MealInfoForm {...mockProps} />);
    
    fireEvent.changeText(getByDisplayValue('Test Meal'), 'New Meal Name');
    
    expect(mockProps.onUpdateMealName).toHaveBeenCalledWith('New Meal Name');
  });

  it('calls onShowCategoryDropdown when category button is pressed', () => {
    const { getByText } = render(<MealInfoForm {...mockProps} />);
    
    fireEvent.press(getByText('Lunch'));
    
    expect(mockProps.onShowCategoryDropdown).toHaveBeenCalledTimes(1);
  });

  it('calls onShowDatePicker when date button is pressed', () => {
    const { getByTestId } = render(<MealInfoForm {...mockProps} />);
    
    fireEvent.press(getByTestId('date-picker-button'));
    
    expect(mockProps.onShowDatePicker).toHaveBeenCalledTimes(1);
  });

  it('calls onShowTimePicker when time button is pressed', () => {
    const { getByTestId } = render(<MealInfoForm {...mockProps} />);
    
    fireEvent.press(getByTestId('time-picker-button'));
    
    expect(mockProps.onShowTimePicker).toHaveBeenCalledTimes(1);
  });

  it('shows placeholder text when no category is selected', () => {
    const emptyMealInfo = {
      ...mockMealInfo,
      category: '' as FoodCategory | '',
    };
    
    const { getByText } = render(
      <MealInfoForm {...mockProps} mealInfo={emptyMealInfo} />
    );
    
    expect(getByText('Select a category')).toBeTruthy();
  });

  it('calls formatDisplayDate with correct date', () => {
    render(<MealInfoForm {...mockProps} />);
    
    expect(mockProps.formatDisplayDate).toHaveBeenCalledWith(mockMealInfo.selectedDate);
  });

  it('calls formatDisplayTime with correct time values', () => {
    render(<MealInfoForm {...mockProps} />);
    
    expect(mockProps.formatDisplayTime).toHaveBeenCalledWith(
      mockMealInfo.selectedTime.hours,
      mockMealInfo.selectedTime.minutes
    );
  });
});
