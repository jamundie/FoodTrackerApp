import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useTracking } from './TrackingContext';
import { FoodCategory } from '../types/tracking';
import { IngredientFormData } from '../components/IngredientForm';
import { MealInfoData } from '../components/MealInfoForm';
import { processIngredients, createFoodEntry } from '../utils/foodHelpers';
import { createTimestamp } from '../utils/dateUtils';

export const useFoodEntryForm = () => {
  const { addFoodEntry } = useTracking();
  
  const [mealInfo, setMealInfo] = useState<MealInfoData>({
    mealName: "",
    category: "",
    selectedDate: new Date(),
    selectedTime: { hours: new Date().getHours(), minutes: 0 },
  });
  
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  const [ingredients, setIngredients] = useState<IngredientFormData[]>([
    { name: "", amount: "", unit: "g", caloriesPer100g: "" },
  ]);

  const addIngredient = useCallback(() => {
    setIngredients(prev => [
      ...prev,
      { name: "", amount: "", unit: "g", caloriesPer100g: "" },
    ]);
  }, []);

  const updateIngredient = useCallback((index: number, field: keyof IngredientFormData, value: string) => {
    setIngredients(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  const removeIngredient = useCallback((index: number) => {
    setIngredients(prev => {
      if (prev.length > 1) {
        return prev.filter((_, i) => i !== index);
      }
      return prev;
    });
  }, []);

  const handleCategorySelect = useCallback((selectedCategory: FoodCategory) => {
    setMealInfo(prev => ({
      ...prev,
      category: selectedCategory,
    }));
    setShowCategoryDropdown(false);
  }, []);

  const handleDateSelect = useCallback((date: Date) => {
    setMealInfo(prev => ({
      ...prev,
      selectedDate: date,
    }));
    setShowDatePicker(false);
  }, []);

  const handleTimeSelect = useCallback((hours: number, minutes: number) => {
    setMealInfo(prev => ({
      ...prev,
      selectedTime: { hours, minutes },
    }));
    setShowTimePicker(false);
  }, []);

  const handleMealNameUpdate = useCallback((name: string) => {
    setMealInfo(prev => ({
      ...prev,
      mealName: name,
    }));
  }, []);

  const validateForm = useCallback((): boolean => {
    if (!mealInfo.mealName.trim()) {
      Alert.alert("Error", "Please enter a meal name");
      return false;
    }

    if (!mealInfo.category) {
      Alert.alert("Error", "Please select a category");
      return false;
    }

    const validIngredients = ingredients.filter(
      (ingredient) => ingredient.name.trim() && ingredient.amount.trim()
    );

    if (validIngredients.length === 0) {
      Alert.alert("Error", "Please add at least one ingredient");
      return false;
    }

    return true;
  }, [mealInfo, ingredients]);

  const resetForm = useCallback(() => {
    setMealInfo({
      mealName: "",
      category: "",
      selectedDate: new Date(),
      selectedTime: { hours: new Date().getHours(), minutes: 0 },
    });
    setShowCategoryDropdown(false);
    setIngredients([{ name: "", amount: "", unit: "g", caloriesPer100g: "" }]);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!validateForm()) {
      return;
    }

    const processedIngredients = processIngredients(ingredients);
    const timestamp = createTimestamp(mealInfo.selectedDate, mealInfo.selectedTime);
    const foodEntry = createFoodEntry(
      mealInfo.mealName,
      mealInfo.category as FoodCategory,
      timestamp,
      processedIngredients
    );

    addFoodEntry(foodEntry);
    resetForm();
    Alert.alert("Success", "Food entry added successfully!");
  }, [mealInfo, ingredients, addFoodEntry, validateForm, resetForm]);

  return {
    // State
    mealInfo,
    ingredients,
    showCategoryDropdown,
    showDatePicker,
    showTimePicker,
    
    // Handlers
    handleSubmit,
    handleMealNameUpdate,
    handleCategorySelect,
    handleDateSelect,
    handleTimeSelect,
    addIngredient,
    updateIngredient,
    removeIngredient,
    
    // Modal controls
    setShowCategoryDropdown,
    setShowDatePicker,
    setShowTimePicker,
  };
};
