import React from 'react';
import { View } from 'react-native';
import { ThemedText } from './ThemedText';
import { WaterEntry } from '../types/tracking';
import { styles } from '../styles/food.styles';

export interface WaterEntriesListProps {
  waterEntries: WaterEntry[];
}

export default function WaterEntriesList({ waterEntries }: WaterEntriesListProps) {
  if (waterEntries.length === 0) {
    return null;
  }

  return (
    <View style={styles.recentSection}>
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        Recent Water Entries ({waterEntries.length})
      </ThemedText>
      {waterEntries
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 3)
        .map((entry) => (
          <View key={entry.id} style={styles.entryCard}>
            <ThemedText type="defaultSemiBold">{entry.entryName}</ThemedText>
            {entry.ingredients.length > 0 && (
              <ThemedText type="default" style={styles.hint}>
                {entry.ingredients.length} ingredient{entry.ingredients.length > 1 ? 's' : ''}
                {entry.totalVolume && ` • ${Math.round(entry.totalVolume)} ml`}
              </ThemedText>
            )}
            <ThemedText type="default" style={styles.hint}>
              {new Date(entry.timestamp).toLocaleString()}
            </ThemedText>
          </View>
        ))
      }
    </View>
  );
}