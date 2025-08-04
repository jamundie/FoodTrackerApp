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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState({ hours: new Date().getHours(), minutes: 0 });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
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

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  const handleTimeSelect = (hours: number, minutes: number) => {
    setSelectedTime({ hours, minutes });
    setShowTimePicker(false);
  };

  const createTimestamp = (): string => {
    const combinedDateTime = new Date(selectedDate);
    combinedDateTime.setHours(selectedTime.hours, selectedTime.minutes, 0, 0);
    return combinedDateTime.toISOString();
  };

  const formatDisplayDate = (date: Date): string => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return "Today";
    }
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatDisplayTime = (hours: number, minutes: number): string => {
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const paddedMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${paddedMinutes} ${period}`;
  };

  const generateCalendarDays = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday
    
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) { // 6 weeks × 7 days
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.toDateString() === today.toDateString();
      const isPast = date <= today;
      
      days.push({
        date: new Date(date),
        day: date.getDate(),
        isCurrentMonth,
        isToday,
        isPast,
        isSelectable: isPast && isCurrentMonth
      });
    }
    
    return days;
  };

  const [calendarDate, setCalendarDate] = useState(new Date());

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
      timestamp: createTimestamp(),
      ingredients: processedIngredients,
      totalCalories: totalCalories > 0 ? totalCalories : undefined,
    };

    addFoodEntry(foodEntry);

    // Reset form
    setMealName("");
    setCategory("");
    setShowCategoryDropdown(false);
    setSelectedDate(new Date());
    setSelectedTime({ hours: new Date().getHours(), minutes: 0 });
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
            Date & Time
          </ThemedText>
          
          {/* Date Picker */}
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowDatePicker(true)}
            testID="date-picker-button"
          >
            <Text style={styles.dropdownButtonText}>
              {formatDisplayDate(selectedDate)}
            </Text>
            <Text style={styles.dropdownArrow}>📅</Text>
          </TouchableOpacity>

          {/* Time Picker */}
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowTimePicker(true)}
            testID="time-picker-button"
          >
            <Text style={styles.dropdownButtonText}>
              {formatDisplayTime(selectedTime.hours, selectedTime.minutes)}
            </Text>
            <Text style={styles.dropdownArrow}>🕒</Text>
          </TouchableOpacity>
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

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.dropdownModal}>
            <Text style={styles.dropdownHeader}>Select Date</Text>
            <ScrollView>
              {/* Quick Options */}
              <TouchableOpacity
                style={styles.categoryOption}
                onPress={() => handleDateSelect(new Date())}
                testID="date-today"
              >
                <Text style={styles.categoryOptionText}>Today</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.categoryOption}
                onPress={() => {
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  handleDateSelect(yesterday);
                }}
                testID="date-yesterday"
              >
                <Text style={styles.categoryOptionText}>Yesterday</Text>
              </TouchableOpacity>

              {/* Separator / Calendar Toggle */}
              <TouchableOpacity 
                style={styles.dateSeparator}
                onPress={() => setShowCalendar(!showCalendar)}
                testID="calendar-toggle-button"
              >
                <Text style={styles.dateSeparatorText}>
                  Or choose a specific date {showCalendar ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>

              {showCalendar && (
                <View style={styles.calendarContainer}>
                  {/* Calendar Header */}
                  <View style={styles.calendarHeader}>
                    <TouchableOpacity
                      style={styles.calendarNavButton}
                      onPress={() => {
                        const newDate = new Date(calendarDate);
                        newDate.setMonth(newDate.getMonth() - 1);
                        setCalendarDate(newDate);
                      }}
                      testID="calendar-prev-month"
                    >
                      <Text style={styles.calendarNavText}>◀</Text>
                    </TouchableOpacity>
                    
                    <Text style={styles.calendarHeaderText}>
                      {calendarDate.toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </Text>
                    
                    <TouchableOpacity
                      style={[
                        styles.calendarNavButton,
                        calendarDate.getMonth() === new Date().getMonth() && 
                        calendarDate.getFullYear() === new Date().getFullYear() && 
                        styles.calendarNavButtonDisabled
                      ]}
                      onPress={() => {
                        const newDate = new Date(calendarDate);
                        newDate.setMonth(newDate.getMonth() + 1);
                        const today = new Date();
                        if (newDate <= today) {
                          setCalendarDate(newDate);
                        }
                      }}
                      disabled={
                        calendarDate.getMonth() === new Date().getMonth() && 
                        calendarDate.getFullYear() === new Date().getFullYear()
                      }
                      testID="calendar-next-month"
                    >
                      <Text style={[
                        styles.calendarNavText,
                        calendarDate.getMonth() === new Date().getMonth() && 
                        calendarDate.getFullYear() === new Date().getFullYear() && 
                        styles.calendarNavTextDisabled
                      ]}>▶</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Calendar Days of Week */}
                  <View style={styles.calendarDaysHeader}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <Text key={day} style={styles.calendarDayHeaderText}>
                        {day}
                      </Text>
                    ))}
                  </View>

                  {/* Calendar Grid */}
                  <View style={styles.calendarGrid}>
                    {generateCalendarDays(calendarDate.getFullYear(), calendarDate.getMonth()).map((dayInfo, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.calendarDay,
                          !dayInfo.isCurrentMonth && styles.calendarDayOtherMonth,
                          dayInfo.isToday && styles.calendarDayToday,
                          !dayInfo.isSelectable && styles.calendarDayDisabled,
                          dayInfo.date.toDateString() === selectedDate.toDateString() && styles.calendarDaySelected
                        ]}
                        onPress={() => {
                          if (dayInfo.isSelectable) {
                            handleDateSelect(dayInfo.date);
                          }
                        }}
                        disabled={!dayInfo.isSelectable}
                        testID={`calendar-day-${dayInfo.date.toISOString().split('T')[0]}`}
                      >
                        <Text style={[
                          styles.calendarDayText,
                          !dayInfo.isCurrentMonth && styles.calendarDayTextOtherMonth,
                          dayInfo.isToday && styles.calendarDayTextToday,
                          !dayInfo.isSelectable && styles.calendarDayTextDisabled,
                          dayInfo.date.toDateString() === selectedDate.toDateString() && styles.calendarDayTextSelected
                        ]}>
                          {dayInfo.day}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
         
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.dropdownModal}>
            <Text style={styles.dropdownHeader}>Select Time</Text>
            <ScrollView>
              {Array.from({ length: 24 }, (_, hour) =>
                [0, 15, 30, 45].map((minute) => (
                  <TouchableOpacity
                    key={`${hour}-${minute}`}
                    style={styles.categoryOption}
                    onPress={() => handleTimeSelect(hour, minute)}
                    testID={`time-${hour}-${minute}`}
                  >
                    <Text style={styles.categoryOptionText}>
                      {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowTimePicker(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
