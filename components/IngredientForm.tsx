import React, { useState } from "react";
import { View, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";
import { IngredientFormData } from "../types/ingredient";
import { FoodSearchResult } from "../lib/openFoodFactsService";
import AddIngredientModal from "./AddIngredientModal";
import { styles as foodStyles } from "../styles/food.styles";

interface IngredientFormProps {
  ingredients: IngredientFormData[];
  onUpdateIngredient: (index: number, field: keyof IngredientFormData, value: string) => void;
  onApplyNutrition: (index: number, result: FoodSearchResult) => void;
  onAddIngredient: () => void;
  onRemoveIngredient: (index: number) => void;
}

const INGREDIENT_FIELDS: (keyof IngredientFormData)[] = [
  "name",
  "amount",
  "unit",
  "caloriesRef",
  "proteinPer100g",
  "carbsPer100g",
  "fatPer100g",
  "fiberPer100g",
  "nutritionSource",
];

/** Writes every defined field of `data` into the ingredient at `index` via onUpdateIngredient. */
function commitIngredientData(
  data: IngredientFormData,
  index: number,
  onUpdateIngredient: (index: number, field: keyof IngredientFormData, value: string) => void,
) {
  INGREDIENT_FIELDS.forEach((field) => {
    const value = data[field];
    if (value !== undefined) onUpdateIngredient(index, field, value);
  });
}

export default function IngredientForm({
  ingredients,
  onUpdateIngredient,
  onAddIngredient,
  onRemoveIngredient,
}: IngredientFormProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const openAddModal = () => {
    setEditingIndex(null);
    setModalVisible(true);
  };

  const openEditModal = (index: number) => {
    setEditingIndex(index);
    setModalVisible(true);
  };

  const handleSave = (data: IngredientFormData) => {
    if (editingIndex !== null) {
      commitIngredientData(data, editingIndex, onUpdateIngredient);
    } else {
      const newIndex = ingredients.length;
      onAddIngredient();
      commitIngredientData(data, newIndex, onUpdateIngredient);
    }
  };

  const handleDelete = (index: number, name: string) => {
    Alert.alert(
      "Delete ingredient?",
      name ? `Remove "${name}" from this entry?` : undefined,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => onRemoveIngredient(index) },
      ]
    );
  };

  return (
    <View style={foodStyles.ingredientsSection}>
      <ThemedText type="defaultSemiBold" style={foodStyles.sectionTitle}>
        Ingredients
      </ThemedText>

      {ingredients.map((ingredient, index) => (
        <View key={index} style={foodStyles.ingredientRow}>
          <View style={foodStyles.ingredientRowInfo}>
            <ThemedText type="default">{ingredient.name || "Unnamed ingredient"}</ThemedText>
            <ThemedText type="default" style={foodStyles.hint}>
              {ingredient.amount} {ingredient.unit}
            </ThemedText>
          </View>
          <View style={foodStyles.entryActions}>
            <TouchableOpacity
              style={[foodStyles.entryActionButton, foodStyles.editButton]}
              onPress={() => openEditModal(index)}
              testID={`edit-ingredient-${index}`}
            >
              <Ionicons name="pencil" size={16} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[foodStyles.entryActionButton, foodStyles.deleteButton]}
              onPress={() => handleDelete(index, ingredient.name)}
              testID={`delete-ingredient-${index}`}
            >
              <Ionicons name="trash" size={16} color="#ff4444" />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <TouchableOpacity
        style={foodStyles.addIngredientButton}
        onPress={openAddModal}
        testID="add-ingredient-button"
      >
        <ThemedText style={foodStyles.addIngredientButtonText}>+ Add Ingredient</ThemedText>
      </TouchableOpacity>

      <AddIngredientModal
        visible={modalVisible}
        mode="food"
        initialData={editingIndex !== null ? ingredients[editingIndex] : null}
        onSave={handleSave}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}
