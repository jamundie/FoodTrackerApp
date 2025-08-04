import React from "react";
import { Text, ScrollView, TouchableOpacity } from "react-native";
import { ThemedView } from "../../components/ThemedView";
import { ThemedText } from "../../components/ThemedText";
import IngredientForm from "../../components/IngredientForm";
import MealInfoForm from "../../components/MealInfoForm";
import DatePickerModal from "../../components/DatePickerModal";
import TimePickerModal from "../../components/TimePickerModal";
import CategoryModal from "../../components/CategoryModal";
import FoodEntriesList from "../../components/FoodEntriesList";
import { useTracking } from "../../hooks/TrackingContext";
import { useFoodEntryForm } from "../../hooks/useFoodEntryForm";
import { formatDisplayDate, formatDisplayTime } from "../../utils/dateUtils";
import { styles } from "../../styles/food.styles";

export default function FoodScreen() {
  const { data } = useTracking();
  const {
    mealInfo,
    ingredients,
    showCategoryDropdown,
    showDatePicker,
    showTimePicker,
    handleSubmit,
    handleMealNameUpdate,
    handleCategorySelect,
    handleDateSelect,
    handleTimeSelect,
    addIngredient,
    updateIngredient,
    removeIngredient,
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

        <FoodEntriesList foodEntries={data.foodEntries} />
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
