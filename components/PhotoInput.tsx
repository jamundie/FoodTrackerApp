import React from "react";
import { View, Image, TouchableOpacity, Alert, ActionSheetIOS, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ThemedText } from "./ThemedText";
import { styles } from "../styles/food.styles";

interface PhotoInputProps {
  photoUri: string | undefined;
  onPhotoSelect: (uri: string) => void;
  onPhotoRemove: () => void;
  label?: string;
  addLabel?: string;
  aspect?: [number, number];
  quality?: number;
}

async function pickFromLibrary(
  aspect: [number, number],
  quality: number
): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Permission required", "Allow access to your photo library to add a photo.");
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect,
    quality,
  });
  return result.canceled ? null : result.assets[0].uri;
}

async function pickFromCamera(
  aspect: [number, number],
  quality: number
): Promise<string | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Permission required", "Allow camera access to take a photo.");
    return null;
  }
  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect,
    quality,
  });
  return result.canceled ? null : result.assets[0].uri;
}

function showSourcePicker(
  onSelect: (uri: string) => void,
  aspect: [number, number],
  quality: number
) {
  if (Platform.OS === "ios") {
    ActionSheetIOS.showActionSheetWithOptions(
      { options: ["Cancel", "Take Photo", "Choose from Library"], cancelButtonIndex: 0 },
      async (index) => {
        let uri: string | null = null;
        if (index === 1) uri = await pickFromCamera(aspect, quality);
        if (index === 2) uri = await pickFromLibrary(aspect, quality);
        if (uri) onSelect(uri);
      }
    );
  } else {
    // Android: use an Alert as a simple action sheet replacement
    Alert.alert("Add Photo", "Choose a source", [
      { text: "Cancel", style: "cancel" },
      { text: "Take Photo", onPress: async () => { const uri = await pickFromCamera(aspect, quality); if (uri) onSelect(uri); } },
      { text: "Photo Library", onPress: async () => { const uri = await pickFromLibrary(aspect, quality); if (uri) onSelect(uri); } },
    ]);
  }
}

export default function PhotoInput({
  photoUri,
  onPhotoSelect,
  onPhotoRemove,
  label = "Photo",
  addLabel = "+ Add Photo",
  aspect = [4, 3],
  quality = 0.8,
}: PhotoInputProps) {
  return (
    <View style={styles.photoInputGroup}>
      <ThemedText type="defaultSemiBold">{label}</ThemedText>

      {photoUri ? (
        <>
          <View style={styles.photoPreviewContainer}>
            <Image
              source={{ uri: photoUri }}
              style={styles.photoPreviewImage}
              testID="photo-preview"
            />
          </View>
          <View style={styles.photoActions}>
            <TouchableOpacity
              style={[styles.photoActionButton, styles.replaceButton]}
              onPress={() => showSourcePicker(onPhotoSelect, aspect, quality)}
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
          onPress={() => showSourcePicker(onPhotoSelect, aspect, quality)}
          testID="add-photo-button"
        >
          <ThemedText style={styles.addPhotoButtonText}>{addLabel}</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
}
