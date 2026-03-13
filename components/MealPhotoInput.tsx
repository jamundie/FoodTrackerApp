import React from "react";
import { View, Image, TouchableOpacity, Alert, ActionSheetIOS, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ThemedText } from "./ThemedText";
import { styles } from "../styles/food.styles";

interface MealPhotoInputProps {
  photoUri: string | undefined;
  onPhotoSelect: (uri: string) => void;
  onPhotoRemove: () => void;
}

async function pickFromLibrary(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Permission required", "Allow access to your photo library to add a meal photo.");
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });
  return result.canceled ? null : result.assets[0].uri;
}

async function pickFromCamera(): Promise<string | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Permission required", "Allow camera access to take a meal photo.");
    return null;
  }
  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });
  return result.canceled ? null : result.assets[0].uri;
}

function showSourcePicker(onSelect: (uri: string) => void) {
  if (Platform.OS === "ios") {
    ActionSheetIOS.showActionSheetWithOptions(
      { options: ["Cancel", "Take Photo", "Choose from Library"], cancelButtonIndex: 0 },
      async (index) => {
        let uri: string | null = null;
        if (index === 1) uri = await pickFromCamera();
        if (index === 2) uri = await pickFromLibrary();
        if (uri) onSelect(uri);
      }
    );
  } else {
    // Android: use an Alert as a simple action sheet replacement
    Alert.alert("Add Photo", "Choose a source", [
      { text: "Cancel", style: "cancel" },
      { text: "Take Photo", onPress: async () => { const uri = await pickFromCamera(); if (uri) onSelect(uri); } },
      { text: "Photo Library", onPress: async () => { const uri = await pickFromLibrary(); if (uri) onSelect(uri); } },
    ]);
  }
}

export default function MealPhotoInput({ photoUri, onPhotoSelect, onPhotoRemove }: MealPhotoInputProps) {
  return (
    <View style={styles.photoInputGroup}>
      <ThemedText type="defaultSemiBold">Photo</ThemedText>

      {photoUri ? (
        <>
          <View style={styles.photoPreviewContainer}>
            <Image
              source={{ uri: photoUri }}
              style={styles.photoPreviewImage}
              testID="meal-photo-preview"
            />
          </View>
          <View style={styles.photoActions}>
            <TouchableOpacity
              style={[styles.photoActionButton, styles.replaceButton]}
              onPress={() => showSourcePicker(onPhotoSelect)}
              testID="replace-photo-button"
            >
              <ThemedText style={styles.replaceButtonText}>Replace</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.photoActionButton, styles.removePhotoButton]}
              onPress={onPhotoRemove}
              testID="remove-photo-button"
            >
              <ThemedText style={styles.removePhotoButtonText}>Remove</ThemedText>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <TouchableOpacity
          style={styles.addPhotoButton}
          onPress={() => showSourcePicker(onPhotoSelect)}
          testID="add-photo-button"
        >
          <ThemedText style={styles.addPhotoButtonText}>+ Add Photo</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
}
