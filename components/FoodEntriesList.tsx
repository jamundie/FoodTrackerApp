import React from 'react';
import { View } from 'react-native';
import { ThemedText } from './ThemedText';
import { FoodEntry } from '../types/tracking';
import { styles } from '../styles/food.styles';

export interface FoodEntriesListProps {
  foodEntries: FoodEntry[];
}

export default function FoodEntriesList({ foodEntries }: FoodEntriesListProps) {
  if (foodEntries.length === 0) {
    return null;
  }

  return (
    <View style={styles.recentSection}>
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        Recent Entries ({foodEntries.length})
      </ThemedText>
      {foodEntries
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 3)
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
          </View>
        ))
      }
    </View>
  );
}
