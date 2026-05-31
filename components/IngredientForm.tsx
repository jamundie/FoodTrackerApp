import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";
import { Unit, IngredientFormData } from "../types/ingredient";
import { FoodSearchResult } from "../lib/openFoodFactsService";
import FoodSearchInput from "./FoodSearchInput";
import BarcodeScannerModal from "./BarcodeScannerModal";
import { styles as foodStyles } from "../styles/food.styles";

interface IngredientFormProps {
  ingredients: IngredientFormData[];
  onUpdateIngredient: (index: number, field: keyof IngredientFormData, value: string) => void;
  onApplyNutrition: (index: number, result: FoodSearchResult) => void;
  onAddIngredient: () => void;
  onRemoveIngredient: (index: number) => void;
}

export default function IngredientForm({
  ingredients,
  onUpdateIngredient,
  onApplyNutrition,
  onAddIngredient,
  onRemoveIngredient,
}: IngredientFormProps) {
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scanTargetIndex, setScanTargetIndex] = useState(0);

  const openScanner = (index: number) => {
    setScanTargetIndex(index);
    setScannerVisible(true);
  };

  const handleScanResult = (result: FoodSearchResult) => {
    onApplyNutrition(scanTargetIndex, result);
    setScannerVisible(false);
  };
  return (
    <View style={foodStyles.ingredientsSection}>
      <ThemedText type="defaultSemiBold" style={foodStyles.sectionTitle}>
        Ingredients
      </ThemedText>

      {ingredients.map((ingredient, index) => (
        <View key={index} style={foodStyles.ingredientCard}>
          <View style={foodStyles.ingredientHeader}>
            <ThemedText type="default">Ingredient {index + 1}</ThemedText>
            <View style={localStyles.headerActions}>
              <TouchableOpacity
                style={localStyles.scanButton}
                onPress={() => openScanner(index)}
                testID={`scan-barcode-${index}`}
              >
                <Ionicons name="barcode-outline" size={18} color="#007bff" />
              </TouchableOpacity>
              {ingredients.length > 1 && (
                <TouchableOpacity
                  style={foodStyles.removeButton}
                  onPress={() => onRemoveIngredient(index)}
                >
                  <Text style={foodStyles.removeButtonText} testID={`remove-ingredient-${index}`}>
                    Remove
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Name — search field with OFF live lookup */}
          <FoodSearchInput
            value={ingredient.name}
            onChangeText={(text) => onUpdateIngredient(index, "name", text)}
            onSelectResult={(result) => onApplyNutrition(index, result)}
          />

          <View style={foodStyles.row}>
            <TextInput
              style={[foodStyles.input, foodStyles.amountInput]}
              value={ingredient.amount}
              onChangeText={(value) => onUpdateIngredient(index, "amount", value)}
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
                    ingredient.unit === unit && foodStyles.unitButtonSelected,
                  ]}
                  onPress={() => onUpdateIngredient(index, "unit", unit)}
                >
                  <Text
                    style={[
                      foodStyles.unitButtonText,
                      ingredient.unit === unit && foodStyles.unitButtonTextSelected,
                    ]}
                  >
                    {unit}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Calories — always editable for manual override */}
          <TextInput
            style={foodStyles.input}
            value={ingredient.caloriesRef}
            onChangeText={(value) => onUpdateIngredient(index, "caloriesRef", value)}
            placeholder={
              ingredient.unit === "piece"
                ? "Calories per piece (optional)"
                : "Calories per 100g (optional)"
            }
            placeholderTextColor="#999"
            keyboardType="numeric"
          />

          {/* Macro pills — shown when populated from a lookup */}
          {(ingredient.proteinPer100g || ingredient.carbsPer100g || ingredient.fatPer100g) ? (
            <View style={localStyles.macroPills}>
              {ingredient.proteinPer100g ? (
                <View style={[localStyles.pill, localStyles.pillProtein]}>
                  <Text style={localStyles.pillText}>
                    P {ingredient.proteinPer100g}g
                  </Text>
                </View>
              ) : null}
              {ingredient.carbsPer100g ? (
                <View style={[localStyles.pill, localStyles.pillCarbs]}>
                  <Text style={localStyles.pillText}>
                    C {ingredient.carbsPer100g}g
                  </Text>
                </View>
              ) : null}
              {ingredient.fatPer100g ? (
                <View style={[localStyles.pill, localStyles.pillFat]}>
                  <Text style={localStyles.pillText}>
                    F {ingredient.fatPer100g}g
                  </Text>
                </View>
              ) : null}
              {ingredient.nutritionSource === "open_food_facts" ? (
                <Text style={localStyles.sourceLabel}>via Open Food Facts</Text>
              ) : ingredient.nutritionSource === "gemini_vision" ? (
                <Text style={localStyles.sourceLabel}>via AI analysis</Text>
              ) : null}
            </View>
          ) : null}
        </View>
      ))}

      <TouchableOpacity
        style={foodStyles.addIngredientButton}
        onPress={onAddIngredient}
        testID="add-ingredient-button"
      >
        <Text style={foodStyles.addIngredientButtonText}>+ Add Ingredient</Text>
      </TouchableOpacity>

      <BarcodeScannerModal
        visible={scannerVisible}
        onResult={handleScanResult}
        onClose={() => setScannerVisible(false)}
      />
    </View>
  );
}

const localStyles = StyleSheet.create({
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scanButton: {
    padding: 4,
  },
  macroPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
  },
  pill: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pillProtein: {
    backgroundColor: "#D0E8FF",
  },
  pillCarbs: {
    backgroundColor: "#FFF3CD",
  },
  pillFat: {
    backgroundColor: "#FFE0C2",
  },
  pillText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#333",
  },
  sourceLabel: {
    fontSize: 10,
    color: "#999",
    marginLeft: 2,
    alignSelf: "center",
  },
});
