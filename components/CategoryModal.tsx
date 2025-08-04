import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal } from "react-native";
import { FoodCategory, FOOD_CATEGORIES } from "../types/tracking";
import { styles } from "../styles/food.styles";

interface CategoryModalProps {
  visible: boolean;
  selectedCategory: FoodCategory | "";
  onCategorySelect: (category: FoodCategory) => void;
  onClose: () => void;
}

export default function CategoryModal({
  visible,
  selectedCategory,
  onCategorySelect,
  onClose,
}: CategoryModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      testID="category-modal"
    >
      <View style={styles.modalOverlay} testID="modal-overlay">
        <View style={styles.dropdownModal}>
          <Text style={styles.dropdownHeader}>Select Category</Text>
          <ScrollView>
            {FOOD_CATEGORIES.map((categoryOption) => (
              <TouchableOpacity
                key={categoryOption}
                style={[
                  styles.categoryOption,
                  selectedCategory === categoryOption && styles.selectedCategoryOption,
                ]}
                onPress={() => onCategorySelect(categoryOption)}
              >
                <Text
                  style={[
                    styles.categoryOptionText,
                    selectedCategory === categoryOption && { fontWeight: "600" },
                  ]}
                >
                  {categoryOption}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
