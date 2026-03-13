import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { ThemedText } from "./ThemedText";
import { styles } from "../styles/food.styles";
import { waterStyles } from "../styles/water.styles";
import WaterVolumeSelector from "./WaterVolumeSelector";
import { VolumePreset, VolumePresetId } from "../types/tracking";

export interface WaterInfoData {
  entryName: string;
  selectedDate: Date;
  selectedTime: { hours: number; minutes: number };
}

interface WaterInfoFormProps {
  waterInfo: WaterInfoData;
  volumePresetId: VolumePresetId;
  onUpdateEntryName: (name: string) => void;
  onVolumePresetChange: (preset: VolumePreset) => void;
  onShowDatePicker: () => void;
  onShowTimePicker: () => void;
  formatDisplayDate: (date: Date) => string;
  formatDisplayTime: (hours: number, minutes: number) => string;
}

export default function WaterInfoForm({
  waterInfo,
  volumePresetId,
  onUpdateEntryName,
  onVolumePresetChange,
  onShowDatePicker,
  onShowTimePicker,
  formatDisplayDate,
  formatDisplayTime,
}: WaterInfoFormProps) {
  return (
    <>
      <View style={styles.inputGroup}>
        <ThemedText type="defaultSemiBold">Water Entry Name</ThemedText>
        <View style={waterStyles.nameVolumeRow}>
          <TextInput
            style={[styles.input, waterStyles.nameInput]}
            value={waterInfo.entryName}
            onChangeText={onUpdateEntryName}
            placeholder="e.g., Morning hydration, Post-workout drink"
            placeholderTextColor="#999"
          />
          <WaterVolumeSelector
            selectedPresetId={volumePresetId}
            onSelect={onVolumePresetChange}
          />
        </View>
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