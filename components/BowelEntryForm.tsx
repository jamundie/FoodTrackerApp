import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Image, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import PhotoInput from './PhotoInput';
import {
  BristolType,
  BowelUrgency,
  BRISTOL_DESCRIPTIONS,
  BOWEL_URGENCY_LABELS,
} from '../types/tracking';
import { BowelFormState } from '../hooks/useBowelEntryForm';
import { styles } from '../styles/food.styles';
import { bowelStyles } from '../styles/bowel.styles';
import { formatDisplayDate, formatDisplayTime } from '../utils/dateUtils';

const BRISTOL_TYPES: BristolType[] = [1, 2, 3, 4, 5, 6, 7];
const URGENCY_OPTIONS: BowelUrgency[] = ['none', 'mild', 'moderate', 'urgent'];
const PAIN_LEVELS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

type Props = {
  form: BowelFormState;
  photoUri: string | undefined;
  onShowDatePicker: () => void;
  onShowTimePicker: () => void;
  onToggleFalseAlarm: () => void;
  onBristolType: (type: BristolType) => void;
  onUrgency: (urgency: BowelUrgency) => void;
  onToggleBlood: () => void;
  onPainLevel: (level: number) => void;
  onNotes: (notes: string) => void;
  onPhotoSelect: (uri: string) => void;
  onPhotoRemove: () => void;
};

export default function BowelEntryForm({
  form,
  photoUri,
  onShowDatePicker,
  onShowTimePicker,
  onToggleFalseAlarm,
  onBristolType,
  onUrgency,
  onToggleBlood,
  onPainLevel,
  onNotes,
  onPhotoSelect,
  onPhotoRemove,
}: Props) {
  const [showChart, setShowChart] = useState(false);

  return (
    <View>
      {/* Date & Time */}
      <View style={styles.inputGroup}>
        <ThemedText type="defaultSemiBold">Date & Time</ThemedText>
        <View style={[styles.row, { marginTop: 8 }]}>
          <TouchableOpacity
            style={[styles.dropdownButton, { flex: 1 }]}
            onPress={onShowDatePicker}
          >
            <Text style={styles.dropdownButtonText}>
              {formatDisplayDate(form.selectedDate)}
            </Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dropdownButton, { flex: 1 }]}
            onPress={onShowTimePicker}
          >
            <Text style={styles.dropdownButtonText}>
              {formatDisplayTime(form.selectedTime.hours, form.selectedTime.minutes)}
            </Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* False alarm toggle — shown early so it collapses irrelevant fields */}
      <View style={styles.inputGroup}>
        <TouchableOpacity
          style={bowelStyles.toggleRow}
          onPress={onToggleFalseAlarm}
          testID="false-alarm-toggle"
        >
          <View>
            <Text style={bowelStyles.toggleLabel}>Sensation only — no movement</Text>
            <Text style={bowelStyles.toggleSubLabel}>Urge to go but nothing happened</Text>
          </View>
          <View style={[bowelStyles.toggleButton, form.falseAlarm && bowelStyles.toggleButtonFalseAlarm]}>
            <Text style={[bowelStyles.toggleButtonText, form.falseAlarm && bowelStyles.toggleButtonTextFalseAlarm]}>
              {form.falseAlarm ? 'Yes' : 'No'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Bristol Stool Scale — hidden for false alarms */}
      {!form.falseAlarm && (
        <View style={styles.inputGroup}>
          <View style={bowelStyles.bristolHeadingRow}>
            <ThemedText type="defaultSemiBold">Bristol Stool Type</ThemedText>
            <TouchableOpacity
              onPress={() => setShowChart(true)}
              testID="bristol-chart-info"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="information-circle-outline" size={20} color="#7c3aed" />
            </TouchableOpacity>
          </View>
          <View style={bowelStyles.bristolGrid}>
            {BRISTOL_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  bowelStyles.bristolButton,
                  form.bristolType === type && bowelStyles.bristolButtonSelected,
                ]}
                onPress={() => onBristolType(type)}
                testID={`bristol-type-${type}`}
              >
                <Text
                  style={[
                    bowelStyles.bristolButtonText,
                    form.bristolType === type && bowelStyles.bristolButtonTextSelected,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={bowelStyles.bristolDescription}>
            {BRISTOL_DESCRIPTIONS[form.bristolType]}
          </Text>
        </View>
      )}

      {/* Urgency */}
      <View style={styles.inputGroup}>
        <ThemedText type="defaultSemiBold">Urgency</ThemedText>
        <View style={bowelStyles.urgencyRow}>
          {URGENCY_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                bowelStyles.urgencyButton,
                form.urgency === option && bowelStyles.urgencyButtonSelected,
              ]}
              onPress={() => onUrgency(option)}
              testID={`urgency-${option}`}
            >
              <Text
                style={[
                  bowelStyles.urgencyButtonText,
                  form.urgency === option && bowelStyles.urgencyButtonTextSelected,
                ]}
              >
                {BOWEL_URGENCY_LABELS[option]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Pain Level */}
      <View style={styles.inputGroup}>
        <ThemedText type="defaultSemiBold">Pain Level</ThemedText>
        <View style={bowelStyles.painRow}>
          <Text style={bowelStyles.painLabel}>{form.painLevel}</Text>
          <View style={bowelStyles.painButtonsRow}>
            {PAIN_LEVELS.map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  bowelStyles.painButton,
                  form.painLevel === level && bowelStyles.painButtonSelected,
                ]}
                onPress={() => onPainLevel(level)}
                testID={`pain-level-${level}`}
              >
                <Text
                  style={[
                    bowelStyles.painButtonText,
                    form.painLevel === level && bowelStyles.painButtonTextSelected,
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Blood present — hidden for false alarms */}
      {!form.falseAlarm && (
        <View style={styles.inputGroup}>
          <TouchableOpacity style={bowelStyles.toggleRow} onPress={onToggleBlood} testID="blood-toggle">
            <Text style={bowelStyles.toggleLabel}>Blood present?</Text>
            <View style={[bowelStyles.toggleButton, form.hasBlood && bowelStyles.toggleButtonActive]}>
              <Text style={[bowelStyles.toggleButtonText, form.hasBlood && bowelStyles.toggleButtonTextActive]}>
                {form.hasBlood ? 'Yes' : 'No'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Photo — encrypted upload, same pipeline as food entries */}
      <PhotoInput
        photoUri={photoUri}
        onPhotoSelect={onPhotoSelect}
        onPhotoRemove={onPhotoRemove}
      />

      {/* Notes */}
      <View style={styles.inputGroup}>
        <ThemedText type="defaultSemiBold">Notes (optional)</ThemedText>
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          placeholder="Any additional observations..."
          value={form.notes}
          onChangeText={onNotes}
          multiline
          testID="bowel-notes-input"
        />
      </View>

      {/* Bristol Stool Chart reference image */}
      <Modal
        visible={showChart}
        animationType="slide"
        onRequestClose={() => setShowChart(false)}
        testID="bristol-chart-modal"
      >
        <SafeAreaView style={bowelStyles.chartModalContainer}>
          <View style={bowelStyles.chartModalHeader}>
            <Text style={bowelStyles.chartModalTitle}>Bristol Stool Chart</Text>
            <TouchableOpacity
              style={bowelStyles.chartModalCloseButton}
              onPress={() => setShowChart(false)}
              testID="bristol-chart-close"
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <Image
            source={require('../assets/images/bristol-stool-chart.png')}
            style={bowelStyles.chartModalImage}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}
