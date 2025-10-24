import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { ThemedText } from "./ThemedText";
import { Unit } from "../types/tracking";
import { styles } from "../styles/food.styles";
import { Collapsible } from "./Collapsible";

interface WaterIngredientFormData {
  name: string;
  amount: string;
  unit: Unit;
  caloriesPer100g: string;
}

interface WaterIngredientsFormProps {
  ingredients: WaterIngredientFormData[];
  onUpdateIngredient: (index: number, field: keyof WaterIngredientFormData, value: string) => void;
  onAddIngredient: () => void;
  onRemoveIngredient: (index: number) => void;
}

export default function WaterIngredientsForm({
  ingredients,
  onUpdateIngredient,
  onAddIngredient,
  onRemoveIngredient,
}: WaterIngredientsFormProps) {
  return (
    <Collapsible title="Add Flavoring / Supplements (Optional)">
      <View style={styles.ingredientsSection}>
        {ingredients.map((ingredient, index) => (
          <View key={index} style={styles.ingredientCard}>
            <View style={styles.ingredientHeader}>
              <ThemedText type="default">Ingredient {index + 1}</ThemedText>
              {ingredients.length > 1 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => onRemoveIngredient(index)}
                >
                  <Text style={styles.removeButtonText} testID={`remove-water-ingredient-${index}`}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>

            <TextInput
              style={styles.input}
              value={ingredient.name}
              onChangeText={(value) => onUpdateIngredient(index, "name", value)}
              placeholder="e.g., Lemon juice, Protein powder"
              placeholderTextColor="#999"
            />

            <View style={styles.row}>
              <View style={styles.amountInput}>
                <TextInput
                  style={styles.input}
                  value={ingredient.amount}
                  onChangeText={(value) => onUpdateIngredient(index, "amount", value)}
                  placeholder="Amount"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.unitPicker}>
                {(["g", "ml", "piece"] as Unit[]).map((unit) => (
                  <TouchableOpacity
                    key={unit}
                    style={[
                      styles.unitButton,
                      ingredient.unit === unit && styles.unitButtonSelected,
                    ]}
                    onPress={() => onUpdateIngredient(index, "unit", unit)}
                  >
                    <Text
                      style={[
                        styles.unitButtonText,
                        ingredient.unit === unit && styles.unitButtonTextSelected,
                      ]}
                    >
                      {unit}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TextInput
              style={styles.input}
              value={ingredient.caloriesPer100g}
              onChangeText={(value) => onUpdateIngredient(index, "caloriesPer100g", value)}
              placeholder="Calories per 100g (optional)"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>
        ))}

        <TouchableOpacity
          style={styles.addIngredientButton}
          onPress={onAddIngredient}
          testID="add-water-ingredient-button"
        >
          <Text style={styles.addIngredientButtonText}>+ Add Another Ingredient</Text>
        </TouchableOpacity>
      </View>
    </Collapsible>
  );
}

export type { WaterIngredientFormData };