/**
 * AddIngredientModal — single-ingredient form presented in a full-screen modal.
 *
 * Replaces the old always-expanded ingredient card. Used by both IngredientForm
 * (food, with Open Food Facts search + barcode scan) and WaterIngredientsForm
 * (water, plain fields only) via the `mode` prop.
 *
 * The modal owns a local draft copy of the ingredient — nothing is written back
 * to the parent's ingredient array until Save is pressed. This gives Cancel a
 * true discard-on-cancel semantics for both add and edit flows.
 *
 * Add flow: Save commits the draft (via onSave) then shows an "Add Another" /
 * "Done" prompt so several ingredients can be added back-to-back.
 * Edit flow (initialData present): a single Save commits and closes.
 */

import React, { useEffect, useState, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";
import { Unit, IngredientFormData } from "../types/ingredient";
import { FoodSearchResult } from "../lib/openFoodFactsService";
import FoodSearchInput from "./FoodSearchInput";
import BarcodeScannerModal from "./BarcodeScannerModal";
import { styles as foodStyles } from "../styles/food.styles";

export type IngredientModalMode = "food" | "water";

interface AddIngredientModalProps {
  visible: boolean;
  mode: IngredientModalMode;
  /** Present => editing an existing ingredient; absent => adding a new one. */
  initialData?: IngredientFormData | null;
  onSave: (data: IngredientFormData) => void;
  onClose: () => void;
}

function blankDraft(mode: IngredientModalMode): IngredientFormData {
  return { name: "", amount: "", unit: mode === "water" ? "ml" : "g", caloriesRef: "" };
}

export default function AddIngredientModal({
  visible,
  mode,
  initialData,
  onSave,
  onClose,
}: AddIngredientModalProps) {
  const isEditing = !!initialData;
  const [draft, setDraft] = useState<IngredientFormData>(initialData ?? blankDraft(mode));
  const [saved, setSaved] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);

  // Reset draft whenever the modal opens (covers both add and edit entry points)
  useEffect(() => {
    if (visible) {
      setDraft(initialData ?? blankDraft(mode));
      setSaved(false);
      setScannerVisible(false);
    }
  }, [visible, initialData, mode]);

  const updateField = useCallback((field: keyof IngredientFormData, value: string) => {
    setDraft(prev => ({ ...prev, [field]: value }));
  }, []);

  const applyNutritionResult = useCallback((result: FoodSearchResult) => {
    const nd = result.nutritionData;
    setDraft(prev => ({
      ...prev,
      name: result.productName,
      caloriesRef: String(Math.round(nd.caloriesPer100g)),
      proteinPer100g: nd.proteinPer100g !== undefined ? String(nd.proteinPer100g.toFixed(1)) : undefined,
      carbsPer100g: nd.carbsPer100g !== undefined ? String(nd.carbsPer100g.toFixed(1)) : undefined,
      fatPer100g: nd.fatPer100g !== undefined ? String(nd.fatPer100g.toFixed(1)) : undefined,
      fiberPer100g: nd.fiberPer100g !== undefined ? String(nd.fiberPer100g.toFixed(1)) : undefined,
      nutritionSource: "open_food_facts",
    }));
  }, []);

  const handleScanResult = useCallback((result: FoodSearchResult) => {
    applyNutritionResult(result);
    setScannerVisible(false);
  }, [applyNutritionResult]);

  const handleSave = useCallback(() => {
    if (!draft.name.trim() || !draft.amount.trim()) {
      Alert.alert("Error", "Please enter an ingredient name and amount");
      return;
    }
    onSave(draft);
    if (isEditing) {
      onClose();
    } else {
      setSaved(true);
    }
  }, [draft, isEditing, onSave, onClose]);

  const handleAddAnother = useCallback(() => {
    setDraft(blankDraft(mode));
    setSaved(false);
  }, [mode]);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={localStyles.safeArea}>
        <View style={localStyles.header}>
          {!saved ? (
            <TouchableOpacity onPress={onClose} testID="add-ingredient-modal-cancel">
              <Text style={localStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          ) : (
            <View style={localStyles.headerSpacer} />
          )}
          <Text style={localStyles.headerTitle}>
            {isEditing ? "Edit Ingredient" : "Add Ingredient"}
          </Text>
          <View style={localStyles.headerSpacer} />
        </View>

        <ScrollView style={localStyles.scroll} keyboardShouldPersistTaps="handled">
          <View style={foodStyles.content}>
            {saved ? (
              <View style={localStyles.confirmation}>
                <Ionicons name="checkmark-circle" size={48} color="#34C759" />
                <ThemedText type="defaultSemiBold" style={localStyles.confirmationTitle}>
                  Ingredient added
                </ThemedText>
                <TouchableOpacity
                  style={foodStyles.addIngredientButton}
                  onPress={handleAddAnother}
                  testID="add-ingredient-modal-add-another"
                >
                  <Text style={foodStyles.addIngredientButtonText}>+ Add Another</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[foodStyles.submitButton, localStyles.doneButton]}
                  onPress={onClose}
                  testID="add-ingredient-modal-done"
                >
                  <Text style={foodStyles.submitButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {mode === "food" ? (
                  <View>
                    <View style={localStyles.nameRow}>
                      <View style={localStyles.nameField}>
                        <FoodSearchInput
                          value={draft.name}
                          onChangeText={(text) => updateField("name", text)}
                          onSelectResult={applyNutritionResult}
                        />
                      </View>
                      <TouchableOpacity
                        style={localStyles.scanButton}
                        onPress={() => setScannerVisible(true)}
                        testID="scan-barcode-button"
                      >
                        <Ionicons name="barcode-outline" size={22} color="#007bff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TextInput
                    style={foodStyles.input}
                    value={draft.name}
                    onChangeText={(value) => updateField("name", value)}
                    placeholder="e.g., Lemon juice, Protein powder"
                    placeholderTextColor="#999"
                  />
                )}

                <View style={foodStyles.row}>
                  <TextInput
                    style={[foodStyles.input, foodStyles.amountInput]}
                    value={draft.amount}
                    onChangeText={(value) => updateField("amount", value)}
                    placeholder="Amount"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />

                  <View style={foodStyles.unitPicker}>
                    {(["g", "ml", "piece"] as Unit[]).map((unit) => (
                      <TouchableOpacity
                        key={unit}
                        style={[
                          foodStyles.unitButton,
                          draft.unit === unit && foodStyles.unitButtonSelected,
                        ]}
                        onPress={() => updateField("unit", unit)}
                      >
                        <Text
                          style={[
                            foodStyles.unitButtonText,
                            draft.unit === unit && foodStyles.unitButtonTextSelected,
                          ]}
                        >
                          {unit}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TextInput
                  style={foodStyles.input}
                  value={draft.caloriesRef}
                  onChangeText={(value) => updateField("caloriesRef", value)}
                  placeholder={
                    draft.unit === "piece"
                      ? "Calories per piece (optional)"
                      : "Calories per 100g (optional)"
                  }
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />

                {(draft.proteinPer100g || draft.carbsPer100g || draft.fatPer100g) ? (
                  <View style={foodStyles.macroPills}>
                    {draft.proteinPer100g ? (
                      <View style={[foodStyles.pill, foodStyles.pillProtein]}>
                        <Text style={foodStyles.pillText}>P {draft.proteinPer100g}g</Text>
                      </View>
                    ) : null}
                    {draft.carbsPer100g ? (
                      <View style={[foodStyles.pill, foodStyles.pillCarbs]}>
                        <Text style={foodStyles.pillText}>C {draft.carbsPer100g}g</Text>
                      </View>
                    ) : null}
                    {draft.fatPer100g ? (
                      <View style={[foodStyles.pill, foodStyles.pillFat]}>
                        <Text style={foodStyles.pillText}>F {draft.fatPer100g}g</Text>
                      </View>
                    ) : null}
                    {draft.nutritionSource === "open_food_facts" ? (
                      <Text style={foodStyles.sourceLabel}>via Open Food Facts</Text>
                    ) : draft.nutritionSource === "gemini_vision" ? (
                      <Text style={foodStyles.sourceLabel}>via AI analysis</Text>
                    ) : null}
                  </View>
                ) : null}

                <TouchableOpacity
                  style={foodStyles.submitButton}
                  onPress={handleSave}
                  testID="add-ingredient-modal-save"
                >
                  <Text style={foodStyles.submitButtonText}>Save</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>

        {mode === "food" && (
          <BarcodeScannerModal
            visible={scannerVisible}
            onResult={handleScanResult}
            onClose={() => setScannerVisible(false)}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const localStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  headerSpacer: {
    width: 60,
  },
  cancelText: {
    fontSize: 16,
    color: "#007AFF",
  },
  scroll: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  nameField: {
    flex: 1,
  },
  scanButton: {
    padding: 12,
    marginTop: 4,
  },
  confirmation: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 12,
  },
  confirmationTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  doneButton: {
    width: "100%",
  },
});
