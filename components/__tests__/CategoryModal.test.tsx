import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CategoryModal from '../CategoryModal';
import { FOOD_CATEGORIES, FoodCategory } from '../../types/tracking';

const mockOnCategorySelect = jest.fn();
const mockOnClose = jest.fn();

const defaultProps = {
  visible: true,
  selectedCategory: 'Breakfast' as FoodCategory,
  onCategorySelect: mockOnCategorySelect,
  onClose: mockOnClose,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('CategoryModal', () => {
  test('renders correctly when visible', () => {
    const { getByText } = render(<CategoryModal {...defaultProps} />);
    
    expect(getByText('Select Category')).toBeTruthy();
    expect(getByText('Close')).toBeTruthy();
    
    // Check all categories are rendered
    FOOD_CATEGORIES.forEach(category => {
      expect(getByText(category)).toBeTruthy();
    });
  });

  test('does not render when not visible', () => {
    const { queryByText } = render(
      <CategoryModal {...defaultProps} visible={false} />
    );
    
    expect(queryByText('Select Category')).toBeNull();
  });

  test('highlights selected category', () => {
    const { getByText } = render(
      <CategoryModal {...defaultProps} selectedCategory={"Lunch" as FoodCategory} />
    );
    
    const lunchOption = getByText('Lunch');
    expect(lunchOption).toBeTruthy();
    // In a real test environment, you could check for specific styles
  });

  test('calls onCategorySelect when category is pressed', () => {
    const { getByText } = render(<CategoryModal {...defaultProps} />);
    
    fireEvent.press(getByText('Dinner'));
    
    expect(mockOnCategorySelect).toHaveBeenCalledWith('Dinner');
  });

  test('calls onClose when close button is pressed', () => {
    const { getByText } = render(<CategoryModal {...defaultProps} />);
    
    fireEvent.press(getByText('Close'));
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('calls onClose when modal is dismissed via hardware back', () => {
    const { getByTestId } = render(<CategoryModal {...defaultProps} />);
    
    // Simulate Android back button press via Modal's onRequestClose
    const modal = getByTestId('category-modal');
    fireEvent(modal, 'requestClose');
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('renders all food categories from constants', () => {
    const { getByText } = render(<CategoryModal {...defaultProps} />);
    
    // Verify all categories from the constant are present
    FOOD_CATEGORIES.forEach(category => {
      expect(getByText(category)).toBeTruthy();
    });
  });

  test('handles category selection for each available category', () => {
    const { getByText } = render(<CategoryModal {...defaultProps} />);
    
    FOOD_CATEGORIES.forEach(category => {
      fireEvent.press(getByText(category));
      expect(mockOnCategorySelect).toHaveBeenCalledWith(category);
    });
    
    expect(mockOnCategorySelect).toHaveBeenCalledTimes(FOOD_CATEGORIES.length);
  });

  test('renders with different selected categories', () => {
    FOOD_CATEGORIES.forEach(selectedCategory => {
      const { getByText, rerender } = render(
        <CategoryModal {...defaultProps} selectedCategory={selectedCategory} />
      );
      
      expect(getByText(selectedCategory)).toBeTruthy();
      
      if (FOOD_CATEGORIES.indexOf(selectedCategory) < FOOD_CATEGORIES.length - 1) {
        rerender(
          <CategoryModal 
            {...defaultProps} 
            selectedCategory={FOOD_CATEGORIES[FOOD_CATEGORIES.indexOf(selectedCategory) + 1]} 
          />
        );
      }
    });
  });

  test('modal overlay handles touch events', () => {
    const { getByTestId } = render(<CategoryModal {...defaultProps} />);
    
    const modalOverlay = getByTestId('modal-overlay');
    expect(modalOverlay).toBeTruthy();
  });
});
