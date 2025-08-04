import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { ThemedText } from "./ThemedText";
import { FoodCategory } from "../types/tracking";
import { styles } from "../styles/food.styles";

export interface MealInfoData {
  mealName: string;
  category: FoodCategory | "";
  selectedDate: Date;
  selectedTime: { hours: number; minutes: number };
}

interface MealInfoFormProps {
  mealInfo: MealInfoData;
  onUpdateMealName: (name: string) => void;
  onShowCategoryDropdown: () => void;
  onShowDatePicker: () => void;
  onShowTimePicker: () => void;
  formatDisplayDate: (date: Date) => string;
  formatDisplayTime: (hours: number, minutes: number) => string;
}

export default function MealInfoForm({
  mealInfo,
  onUpdateMealName,
  onShowCategoryDropdown,
  onShowDatePicker,
  onShowTimePicker,
  formatDisplayDate,
  formatDisplayTime,
}: MealInfoFormProps) {
  return (
    <>
      <View style={styles.inputGroup}>
        <ThemedText type="defaultSemiBold">Meal Name</ThemedText>
        <TextInput
          style={styles.input}
          value={mealInfo.mealName}
          onChangeText={onUpdateMealName}
          placeholder="e.g., Lasagne, Chicken Salad"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputGroup}>
        <ThemedText type="defaultSemiBold">Category</ThemedText>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={onShowCategoryDropdown}
        >
          <Text style={[styles.dropdownButtonText, !mealInfo.category && styles.placeholderText]}>
            {mealInfo.category || "Select a category"}
          </Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <ThemedText type="defaultSemiBold">
          Date & Time
        </ThemedText>
        
        {/* Date Picker */}
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={onShowDatePicker}
          testID="date-picker-button"
        >
          <Text style={styles.dropdownButtonText}>
            {formatDisplayDate(mealInfo.selectedDate)}
          </Text>
          <Text style={styles.dropdownArrow}>📅</Text>
        </TouchableOpacity>

        {/* Time Picker */}
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={onShowTimePicker}
          testID="time-picker-button"
        >
          <Text style={styles.dropdownButtonText}>
            {formatDisplayTime(mealInfo.selectedTime.hours, mealInfo.selectedTime.minutes)}
          </Text>
          <Text style={styles.dropdownArrow}>🕒</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
