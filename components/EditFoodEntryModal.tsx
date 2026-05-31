import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import { FoodEntry } from '../types/tracking';
import { useFoodEntryForm } from '../hooks/useFoodEntryForm';
import MealInfoForm from './MealInfoForm';
import IngredientForm from './IngredientForm';
import CategoryModal from './CategoryModal';
import DatePickerModal from './DatePickerModal';
import TimePickerModal from './TimePickerModal';
import { formatDisplayDate, formatDisplayTime } from '../utils/dateUtils';
import { styles as foodStyles } from '../styles/food.styles';

type Props = {
  entry: FoodEntry;
  visible: boolean;
  onClose: () => void;
};

export default function EditFoodEntryModal({ entry, visible, onClose }: Props) {
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
  } = useFoodEntryForm(entry, onClose);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={localStyles.safeArea}>
        {/* Header */}
        <View style={localStyles.header}>
          <TouchableOpacity onPress={onClose} testID="edit-food-modal-cancel">
            <Text style={localStyles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={localStyles.headerTitle}>Edit Entry</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            testID="edit-food-modal-save"
          >
            <Text style={[localStyles.saveText, submitting && localStyles.saveTextDisabled]}>
              {submitting ? 'Saving…' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={localStyles.scroll}>
          <View style={foodStyles.content}>
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
          </View>
        </ScrollView>

        <CategoryModal
          visible={showCategoryDropdown}
          selectedCategory={mealInfo.category}
          onCategorySelect={handleCategorySelect}
          onClose={() => setShowCategoryDropdown(false)}
        />
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
