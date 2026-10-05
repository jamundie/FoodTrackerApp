import React, { useState } from 'react';
import { TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useDataExport } from '../hooks/useDataExport';
import type { ExportRangeKey } from '../utils/dateUtils';
import { statsStyles as styles } from '../styles/stats.styles';

const EXPORT_OPTIONS: { key: ExportRangeKey; label: string }[] = [
  { key: '7d', label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
  { key: 'all', label: 'All time' },
];

export default function DataExportCard() {
  const { exporting, error, exportData } = useDataExport();
  const [range, setRange] = useState<ExportRangeKey>('7d');

  return (
    <ThemedView style={styles.reportGeneratorContainer}>
      <ThemedView style={styles.periodRow}>
        {EXPORT_OPTIONS.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[styles.periodButton, range === key && styles.periodButtonActive]}
            onPress={() => setRange(key)}
            disabled={exporting}
            testID={`export-range-${key}`}
          >
            <ThemedText
              style={[styles.periodButtonText, range === key && styles.periodButtonTextActive]}
            >
              {label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ThemedView>

      <TouchableOpacity
        style={[styles.generateButton, exporting && styles.generateButtonDisabled]}
        onPress={() => exportData(range)}
        disabled={exporting}
        testID="export-data-button"
      >
        {exporting ? (
          <>
            <ActivityIndicator size="small" color="#fff" />
            <ThemedText style={styles.generateButtonText}>Preparing…</ThemedText>
          </>
        ) : (
          <ThemedText style={styles.generateButtonText}>Export to Excel</ThemedText>
        )}
      </TouchableOpacity>

      <ThemedText style={styles.hintText}>
        Spreadsheet with Food, Water, Bowel, Daily Summary and Patterns tabs.
      </ThemedText>
      {error && (
        <ThemedText style={styles.exportErrorText} testID="export-error">
          {error}
        </ThemedText>
      )}
    </ThemedView>
  );
}
