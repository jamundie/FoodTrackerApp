import React from 'react';
import { View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { HealthReport } from '../types/tracking';
import { statsStyles as styles } from '../styles/stats.styles';

export interface HealthReportsListProps {
  reports: HealthReport[];
}

/** Shape produced by lib/insightsEngine.ts's computeCorrelations — HealthReport.correlations is loosely typed as it's jsonb, so fields are read defensively. */
function formatCorrelation(correlation: Record<string, unknown>): string | null {
  const tag = correlation.tag;
  const outcomeLabel = correlation.outcomeLabel;
  const windowHours = correlation.windowHours;
  const lift = correlation.lift;
  const exposedCount = correlation.exposedCount;

  if (
    typeof tag !== 'string' ||
    typeof outcomeLabel !== 'string' ||
    typeof windowHours !== 'number' ||
    typeof lift !== 'number' ||
    typeof exposedCount !== 'number'
  ) {
    return null;
  }

  const liftLabel = Number.isFinite(lift) ? `${lift.toFixed(1)}x` : 'much';
  return `${outcomeLabel} was ${liftLabel} more likely within ${windowHours}h of ${tag.replace(/_/g, ' ')} — based on ${exposedCount} occurrence${exposedCount === 1 ? '' : 's'}.`;
}

function formatPeriod(report: HealthReport): string {
  return `${report.periodStart} – ${report.periodEnd}`;
}

function ReportCard({ report }: { report: HealthReport }) {
  const correlationLines = report.correlations
    .map(formatCorrelation)
    .filter((line): line is string => line !== null);

  return (
    <View style={styles.reportCard}>
      <ThemedText type="defaultSemiBold" style={styles.reportCardPeriod}>
        {formatPeriod(report)}
      </ThemedText>
      <ThemedText type="default" style={styles.hintText}>
        Generated {new Date(report.generatedAt).toLocaleString()}
      </ThemedText>

      <ThemedText type="default" style={styles.reportCardText}>
        {report.aiReportText}
      </ThemedText>

      <View style={styles.correlationsBlock}>
        <ThemedText type="defaultSemiBold" style={styles.subsectionLabel}>
          Correlations
        </ThemedText>
        {correlationLines.length > 0 ? (
          correlationLines.map((line, i) => (
            <ThemedText key={i} type="default" style={styles.correlationLine}>
              • {line}
            </ThemedText>
          ))
        ) : (
          <ThemedText type="default" style={styles.emptyText}>
            Not enough data yet to surface a reliable correlation for this period — keep logging and try a
            longer period next time.
          </ThemedText>
        )}
      </View>
    </View>
  );
}

export default function HealthReportsList({ reports }: HealthReportsListProps) {
  if (reports.length === 0) {
    return (
      <ThemedText type="default" style={styles.emptyText}>
        No reports yet — generate one above to see your first health report.
      </ThemedText>
    );
  }

  return (
    <ThemedView style={styles.reportsHistory}>
      <ThemedText type="defaultSemiBold" style={styles.subsectionLabel}>
        Past Reports ({reports.length})
      </ThemedText>
      {reports.map((report) => (
        <ReportCard key={report.id} report={report} />
      ))}
    </ThemedView>
  );
}
