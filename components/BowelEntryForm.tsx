import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
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
  onShowDatePicker: () => void;
  onShowTimePicker: () => void;
  onBristolType: (type: BristolType) => void;
  onUrgency: (urgency: BowelUrgency) => void;
  onToggleBlood: () => void;
  onPainLevel: (level: number) => void;
  onNotes: (notes: string) => void;
};

export default function BowelEntryForm({
  form,
  onShowDatePicker,
  onShowTimePicker,
  onBristolType,
  onUrgency,
  onToggleBlood,
  onPainLevel,
  onNotes,
}: Props) {
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

      {/* Bristol Stool Scale */}
      <View style={styles.inputGroup}>
        <ThemedText type="defaultSemiBold">Bristol Stool Type</ThemedText>
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

      {/* Blood present toggle */}
      <View style={styles.inputGroup}>
        <TouchableOpacity style={bowelStyles.toggleRow} onPress={onToggleBlood} testID="blood-toggle">
          <Text style={bowelStyles.toggleLabel}>Blood present?</Text>
          <View
            style={[
              bowelStyles.toggleButton,
              form.hasBlood && bowelStyles.toggleButtonActive,
            ]}
          >
            <Text
              style={[
                bowelStyles.toggleButtonText,
                form.hasBlood && bowelStyles.toggleButtonTextActive,
              ]}
            >
              {form.hasBlood ? 'Yes' : 'No'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

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
    </View>
  );
}
