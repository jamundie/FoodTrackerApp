import React from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from './ThemedText';
import { FoodEntry } from '../types/tracking';
import { styles } from '../styles/food.styles';

export interface FoodEntriesListProps {
  foodEntries: FoodEntry[];
  onEditEntry?: (entry: FoodEntry) => void;
  onDeleteEntry?: (id: string) => void;
}

export default function FoodEntriesList({ foodEntries, onEditEntry, onDeleteEntry }: FoodEntriesListProps) {
  if (foodEntries.length === 0) {
    return null;
  }

  const handleDelete = (entry: FoodEntry) => {
    Alert.alert(
      'Delete Entry',
      `Delete "${entry.mealName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDeleteEntry?.(entry.id) },
      ]
    );
  };

  return (
    <View style={styles.recentSection}>
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        Recent Entries ({foodEntries.length})
      </ThemedText>
      {foodEntries
        .slice()
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .map((entry) => (
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
            {(onEditEntry || onDeleteEntry) && (
              <View style={styles.entryActions}>
                {onEditEntry && (
                  <TouchableOpacity
                    style={[styles.entryActionButton, styles.editButton]}
                    onPress={() => onEditEntry(entry)}
                    testID={`edit-food-entry-${entry.id}`}
                  >
                    <ThemedText style={styles.editButtonText}>Edit</ThemedText>
                  </TouchableOpacity>
                )}
                {onDeleteEntry && (
                  <TouchableOpacity
                    style={[styles.entryActionButton, styles.deleteButton]}
                    onPress={() => handleDelete(entry)}
                    testID={`delete-food-entry-${entry.id}`}
                  >
                    <ThemedText style={styles.deleteButtonText}>Delete</ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        ))
      }
    </View>
  );
}
