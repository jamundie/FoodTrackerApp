import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { ThemedText } from "./ThemedText";
import WaterVolumeSelector from "./WaterVolumeSelector";
import { profileStyles } from "../styles/profile.styles";
import { UserProfile, VolumePreset } from "../types/tracking";

interface ProfileFormProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
}

export default function ProfileForm({ profile, onSave }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [age, setAge] = useState(profile.age !== undefined ? String(profile.age) : "");
  const [weightKg, setWeightKg] = useState(profile.weightKg !== undefined ? String(profile.weightKg) : "");
  const [heightCm, setHeightCm] = useState(profile.heightCm !== undefined ? String(profile.heightCm) : "");
  const [dailyWaterGoalMl, setDailyWaterGoalMl] = useState(
    profile.dailyWaterGoalMl !== undefined ? String(profile.dailyWaterGoalMl) : ""
  );
  const [defaultVolumePresetId, setDefaultVolumePresetId] = useState(profile.defaultVolumePresetId);
  const [saved, setSaved] = useState(false);

  const handleVolumeSelect = (preset: VolumePreset) => {
    setDefaultVolumePresetId(preset.id);
  };

  const handleSave = () => {
    const updated: UserProfile = {
      displayName,
      defaultVolumePresetId,
      age: age !== "" ? Number(age) : undefined,
      weightKg: weightKg !== "" ? Number(weightKg) : undefined,
      heightCm: heightCm !== "" ? Number(heightCm) : undefined,
      dailyWaterGoalMl: dailyWaterGoalMl !== "" ? Number(dailyWaterGoalMl) : undefined,
    };
    onSave(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <View>
      {/* Personal details */}
      <View style={profileStyles.section}>
        <Text style={profileStyles.sectionTitle}>Personal</Text>
        <View style={profileStyles.card}>
          <View style={profileStyles.fieldRow}>
            <ThemedText style={profileStyles.fieldLabel}>Name</ThemedText>
            <TextInput
              style={profileStyles.fieldInput}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your name"
              placeholderTextColor="#999"
              testID="profile-name-input"
            />
          </View>
          <View style={profileStyles.fieldRow}>
            <ThemedText style={profileStyles.fieldLabel}>Age</ThemedText>
            <TextInput
              style={profileStyles.fieldInput}
              value={age}
              onChangeText={setAge}
              placeholder="—"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              testID="profile-age-input"
            />
          </View>
          <View style={profileStyles.fieldRow}>
            <ThemedText style={profileStyles.fieldLabel}>Weight (kg)</ThemedText>
            <TextInput
              style={profileStyles.fieldInput}
              value={weightKg}
              onChangeText={setWeightKg}
              placeholder="—"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
              testID="profile-weight-input"
            />
          </View>
          <View style={[profileStyles.fieldRow, profileStyles.fieldRowLast]}>
            <ThemedText style={profileStyles.fieldLabel}>Height (cm)</ThemedText>
            <TextInput
              style={profileStyles.fieldInput}
              value={heightCm}
              onChangeText={setHeightCm}
              placeholder="—"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              testID="profile-height-input"
            />
          </View>
        </View>
      </View>

      {/* Hydration goals */}
      <View style={profileStyles.section}>
        <Text style={profileStyles.sectionTitle}>Hydration Goals</Text>
        <View style={profileStyles.card}>
          <View style={profileStyles.fieldRow}>
            <ThemedText style={profileStyles.fieldLabel}>Daily Water Goal (ml)</ThemedText>
            <TextInput
              style={profileStyles.fieldInput}
              value={dailyWaterGoalMl}
              onChangeText={setDailyWaterGoalMl}
              placeholder="2000"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              testID="profile-water-goal-input"
            />
          </View>
          <View style={[profileStyles.fieldRow, profileStyles.fieldRowLast, profileStyles.volumeRow]}>
            <ThemedText style={profileStyles.volumeLabel}>Default Glass Size</ThemedText>
            <WaterVolumeSelector
              selectedPresetId={defaultVolumePresetId}
              onSelect={handleVolumeSelect}
            />
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={profileStyles.saveButton}
        onPress={handleSave}
        testID="profile-save-button"
      >
        <Text style={profileStyles.saveButtonText}>Save Profile</Text>
      </TouchableOpacity>

      {saved && (
        <View style={profileStyles.savedBanner} testID="profile-saved-banner">
          <Text style={profileStyles.savedBannerText}>Profile saved</Text>
        </View>
      )}
    </View>
  );
}
