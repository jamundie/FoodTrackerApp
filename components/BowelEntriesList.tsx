import React from 'react';
import { View } from 'react-native';
import { ThemedText } from './ThemedText';
import { BowelEntry, BRISTOL_DESCRIPTIONS, BOWEL_URGENCY_LABELS } from '../types/tracking';
import { styles } from '../styles/food.styles';
import { bowelStyles } from '../styles/bowel.styles';

export interface BowelEntriesListProps {
  bowelEntries: BowelEntry[];
}

export default function BowelEntriesList({ bowelEntries }: BowelEntriesListProps) {
  if (bowelEntries.length === 0) {
    return null;
  }

  return (
    <View style={styles.recentSection}>
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        Recent Bowel Entries ({bowelEntries.length})
      </ThemedText>
      {bowelEntries
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5)
        .map((entry) => (
          <View key={entry.id} style={styles.entryCard}>
            <ThemedText type="defaultSemiBold" style={bowelStyles.entryCardType}>
              {BRISTOL_DESCRIPTIONS[entry.bristolType]}
            </ThemedText>
            <ThemedText type="default" style={styles.hint}>
              Urgency: {BOWEL_URGENCY_LABELS[entry.urgency]}
              {entry.painLevel > 0 ? `  •  Pain: ${entry.painLevel}/10` : ''}
            </ThemedText>
            {entry.hasBlood && (
              <ThemedText type="default" style={bowelStyles.entryCardBlood}>
                Blood present
              </ThemedText>
            )}
            {entry.notes ? (
              <ThemedText type="default" style={styles.hint}>
                {entry.notes}
              </ThemedText>
            ) : null}
            <ThemedText type="default" style={styles.hint}>
              {new Date(entry.timestamp).toLocaleString()}
            </ThemedText>
          </View>
        ))}
    </View>
  );
}
