import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useTracking } from './TrackingContext';
import { BowelEntry, BristolType, BowelUrgency } from '../types/tracking';
import { generateId, createTimestamp } from '../utils/dateUtils';

export type BowelFormState = {
  selectedDate: Date;
  selectedTime: { hours: number; minutes: number };
  bristolType: BristolType;
  urgency: BowelUrgency;
  hasBlood: boolean;
  painLevel: number;
  notes: string;
};

const defaultFormState = (): BowelFormState => ({
  selectedDate: new Date(),
  selectedTime: { hours: new Date().getHours(), minutes: 0 },
  bristolType: 4,
  urgency: 'none',
  hasBlood: false,
  painLevel: 0,
  notes: '',
});

export const useBowelEntryForm = () => {
  const { addBowelEntry } = useTracking();
  const [form, setForm] = useState<BowelFormState>(defaultFormState());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleDateSelect = useCallback((date: Date) => {
    setForm((prev) => ({ ...prev, selectedDate: date }));
    setShowDatePicker(false);
  }, []);

  const handleTimeSelect = useCallback((hours: number, minutes: number) => {
    setForm((prev) => ({ ...prev, selectedTime: { hours, minutes } }));
    setShowTimePicker(false);
  }, []);

  const setBristolType = useCallback((type: BristolType) => {
    setForm((prev) => ({ ...prev, bristolType: type }));
  }, []);

  const setUrgency = useCallback((urgency: BowelUrgency) => {
    setForm((prev) => ({ ...prev, urgency }));
  }, []);

  const toggleBlood = useCallback(() => {
    setForm((prev) => ({ ...prev, hasBlood: !prev.hasBlood }));
  }, []);

  const setPainLevel = useCallback((level: number) => {
    setForm((prev) => ({ ...prev, painLevel: level }));
  }, []);

  const setNotes = useCallback((notes: string) => {
    setForm((prev) => ({ ...prev, notes }));
  }, []);

  const resetForm = useCallback(() => {
    setForm(defaultFormState());
  }, []);

  const handleSubmit = useCallback(async () => {
    const entry: BowelEntry = {
      id: generateId(),
      timestamp: createTimestamp(form.selectedDate, form.selectedTime),
      bristolType: form.bristolType,
      urgency: form.urgency,
      hasBlood: form.hasBlood,
      painLevel: form.painLevel,
      notes: form.notes.trim() || undefined,
    };

    await addBowelEntry(entry);
    resetForm();
    Alert.alert('Logged', 'Bowel movement recorded.');
  }, [form, addBowelEntry, resetForm]);

  return {
    form,
    showDatePicker,
    showTimePicker,
    setShowDatePicker,
    setShowTimePicker,
    handleDateSelect,
    handleTimeSelect,
    setBristolType,
    setUrgency,
    toggleBlood,
    setPainLevel,
    setNotes,
    handleSubmit,
  };
};
