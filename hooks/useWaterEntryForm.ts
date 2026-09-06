import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useTracking } from './TrackingContext';
import { Ingredient, IngredientFormData } from '../types/ingredient';
import { VolumePreset, VolumePresetId, VOLUME_PRESETS, WaterEntry } from '../types/tracking';
import { WaterInfoData } from '../components/WaterInfoForm';
import { processWaterIngredients, createWaterEntry } from '../utils/waterHelpers';
import { createTimestamp } from '../utils/dateUtils';

function ingredientToFormData(ing: Ingredient): IngredientFormData {
  return {
    name: ing.name,
    amount: String(ing.amount),
    unit: ing.unit,
    caloriesRef: ing.caloriesPer100g !== undefined ? String(Math.round(ing.caloriesPer100g)) : '',
    proteinPer100g: ing.nutritionData?.proteinPer100g !== undefined
      ? String(ing.nutritionData.proteinPer100g.toFixed(1)) : undefined,
    carbsPer100g: ing.nutritionData?.carbsPer100g !== undefined
      ? String(ing.nutritionData.carbsPer100g.toFixed(1)) : undefined,
    fatPer100g: ing.nutritionData?.fatPer100g !== undefined
      ? String(ing.nutritionData.fatPer100g.toFixed(1)) : undefined,
  };
}

function entryToWaterInfo(entry: WaterEntry): WaterInfoData {
  const ts = new Date(entry.timestamp);
  return {
    entryName: entry.entryName,
    selectedDate: ts,
    selectedTime: { hours: ts.getHours(), minutes: ts.getMinutes() },
  };
}

export const useWaterEntryForm = (initialEntry?: WaterEntry, onSuccess?: () => void) => {
  const { addWaterEntry, updateWaterEntry, userProfile } = useTracking();
  const isEditing = !!initialEntry;

  const defaultPresetId: VolumePresetId = userProfile.defaultVolumePresetId;

  const [waterInfo, setWaterInfo] = useState<WaterInfoData>(
    initialEntry ? entryToWaterInfo(initialEntry) : {
      entryName: '',
      selectedDate: new Date(),
      selectedTime: { hours: new Date().getHours(), minutes: 0 },
    }
  );

  const [volumePresetId, setVolumePresetId] = useState<VolumePresetId>(
    initialEntry ? initialEntry.volumePresetId : defaultPresetId
  );

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [ingredients, setIngredients] = useState<IngredientFormData[]>(
    initialEntry ? initialEntry.ingredients.map(ingredientToFormData) : []
  );

  const [submitting, setSubmitting] = useState(false);

  const handleVolumePresetChange = useCallback((preset: VolumePreset) => {
    setVolumePresetId(preset.id);
  }, []);

  const addIngredient = useCallback(() => {
    setIngredients(prev => [
      ...prev,
      { name: '', amount: '', unit: 'ml', caloriesRef: '' },
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
    setIngredients(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleDateSelect = useCallback((date: Date) => {
    setWaterInfo(prev => ({ ...prev, selectedDate: date }));
    setShowDatePicker(false);
  }, []);

  const handleTimeSelect = useCallback((hours: number, minutes: number) => {
    setWaterInfo(prev => ({ ...prev, selectedTime: { hours, minutes } }));
    setShowTimePicker(false);
  }, []);

  const handleEntryNameUpdate = useCallback((name: string) => {
    setWaterInfo(prev => ({ ...prev, entryName: name }));
  }, []);

  const validateForm = useCallback((): boolean => {
    if (!waterInfo.entryName.trim()) {
      Alert.alert('Error', 'Please enter a water entry name');
      return false;
    }
    return true;
  }, [waterInfo]);

  const resetForm = useCallback(() => {
    setWaterInfo({
      entryName: '',
      selectedDate: new Date(),
      selectedTime: { hours: new Date().getHours(), minutes: 0 },
    });
    setVolumePresetId(defaultPresetId);
    setIngredients([]);
  }, [defaultPresetId]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    if (!validateForm()) return;

    const processedIngredients = processWaterIngredients(ingredients);
    const timestamp = createTimestamp(waterInfo.selectedDate, waterInfo.selectedTime);
    const selectedPreset = VOLUME_PRESETS.find((p) => p.id === volumePresetId)!;

    setSubmitting(true);
    try {
      if (isEditing && initialEntry) {
        const baseEntry = createWaterEntry(
          waterInfo.entryName,
          timestamp,
          processedIngredients,
          volumePresetId,
          selectedPreset.ml,
        );
        const updatedEntry: WaterEntry = { ...baseEntry, id: initialEntry.id };
        await updateWaterEntry(updatedEntry);
        Alert.alert('Success', 'Water entry updated successfully!');
      } else {
        const waterEntry = createWaterEntry(
          waterInfo.entryName,
          timestamp,
          processedIngredients,
          volumePresetId,
          selectedPreset.ml,
        );
        addWaterEntry(waterEntry);
        resetForm();
        Alert.alert('Success', 'Water entry added successfully!');
      }
      onSuccess?.();
    } catch (err) {
      console.error('[useWaterEntryForm] handleSubmit:', err);
      Alert.alert('Error', 'Failed to save entry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [submitting, waterInfo, ingredients, volumePresetId, isEditing, initialEntry, addWaterEntry, updateWaterEntry, validateForm, resetForm, onSuccess]);

  return {
    // State
    waterInfo,
    volumePresetId,
    ingredients,
    submitting,
    showDatePicker,
    showTimePicker,

    // Handlers
    handleSubmit,
    handleEntryNameUpdate,
    handleVolumePresetChange,
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
