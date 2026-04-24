import React from 'react';
import { Text, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import BowelEntryForm from '../../components/BowelEntryForm';
import BowelEntriesList from '../../components/BowelEntriesList';
import DatePickerModal from '../../components/DatePickerModal';
import TimePickerModal from '../../components/TimePickerModal';
import { useTracking } from '../../hooks/TrackingContext';
import { useBowelEntryForm } from '../../hooks/useBowelEntryForm';
import { styles } from '../../styles/food.styles';
import { bowelStyles } from '../../styles/bowel.styles';

export default function BowelScreen() {
  const { data } = useTracking();
  const {
    form,
    photoUri,
    showDatePicker,
    showTimePicker,
    setShowDatePicker,
    setShowTimePicker,
    handleDateSelect,
    handleTimeSelect,
    toggleFalseAlarm,
    setBristolType,
    setUrgency,
    toggleBlood,
    setPainLevel,
    setNotes,
    handlePhotoSelect,
    handlePhotoRemove,
    handleSubmit,
  } = useBowelEntryForm();

  return (
    <ScrollView style={[styles.container, bowelStyles.container]}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Log Bowel Movement
        </ThemedText>

        <BowelEntryForm
          form={form}
          photoUri={photoUri}
          onShowDatePicker={() => setShowDatePicker(true)}
          onShowTimePicker={() => setShowTimePicker(true)}
          onToggleFalseAlarm={toggleFalseAlarm}
          onBristolType={setBristolType}
          onUrgency={setUrgency}
          onToggleBlood={toggleBlood}
          onPainLevel={setPainLevel}
          onNotes={setNotes}
          onPhotoSelect={handlePhotoSelect}
          onPhotoRemove={handlePhotoRemove}
        />

        <TouchableOpacity
          style={bowelStyles.submitButton}
          onPress={handleSubmit}
          testID="submit-bowel-entry-button"
        >
          <Text style={bowelStyles.submitButtonText}>Log Entry</Text>
        </TouchableOpacity>

        <BowelEntriesList bowelEntries={data.bowelEntries} />
      </ThemedView>

      <DatePickerModal
        visible={showDatePicker}
        selectedDate={form.selectedDate}
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
