import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, FlatList } from "react-native";
import { VOLUME_PRESETS, VolumePresetId, VolumePreset } from "../types/tracking";
import { styles } from "../styles/food.styles";
import { waterStyles } from "../styles/water.styles";

interface WaterVolumeSelectorProps {
  selectedPresetId: VolumePresetId;
  onSelect: (preset: VolumePreset) => void;
}

export default function WaterVolumeSelector({
  selectedPresetId,
  onSelect,
}: WaterVolumeSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedPreset = VOLUME_PRESETS.find((p) => p.id === selectedPresetId)!;

  const handleSelect = (preset: VolumePreset) => {
    onSelect(preset);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.dropdownButton, waterStyles.volumeSelector]}
        onPress={() => setModalVisible(true)}
        testID="volume-selector-button"
      >
        <Text style={styles.dropdownButtonText} numberOfLines={1}>
          {selectedPreset.label}
        </Text>
        <Text style={styles.dropdownArrow}>
          {selectedPreset.ml} ml  ▾
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.dropdownModal}>
            <Text style={styles.dropdownHeader}>Select Volume</Text>
            <FlatList
              data={VOLUME_PRESETS}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryOption,
                    item.id === selectedPresetId && styles.selectedCategoryOption,
                  ]}
                  onPress={() => handleSelect(item)}
                  testID={`volume-option-${item.id}`}
                >
                  <Text style={styles.categoryOptionText}>
                    {item.label}
                  </Text>
                  <Text style={[styles.hint, { marginTop: 0 }]}>
                    {item.ml} ml
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
