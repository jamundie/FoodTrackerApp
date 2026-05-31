import React, { useState } from "react";
import { Text, ScrollView, TouchableOpacity } from "react-native";
import { ThemedView } from "../../components/ThemedView";
import { ThemedText } from "../../components/ThemedText";
import IngredientForm from "../../components/IngredientForm";
import MealInfoForm from "../../components/MealInfoForm";
import DatePickerModal from "../../components/DatePickerModal";
import TimePickerModal from "../../components/TimePickerModal";
import CategoryModal from "../../components/CategoryModal";
import FoodEntriesList from "../../components/FoodEntriesList";
import EditFoodEntryModal from "../../components/EditFoodEntryModal";
import { useTracking } from "../../hooks/TrackingContext";
import { useFoodEntryForm } from "../../hooks/useFoodEntryForm";
import { formatDisplayDate, formatDisplayTime } from "../../utils/dateUtils";
import { styles } from "../../styles/food.styles";
import { FoodEntry } from "../../types/tracking";

export default function FoodScreen() {
  const { data, deleteFoodEntry } = useTracking();
  const [editingEntry, setEditingEntry] = useState<FoodEntry | null>(null);

  const {
    mealInfo,
    ingredients,
    photoUri,
    submitting,
    showCategoryDropdown,
    showDatePicker,
    showTimePicker,
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
    setShowCategoryDropdown,
    setShowDatePicker,
    setShowTimePicker,
  } = useFoodEntryForm();

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
          photoUri={photoUri}
          onPhotoSelect={handlePhotoSelect}
          onPhotoRemove={handlePhotoRemove}
        />

        <IngredientForm
          ingredients={ingredients}
          onUpdateIngredient={updateIngredient}
          onApplyNutrition={applyNutritionToIngredient}
          onAddIngredient={addIngredient}
          onRemoveIngredient={removeIngredient}
        />

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
          testID="submit-food-entry-button"
        >
          <Text style={styles.submitButtonText}>{submitting ? 'Saving...' : 'Add Food Entry'}</Text>
        </TouchableOpacity>

        <CategoryModal
          visible={showCategoryDropdown}
          selectedCategory={mealInfo.category}
          onCategorySelect={handleCategorySelect}
          onClose={() => setShowCategoryDropdown(false)}
        />

        <FoodEntriesList
          foodEntries={data.foodEntries}
          onEditEntry={setEditingEntry}
          onDeleteEntry={deleteFoodEntry}
        />
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

      {editingEntry && (
        <EditFoodEntryModal
          key={editingEntry.id}
          entry={editingEntry}
          visible={true}
          onClose={() => setEditingEntry(null)}
        />
      )}
    </ScrollView>
  );
}
