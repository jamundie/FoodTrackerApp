import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { ThemedView } from "../../components/ThemedView";
import { ThemedText } from "../../components/ThemedText";
import IngredientForm, { IngredientFormData } from "../../components/IngredientForm";
import MealInfoForm, { MealInfoData } from "../../components/MealInfoForm";
import DatePickerModal from "../../components/DatePickerModal";
import TimePickerModal from "../../components/TimePickerModal";
import CategoryModal from "../../components/CategoryModal";
import { useTracking } from "../../hooks/TrackingContext";
import { FoodEntry, Ingredient, Unit, FoodCategory, FOOD_CATEGORIES } from "../../types/tracking";
import { styles } from "../../styles/food.styles";

export default function FoodScreen() {
  const { addFoodEntry, data } = useTracking();
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

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { name: "", amount: "", unit: "g", caloriesPer100g: "" },
    ]);
  };

  const updateIngredient = (index: number, field: keyof IngredientFormData, value: string) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const handleCategorySelect = (selectedCategory: FoodCategory) => {
    setMealInfo(prev => ({
      ...prev,
      category: selectedCategory,
    }));
    setShowCategoryDropdown(false);
  };

  const handleDateSelect = (date: Date) => {
    setMealInfo(prev => ({
      ...prev,
      selectedDate: date,
    }));
    setShowDatePicker(false);
  };

  const handleTimeSelect = (hours: number, minutes: number) => {
    setMealInfo(prev => ({
      ...prev,
      selectedTime: { hours, minutes },
    }));
    setShowTimePicker(false);
  };

  const createTimestamp = (): string => {
    const combinedDateTime = new Date(mealInfo.selectedDate);
    combinedDateTime.setHours(mealInfo.selectedTime.hours, mealInfo.selectedTime.minutes, 0, 0);
    return combinedDateTime.toISOString();
  };

  const formatDisplayDate = (date: Date): string => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return "Today";
    }
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatDisplayTime = (hours: number, minutes: number): string => {
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const paddedMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${paddedMinutes} ${period}`;
  };

  const calculateTotalCalories = (processedIngredients: Ingredient[]): number => {
    return processedIngredients.reduce((total, ingredient) => {
      return total + (ingredient.calculatedCalories || 0);
    }, 0);
  };

  const handleSubmit = () => {
    if (!mealInfo.mealName.trim()) {
      Alert.alert("Error", "Please enter a meal name");
      return;
    }

    if (!mealInfo.category) {
      Alert.alert("Error", "Please select a category");
      return;
    }

    const validIngredients = ingredients.filter(
      (ingredient) => ingredient.name.trim() && ingredient.amount.trim()
    );

    if (validIngredients.length === 0) {
      Alert.alert("Error", "Please add at least one ingredient");
      return;
    }

    // Process ingredients
    const processedIngredients: Ingredient[] = validIngredients.map((ingredient, index) => {
      const amount = parseFloat(ingredient.amount) || 0;
      const caloriesPer100g = parseFloat(ingredient.caloriesPer100g) || undefined;

      let calculatedCalories: number | undefined;
      if (caloriesPer100g && amount > 0) {
        if (ingredient.unit === "g") {
          calculatedCalories = (amount * caloriesPer100g) / 100;
        } else if (ingredient.unit === "ml") {
          calculatedCalories = (amount * caloriesPer100g) / 100;
        } else if (ingredient.unit === "piece") {
          calculatedCalories = amount * caloriesPer100g;
        }
      }

      return {
        id: `${Date.now()}-${index}`,
        name: ingredient.name.trim(),
        amount,
        unit: ingredient.unit,
        caloriesPer100g,
        calculatedCalories,
      };
    });

    const totalCalories = calculateTotalCalories(processedIngredients);

    const foodEntry: FoodEntry = {
      id: Date.now().toString(),
      mealName: mealInfo.mealName.trim(),
      category: mealInfo.category as FoodCategory, // Safe to cast since we validate it above
      timestamp: createTimestamp(),
      ingredients: processedIngredients,
      totalCalories: totalCalories > 0 ? totalCalories : undefined,
    };

    addFoodEntry(foodEntry);

    // Reset form
    setMealInfo({
      mealName: "",
      category: "",
      selectedDate: new Date(),
      selectedTime: { hours: new Date().getHours(), minutes: 0 },
    });
    setShowCategoryDropdown(false);
    setIngredients([{ name: "", amount: "", unit: "g", caloriesPer100g: "" }]);

    Alert.alert("Success", "Food entry added successfully!");
  };

  const handleMealNameUpdate = (name: string) => {
    setMealInfo(prev => ({
      ...prev,
      mealName: name,
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Add Food Entry
        </ThemedText>

        <MealInfoForm
          mealInfo={mealInfo}
          onUpdateMealName={handleMealNameUpdate}
          onShowCategoryDropdown={() => setShowCategoryDropdown(true)}
          onShowDatePicker={() => setShowDatePicker(true)}
          onShowTimePicker={() => setShowTimePicker(true)}
          formatDisplayDate={formatDisplayDate}
          formatDisplayTime={formatDisplayTime}
        />

        <IngredientForm
          ingredients={ingredients}
          onUpdateIngredient={updateIngredient}
          onAddIngredient={addIngredient}
          onRemoveIngredient={removeIngredient}
        />

        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleSubmit}
          testID="submit-food-entry-button"
        >
          <Text style={styles.submitButtonText}>Add Food Entry</Text>
        </TouchableOpacity>

        <CategoryModal
          visible={showCategoryDropdown}
          selectedCategory={mealInfo.category}
          onCategorySelect={handleCategorySelect}
          onClose={() => setShowCategoryDropdown(false)}
        />

        {data.foodEntries.length > 0 && (
          <View style={styles.recentSection}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Recent Entries ({data.foodEntries.length})
            </ThemedText>
            {data.foodEntries.slice(-3).reverse().map((entry) => (
              <View key={entry.id} style={styles.entryCard}>
                <ThemedText type="defaultSemiBold">{entry.mealName}</ThemedText>
                <ThemedText type="default" style={styles.hint}>{entry.category}</ThemedText>
                <ThemedText type="default" style={styles.hint}>
                  {entry.ingredients.length} ingredients
                  {entry.totalCalories && ` • ${Math.round(entry.totalCalories)} cal`}
                </ThemedText>
                <ThemedText type="default" style={styles.hint}>
                  {new Date(entry.timestamp).toLocaleString()}
                </ThemedText>
              </View>
            ))}
          </View>
        )}
      </ThemedView>

      <DatePickerModal
        visible={showDatePicker}
        selectedDate={mealInfo.selectedDate}
        onDateSelect={handleDateSelect}
        onClose={() => setShowDatePicker(false)}
      />

      <TimePickerModal
        visible={showTimePicker}
        onTimeSelect={handleTimeSelect}
        onClose={() => setShowTimePicker(false)}
      />
    </ScrollView>
  );
}
