import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { searchFoodByBarcode, FoodSearchResult } from "@/lib/openFoodFactsService";

interface BarcodeScannerModalProps {
  visible: boolean;
  onResult: (result: FoodSearchResult) => void;
  onClose: () => void;
}

export default function BarcodeScannerModal({
  visible,
  onResult,
  onClose,
}: BarcodeScannerModalProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(false);

  // Reset scanning state each time modal opens
  useEffect(() => {
    if (visible) {
      setScanning(true);
      setLoading(false);
    }
  }, [visible]);

  const handleBarcode = useCallback(
    async ({ data }: { data: string }) => {
      if (!scanning) return;
      setScanning(false);
      setLoading(true);

      try {
        const result = await searchFoodByBarcode(data);
        if (result) {
          onResult(result);
          onClose();
        } else {
          Alert.alert(
            "Not Found",
            "No product found for this barcode. Try searching by name instead.",
            [{ text: "OK", onPress: () => setScanning(true) }],
          );
        }
      } catch {
        Alert.alert("Error", "Failed to look up barcode. Please try again.", [
          { text: "OK", onPress: () => setScanning(true) },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [scanning, onResult, onClose],
  );

  if (!visible) return null;

  if (!permission) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      testID="barcode-scanner-modal"
    >
      <View style={styles.container}>
        {!permission.granted ? (
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionText}>
              Camera permission is required to scan barcodes.
            </Text>
            <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <CameraView
              style={styles.camera}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"] }}
              onBarcodeScanned={scanning ? handleBarcode : undefined}
            />

            {/* Viewfinder overlay */}
            <View style={styles.overlay}>
              <View style={styles.topOverlay} />
              <View style={styles.middleRow}>
                <View style={styles.sideOverlay} />
                <View style={styles.viewfinder} />
                <View style={styles.sideOverlay} />
              </View>
              <View style={styles.bottomOverlay} />
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>Looking up product…</Text>
              </View>
            ) : (
              <View style={styles.instructions}>
                <Text style={styles.instructionsText}>
                  Align the barcode within the frame
                </Text>
              </View>
            )}

            <TouchableOpacity style={styles.closeButton} onPress={onClose} testID="close-scanner">
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </Modal>
  );
}

const VIEWFINDER_SIZE = 250;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  topOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  middleRow: {
    flexDirection: "row",
    height: VIEWFINDER_SIZE,
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  viewfinder: {
    width: VIEWFINDER_SIZE,
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 4,
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  instructions: {
    position: "absolute",
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  instructionsText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  loadingContainer: {
    position: "absolute",
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    color: "#fff",
    fontSize: 14,
  },
  closeButton: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 16,
  },
  permissionText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  permissionButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: "#aaa",
    fontSize: 16,
  },
});
