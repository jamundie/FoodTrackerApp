import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { ThemedText } from "./ThemedText";
import { styles } from "../styles/food.styles";

export interface WaterInfoData {
  entryName: string;
  selectedDate: Date;
  selectedTime: { hours: number; minutes: number };
}

interface WaterInfoFormProps {
  waterInfo: WaterInfoData;
  onUpdateEntryName: (name: string) => void;
  onShowDatePicker: () => void;
  onShowTimePicker: () => void;
  formatDisplayDate: (date: Date) => string;
  formatDisplayTime: (hours: number, minutes: number) => string;
}

export default function WaterInfoForm({
  waterInfo,
  onUpdateEntryName,
  onShowDatePicker,
  onShowTimePicker,
  formatDisplayDate,
  formatDisplayTime,
}: WaterInfoFormProps) {
  return (
    <>
      <View style={styles.inputGroup}>
        <ThemedText type="defaultSemiBold">Water Entry Name</ThemedText>
        <TextInput
          style={styles.input}
          value={waterInfo.entryName}
          onChangeText={onUpdateEntryName}
          placeholder="e.g., Morning hydration, Post-workout drink"
          placeholderTextColor="#999"
        />
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
            {formatDisplayDate(waterInfo.selectedDate)}
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
            {formatDisplayTime(waterInfo.selectedTime.hours, waterInfo.selectedTime.minutes)}
          </Text>
          <Text style={styles.dropdownArrow}>🕒</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}