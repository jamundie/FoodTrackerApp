import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import { WaterEntry } from '../types/tracking';
import { useWaterEntryForm } from '../hooks/useWaterEntryForm';
import WaterInfoForm from './WaterInfoForm';
import WaterIngredientsForm from './WaterIngredientsForm';
import DatePickerModal from './DatePickerModal';
import TimePickerModal from './TimePickerModal';
import { formatDisplayDate, formatDisplayTime } from '../utils/dateUtils';
import { styles as foodStyles } from '../styles/food.styles';

type Props = {
  entry: WaterEntry;
  visible: boolean;
  onClose: () => void;
};

export default function EditWaterEntryModal({ entry, visible, onClose }: Props) {
  const {
    waterInfo,
    volumePresetId,
    ingredients,
    submitting,
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
  } = useWaterEntryForm(entry, onClose);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={localStyles.safeArea}>
        {/* Header */}
        <View style={localStyles.header}>
          <TouchableOpacity onPress={onClose} testID="edit-water-modal-cancel">
            <Text style={localStyles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={localStyles.headerTitle}>Edit Water Entry</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            testID="edit-water-modal-save"
          >
            <Text style={[localStyles.saveText, submitting && localStyles.saveTextDisabled]}>
              {submitting ? 'Saving…' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={localStyles.scroll}>
          <View style={foodStyles.content}>
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
          </View>
        </ScrollView>

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
      </SafeAreaView>
    </Modal>
  );
}

const localStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  cancelText: {
    fontSize: 16,
    color: '#007AFF',
  },
  saveText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  saveTextDisabled: {
    opacity: 0.5,
  },
  scroll: {
    flex: 1,
  },
});
