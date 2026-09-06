import React, { useState } from "react";
import { View, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";
import { IngredientFormData } from "../types/ingredient";
import { styles } from "../styles/food.styles";
import { Collapsible } from "./Collapsible";
import AddIngredientModal from "./AddIngredientModal";

interface WaterIngredientsFormProps {
  ingredients: IngredientFormData[];
  onUpdateIngredient: (index: number, field: keyof IngredientFormData, value: string) => void;
  onAddIngredient: () => void;
  onRemoveIngredient: (index: number) => void;
}

const INGREDIENT_FIELDS: (keyof IngredientFormData)[] = ["name", "amount", "unit", "caloriesRef"];

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

export default function WaterIngredientsForm({
  ingredients,
  onUpdateIngredient,
  onAddIngredient,
  onRemoveIngredient,
}: WaterIngredientsFormProps) {
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
    <Collapsible title="Add Flavoring / Supplements (Optional)">
      <View style={styles.ingredientsSection}>
        {ingredients.map((ingredient, index) => (
          <View key={index} style={styles.ingredientRow}>
            <View style={styles.ingredientRowInfo}>
              <ThemedText type="default">{ingredient.name || "Unnamed ingredient"}</ThemedText>
              <ThemedText type="default" style={styles.hint}>
                {ingredient.amount} {ingredient.unit}
              </ThemedText>
            </View>
            <View style={styles.entryActions}>
              <TouchableOpacity
                style={[styles.entryActionButton, styles.editButton]}
                onPress={() => openEditModal(index)}
                testID={`edit-water-ingredient-${index}`}
              >
                <Ionicons name="pencil" size={16} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.entryActionButton, styles.deleteButton]}
                onPress={() => handleDelete(index, ingredient.name)}
                testID={`delete-water-ingredient-${index}`}
              >
                <Ionicons name="trash" size={16} color="#ff4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.addIngredientButton}
          onPress={openAddModal}
          testID="add-water-ingredient-button"
        >
          <ThemedText style={styles.addIngredientButtonText}>+ Add Ingredient</ThemedText>
        </TouchableOpacity>

        <AddIngredientModal
          visible={modalVisible}
          mode="water"
          initialData={editingIndex !== null ? ingredients[editingIndex] : null}
          onSave={handleSave}
          onClose={() => setModalVisible(false)}
        />
      </View>
    </Collapsible>
  );
}
