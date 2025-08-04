import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { ThemedText } from "./ThemedText";
import { Unit } from "../types/tracking";
import { styles } from "../styles/food.styles";

interface IngredientFormData {
  name: string;
  amount: string;
  unit: Unit;
  caloriesPer100g: string;
}

interface IngredientFormProps {
  ingredients: IngredientFormData[];
  onUpdateIngredient: (index: number, field: keyof IngredientFormData, value: string) => void;
  onAddIngredient: () => void;
  onRemoveIngredient: (index: number) => void;
}

export default function IngredientForm({
  ingredients,
  onUpdateIngredient,
  onAddIngredient,
  onRemoveIngredient,
}: IngredientFormProps) {
  return (
    <View style={styles.ingredientsSection}>
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        Ingredients
      </ThemedText>

      {ingredients.map((ingredient, index) => (
        <View key={index} style={styles.ingredientCard}>
          <View style={styles.ingredientHeader}>
            <ThemedText type="default">Ingredient {index + 1}</ThemedText>
            {ingredients.length > 1 && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => onRemoveIngredient(index)}
              >
                <Text style={styles.removeButtonText} testID={`remove-ingredient-${index}`}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>

          <TextInput
            style={styles.input}
            value={ingredient.name}
            onChangeText={(value) => onUpdateIngredient(index, "name", value)}
            placeholder="Ingredient name"
            placeholderTextColor="#999"
          />

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.amountInput]}
              value={ingredient.amount}
              onChangeText={(value) => onUpdateIngredient(index, "amount", value)}
              placeholder="Amount"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />

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
            onChangeText={(value) =>
              onUpdateIngredient(index, "caloriesPer100g", value)
            }
            placeholder="Calories per 100g (optional)"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>
      ))}

      <TouchableOpacity 
        style={styles.addIngredientButton} 
        onPress={onAddIngredient}
        testID="add-ingredient-button"
      >
        <Text style={styles.addIngredientButtonText}>+ Add Ingredient</Text>
      </TouchableOpacity>
    </View>
  );
}

export type { IngredientFormData };
