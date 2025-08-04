import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal } from "react-native";
import { styles } from "../styles/food.styles";

interface TimePickerModalProps {
  visible: boolean;
  onTimeSelect: (hours: number, minutes: number) => void;
  onClose: () => void;
}

export default function TimePickerModal({
  visible,
  onTimeSelect,
  onClose,
}: TimePickerModalProps) {
  const handleTimeSelect = (hours: number, minutes: number) => {
    onTimeSelect(hours, minutes);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.dropdownModal}>
          <Text style={styles.dropdownHeader}>Select Time</Text>
          <ScrollView>
            {Array.from({ length: 24 }, (_, hour) =>
              [0, 15, 30, 45].map((minute) => (
                <TouchableOpacity
                  key={`${hour}-${minute}`}
                  style={styles.categoryOption}
                  onPress={() => handleTimeSelect(hour, minute)}
                  testID={`time-${hour}-${minute}`}
                >
                  <Text style={styles.categoryOptionText}>
                    {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')}
                  </Text>
                </TouchableOpacity>
              ))
            )}
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
