import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useTracking } from './TrackingContext';
import { WaterIngredientFormData } from '../components/WaterIngredientsForm';
import { WaterInfoData } from '../components/WaterInfoForm';
import { processWaterIngredients, createWaterEntry } from '../utils/waterHelpers';
import { createTimestamp } from '../utils/dateUtils';

export const useWaterEntryForm = () => {
  const { addWaterEntry } = useTracking();
  
  const [waterInfo, setWaterInfo] = useState<WaterInfoData>({
    entryName: "",
    selectedDate: new Date(),
    selectedTime: { hours: new Date().getHours(), minutes: 0 },
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  const [ingredients, setIngredients] = useState<WaterIngredientFormData[]>([
    { name: "", amount: "", unit: "ml", caloriesPer100g: "" },
  ]);

  const addIngredient = useCallback(() => {
    setIngredients(prev => [
      ...prev,
      { name: "", amount: "", unit: "ml", caloriesPer100g: "" },
    ]);
  }, []);

  const updateIngredient = useCallback((index: number, field: keyof WaterIngredientFormData, value: string) => {
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

  const handleDateSelect = useCallback((date: Date) => {
    setWaterInfo(prev => ({
      ...prev,
      selectedDate: date,
    }));
    setShowDatePicker(false);
  }, []);

  const handleTimeSelect = useCallback((hours: number, minutes: number) => {
    setWaterInfo(prev => ({
      ...prev,
      selectedTime: { hours, minutes },
    }));
    setShowTimePicker(false);
  }, []);

  const handleEntryNameUpdate = useCallback((name: string) => {
    setWaterInfo(prev => ({
      ...prev,
      entryName: name,
    }));
  }, []);

  const validateForm = useCallback((): boolean => {
    if (!waterInfo.entryName.trim()) {
      Alert.alert("Error", "Please enter a water entry name");
      return false;
    }

    return true;
  }, [waterInfo]);

  const resetForm = useCallback(() => {
    setWaterInfo({
      entryName: "",
      selectedDate: new Date(),
      selectedTime: { hours: new Date().getHours(), minutes: 0 },
    });
    setIngredients([{ name: "", amount: "", unit: "ml", caloriesPer100g: "" }]);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!validateForm()) {
      return;
    }

    const processedIngredients = processWaterIngredients(ingredients);
    const timestamp = createTimestamp(waterInfo.selectedDate, waterInfo.selectedTime);
    const waterEntry = createWaterEntry(
      waterInfo.entryName,
      timestamp,
      processedIngredients
    );

    addWaterEntry(waterEntry);
    resetForm();
    Alert.alert("Success", "Water entry added successfully!");
  }, [waterInfo, ingredients, addWaterEntry, validateForm, resetForm]);

  return {
    // State
    waterInfo,
    ingredients,
    showDatePicker,
    showTimePicker,
    
    // Handlers
    handleSubmit,
    handleEntryNameUpdate,
    handleDateSelect,
    handleTimeSelect,
    addIngredient,
    updateIngredient,
    removeIngredient,
    
    // Modal controls
    setShowDatePicker,
    setShowTimePicker,
  };
};