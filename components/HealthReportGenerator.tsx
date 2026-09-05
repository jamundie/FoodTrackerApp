import React, { useState } from 'react';
import { TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { getPeriodDateRange } from '../utils/dateUtils';
import { statsStyles as styles } from '../styles/stats.styles';

// Local to report generation — independent of the Stats charts' own Period
// type (which only supports 7/30), since 90-day reports are report-specific.
type ReportPeriod = 7 | 30 | 90;

const REPORT_PERIODS: ReportPeriod[] = [7, 30, 90];

export interface HealthReportGeneratorProps {
  generating: boolean;
  onGenerate: (periodStart: string, periodEnd: string) => void;
}

export default function HealthReportGenerator({ generating, onGenerate }: HealthReportGeneratorProps) {
  const [period, setPeriod] = useState<ReportPeriod>(30);

  const handleGenerate = () => {
    const { periodStart, periodEnd } = getPeriodDateRange(period);
    onGenerate(periodStart, periodEnd);
  };

  return (
    <ThemedView style={styles.reportGeneratorContainer}>
      <ThemedView style={styles.periodRow}>
        {REPORT_PERIODS.map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodButton, period === p && styles.periodButtonActive]}
            onPress={() => setPeriod(p)}
            testID={`report-period-${p}`}
          >
            <ThemedText
              style={[styles.periodButtonText, period === p && styles.periodButtonTextActive]}
            >
              {p} Days
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ThemedView>

      <TouchableOpacity
        style={[styles.generateButton, generating && styles.generateButtonDisabled]}
        onPress={handleGenerate}
        disabled={generating}
        testID="generate-report-button"
      >
        {generating ? (
          <>
            <ActivityIndicator size="small" color="#fff" />
            <ThemedText style={styles.generateButtonText}>Generating…</ThemedText>
          </>
        ) : (
          <ThemedText style={styles.generateButtonText}>Generate Report</ThemedText>
        )}
      </TouchableOpacity>
      {generating && (
        <ThemedText style={styles.hintText}>
          This can take several seconds — analysing your data and writing the report.
        </ThemedText>
      )}
    </ThemedView>
  );
}
