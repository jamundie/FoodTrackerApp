import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { ThemedView } from "../../components/ThemedView";
import { ThemedText } from "../../components/ThemedText";
import { useTracking } from "../../hooks/TrackingContext";
import { FoodEntry, Ingredient, Unit, FoodCategory, FOOD_CATEGORIES } from "../../types/tracking";
import { styles } from "../../styles/food.styles";

interface IngredientForm {
  name: string;
  amount: string;
  unit: Unit;
  caloriesPer100g: string;
}

export default function FoodScreen() {
  const { addFoodEntry, data } = useTracking();
  const [mealName, setMealName] = useState("");
  const [category, setCategory] = useState<FoodCategory | "">("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [customTimestamp, setCustomTimestamp] = useState("");
  const [ingredients, setIngredients] = useState<IngredientForm[]>([
    { name: "", amount: "", unit: "g", caloriesPer100g: "" },
  ]);

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { name: "", amount: "", unit: "g", caloriesPer100g: "" },
    ]);
  };

  const updateIngredient = (index: number, field: keyof IngredientForm, value: string) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const handleCategorySelect = (selectedCategory: FoodCategory) => {
    setCategory(selectedCategory);
    setShowCategoryDropdown(false);
  };

  const calculateTotalCalories = (processedIngredients: Ingredient[]): number => {
    return processedIngredients.reduce((total, ingredient) => {
      return total + (ingredient.calculatedCalories || 0);
    }, 0);
  };

  const handleSubmit = () => {
    if (!mealName.trim()) {
      Alert.alert("Error", "Please enter a meal name");
      return;
    }

    if (!category) {
      Alert.alert("Error", "Please select a category");
      return;
    }

    const validIngredients = ingredients.filter(
      (ingredient) => ingredient.name.trim() && ingredient.amount.trim()
    );

    if (validIngredients.length === 0) {
      Alert.alert("Error", "Please add at least one ingredient");
      return;
    }

    // Process ingredients
    const processedIngredients: Ingredient[] = validIngredients.map((ingredient, index) => {
      const amount = parseFloat(ingredient.amount) || 0;
      const caloriesPer100g = parseFloat(ingredient.caloriesPer100g) || undefined;

      let calculatedCalories: number | undefined;
      if (caloriesPer100g && amount > 0) {
        if (ingredient.unit === "g") {
          calculatedCalories = (amount * caloriesPer100g) / 100;
        } else if (ingredient.unit === "ml") {
          calculatedCalories = (amount * caloriesPer100g) / 100;
        } else if (ingredient.unit === "piece") {
          calculatedCalories = amount * caloriesPer100g;
        }
      }

      return {
        id: `${Date.now()}-${index}`,
        name: ingredient.name.trim(),
        amount,
        unit: ingredient.unit,
        caloriesPer100g,
        calculatedCalories,
      };
    });

    const totalCalories = calculateTotalCalories(processedIngredients);

    const foodEntry: FoodEntry = {
      id: Date.now().toString(),
      mealName: mealName.trim(),
      category: category as FoodCategory, // Safe to cast since we validate it above
      timestamp: customTimestamp || new Date().toISOString(),
      ingredients: processedIngredients,
      totalCalories: totalCalories > 0 ? totalCalories : undefined,
    };

    addFoodEntry(foodEntry);

    // Reset form
    setMealName("");
    setCategory("");
    setShowCategoryDropdown(false);
    setCustomTimestamp("");
    setIngredients([{ name: "", amount: "", unit: "g", caloriesPer100g: "" }]);

    Alert.alert("Success", "Food entry added successfully!");
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Add Food Entry
        </ThemedText>

        <View style={styles.inputGroup}>
          <ThemedText type="defaultSemiBold">Meal Name</ThemedText>
          <TextInput
            style={styles.input}
            value={mealName}
            onChangeText={setMealName}
            placeholder="e.g., Lasagne, Chicken Salad"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText type="defaultSemiBold">Category</ThemedText>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowCategoryDropdown(true)}
          >
            <Text style={[styles.dropdownButtonText, !category && styles.placeholderText]}>
              {category || "Select a category"}
            </Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <ThemedText type="defaultSemiBold">
            Custom Date/Time (optional)
          </ThemedText>
          <TextInput
            style={styles.input}
            value={customTimestamp}
            onChangeText={setCustomTimestamp}
            placeholder="Leave empty for current time"
            placeholderTextColor="#999"
          />
          <ThemedText type="default" style={styles.hint}>
            Format: YYYY-MM-DDTHH:mm:ss.sssZ (ISO format)
          </ThemedText>
        </View>

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
                    onPress={() => removeIngredient(index)}
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TextInput
                style={styles.input}
                value={ingredient.name}
                onChangeText={(value) => updateIngredient(index, "name", value)}
                placeholder="Ingredient name"
                placeholderTextColor="#999"
              />

              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.amountInput]}
                  value={ingredient.amount}
                  onChangeText={(value) => updateIngredient(index, "amount", value)}
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
                      onPress={() => updateIngredient(index, "unit", unit)}
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
                  updateIngredient(index, "caloriesPer100g", value)
                }
                placeholder="Calories per 100g (optional)"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
          ))}

          <TouchableOpacity 
            style={styles.addIngredientButton} 
            onPress={addIngredient}
            testID="add-ingredient-button"
          >
            <Text style={styles.addIngredientButtonText}>+ Add Ingredient</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleSubmit}
          testID="submit-food-entry-button"
        >
          <Text style={styles.submitButtonText}>Add Food Entry</Text>
        </TouchableOpacity>

        <Modal
          visible={showCategoryDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowCategoryDropdown(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.dropdownModal}>
              <Text style={styles.dropdownHeader}>Select Category</Text>
              <ScrollView>
                {FOOD_CATEGORIES.map((categoryOption) => (
                  <TouchableOpacity
                    key={categoryOption}
                    style={[
                      styles.categoryOption,
                      category === categoryOption && styles.selectedCategoryOption,
                    ]}
                    onPress={() => handleCategorySelect(categoryOption)}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        category === categoryOption && { fontWeight: "600" },
                      ]}
                    >
                      {categoryOption}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCategoryDropdown(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {data.foodEntries.length > 0 && (
          <View style={styles.recentSection}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Recent Entries ({data.foodEntries.length})
            </ThemedText>
            {data.foodEntries.slice(-3).reverse().map((entry) => (
              <View key={entry.id} style={styles.entryCard}>
                <ThemedText type="defaultSemiBold">{entry.mealName}</ThemedText>
                <ThemedText type="default" style={styles.hint}>{entry.category}</ThemedText>
                <ThemedText type="default" style={styles.hint}>
                  {entry.ingredients.length} ingredients
                  {entry.totalCalories && ` • ${Math.round(entry.totalCalories)} cal`}
                </ThemedText>
                <ThemedText type="default" style={styles.hint}>
                  {new Date(entry.timestamp).toLocaleString()}
                </ThemedText>
              </View>
            ))}
          </View>
        )}
      </ThemedView>
    </ScrollView>
  );
}
