import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useTracking } from './TrackingContext';
import { IngredientFormData } from '../types/ingredient';
import { FoodCategory } from '../types/tracking';
import { MealInfoData } from '../components/MealInfoForm';
import { processIngredients, createFoodEntry } from '../utils/foodHelpers';
import { createTimestamp } from '../utils/dateUtils';
import { FoodSearchResult } from '../lib/openFoodFactsService';

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
    { name: "", amount: "", unit: "g", caloriesRef: "" },
  ]);

  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);

  const handlePhotoSelect = useCallback((uri: string) => {
    setPhotoUri(uri);
  }, []);

  const handlePhotoRemove = useCallback(() => {
    setPhotoUri(undefined);
  }, []);

  const addIngredient = useCallback(() => {
    setIngredients(prev => [
      ...prev,
      { name: "", amount: "", unit: "g", caloriesRef: "" },
    ]);
  }, []);

  const updateIngredient = useCallback((index: number, field: keyof IngredientFormData, value: string) => {
    setIngredients(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  /** Populate an ingredient row from an Open Food Facts (or future Gemini) result. */
  const applyNutritionToIngredient = useCallback((index: number, result: FoodSearchResult) => {
    setIngredients(prev => {
      const updated = [...prev];
      const nd = result.nutritionData;
      updated[index] = {
        ...updated[index],
        name:            result.productName,
        caloriesRef:     String(Math.round(nd.caloriesPer100g)),
        proteinPer100g:  nd.proteinPer100g !== undefined ? String(nd.proteinPer100g.toFixed(1)) : undefined,
        carbsPer100g:    nd.carbsPer100g   !== undefined ? String(nd.carbsPer100g.toFixed(1))   : undefined,
        fatPer100g:      nd.fatPer100g     !== undefined ? String(nd.fatPer100g.toFixed(1))     : undefined,
        nutritionSource: 'open_food_facts',
      };
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
    setIngredients([{ name: "", amount: "", unit: "g", caloriesRef: "" }]);
    setPhotoUri(undefined);
  }, []);

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    if (!validateForm()) return;

    const processedIngredients = processIngredients(ingredients);
    const timestamp = createTimestamp(mealInfo.selectedDate, mealInfo.selectedTime);
    const foodEntry = createFoodEntry(
      mealInfo.mealName,
      mealInfo.category as FoodCategory,
      timestamp,
      processedIngredients,
      photoUri
    );

    setSubmitting(true);
    try {
      await addFoodEntry(foodEntry);
      resetForm();
      Alert.alert("Success", "Food entry added successfully!");
    } catch (err) {
      console.error('[useFoodEntryForm] handleSubmit:', err);
      Alert.alert("Error", "Failed to save entry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [submitting, mealInfo, ingredients, photoUri, addFoodEntry, validateForm, resetForm]);

  return {
    // State
    mealInfo,
    ingredients,
    photoUri,
    submitting,
    showCategoryDropdown,
    showDatePicker,
    showTimePicker,
    
    // Handlers
    handleSubmit,
    handleMealNameUpdate,
    handleCategorySelect,
    handleDateSelect,
    handleTimeSelect,
    handlePhotoSelect,
    handlePhotoRemove,
    addIngredient,
    updateIngredient,
    removeIngredient,
    applyNutritionToIngredient,
    
    // Modal controls
    setShowCategoryDropdown,
    setShowDatePicker,
    setShowTimePicker,
  };
};
