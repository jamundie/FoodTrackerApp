import React from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from './ThemedText';
import { WaterEntry, VOLUME_PRESETS } from '../types/tracking';
import { styles } from '../styles/food.styles';

export interface WaterEntriesListProps {
  waterEntries: WaterEntry[];
  onEditEntry?: (entry: WaterEntry) => void;
  onDeleteEntry?: (id: string) => void;
}

export default function WaterEntriesList({ waterEntries, onEditEntry, onDeleteEntry }: WaterEntriesListProps) {
  if (waterEntries.length === 0) {
    return null;
  }

  const handleDelete = (entry: WaterEntry) => {
    Alert.alert(
      'Delete Entry',
      `Delete "${entry.entryName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDeleteEntry?.(entry.id) },
      ]
    );
  };

  return (
    <View style={styles.recentSection}>
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        Recent Water Entries ({waterEntries.length})
      </ThemedText>
      {waterEntries
        .slice()
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .map((entry) => {
          const preset = VOLUME_PRESETS.find((p) => p.id === entry.volumePresetId);
          const presetLabel = preset ? preset.label : entry.volumePresetId;
          return (
            <View key={entry.id} style={styles.entryCard}>
              <ThemedText type="defaultSemiBold">{entry.entryName}</ThemedText>
              <ThemedText type="default" style={styles.hint}>
                {presetLabel} • {entry.totalVolume ?? entry.volumeMl} ml
              </ThemedText>
              {entry.ingredients.length > 0 && (
                <ThemedText type="default" style={styles.hint}>
                  {entry.ingredients.length} ingredient{entry.ingredients.length > 1 ? 's' : ''}
                </ThemedText>
              )}
              <ThemedText type="default" style={styles.hint}>
                {new Date(entry.timestamp).toLocaleString()}
              </ThemedText>
              {(onEditEntry || onDeleteEntry) && (
                <View style={styles.entryActions}>
                  {onEditEntry && (
                    <TouchableOpacity
                      style={[styles.entryActionButton, styles.editButton]}
                      onPress={() => onEditEntry(entry)}
                      testID={`edit-water-entry-${entry.id}`}
                    >
                      <ThemedText style={styles.editButtonText}>Edit</ThemedText>
                    </TouchableOpacity>
                  )}
                  {onDeleteEntry && (
                    <TouchableOpacity
                      style={[styles.entryActionButton, styles.deleteButton]}
                      onPress={() => handleDelete(entry)}
                      testID={`delete-water-entry-${entry.id}`}
                    >
                      <ThemedText style={styles.deleteButtonText}>Delete</ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          );
        })
      }
    </View>
  );
}
