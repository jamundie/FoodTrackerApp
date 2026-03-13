import React from "react";
import { Text, ScrollView, TouchableOpacity } from "react-native";
import { ThemedView } from "../../components/ThemedView";
import { ThemedText } from "../../components/ThemedText";
import WaterInfoForm from "../../components/WaterInfoForm";
import WaterIngredientsForm from "../../components/WaterIngredientsForm";
import DatePickerModal from "../../components/DatePickerModal";
import TimePickerModal from "../../components/TimePickerModal";
import WaterEntriesList from "../../components/WaterEntriesList";
import { useTracking } from "../../hooks/TrackingContext";
import { useWaterEntryForm } from "../../hooks/useWaterEntryForm";
import { formatDisplayDate, formatDisplayTime } from "../../utils/dateUtils";
import { styles } from "../../styles/food.styles";
import { waterStyles } from "../../styles/water.styles";

export default function WaterScreen() {
  const { data } = useTracking();
  const {
    waterInfo,
    volumePresetId,
    ingredients,
    showDatePicker,
    showTimePicker,
    handleSubmit,
    handleEntryNameUpdate,
    handleVolumePresetChange,
    handleDateSelect,
    handleTimeSelect,
    addIngredient,
    updateIngredient,
    removeIngredient,
    setShowDatePicker,
    setShowTimePicker,
  } = useWaterEntryForm();

  return (
    <ScrollView style={[styles.container, waterStyles.container]}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          💧 Add Water Entry
        </ThemedText>

        <WaterInfoForm
          waterInfo={waterInfo}
          volumePresetId={volumePresetId}
          onUpdateEntryName={handleEntryNameUpdate}
          onVolumePresetChange={handleVolumePresetChange}
          onShowDatePicker={() => setShowDatePicker(true)}
          onShowTimePicker={() => setShowTimePicker(true)}
          formatDisplayDate={formatDisplayDate}
          formatDisplayTime={formatDisplayTime}
        />

        <WaterIngredientsForm
          ingredients={ingredients}
          onUpdateIngredient={updateIngredient}
          onAddIngredient={addIngredient}
          onRemoveIngredient={removeIngredient}
        />

        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleSubmit}
          testID="submit-water-entry-button"
        >
          <Text style={styles.submitButtonText}>Add Water Entry</Text>
        </TouchableOpacity>

        <WaterEntriesList waterEntries={data.waterEntries} />
      </ThemedView>

      <DatePickerModal
        visible={showDatePicker}
        selectedDate={waterInfo.selectedDate}
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
