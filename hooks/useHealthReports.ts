import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './AuthContext';
import { HealthReport } from '../types/tracking';
import { generateHealthReport, fetchHealthReports } from '../lib/trackingService';

/**
 * Lazily loaded — not part of TrackingContext's boot sequence, since reports
 * are opt-in and infrequent. Fetches only once the Reports UI mounts this hook.
 */
export function useHealthReports() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [reports, setReports] = useState<HealthReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) {
      setReports([]);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchHealthReports(userId);
      setReports(data);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const generateReport = useCallback(async (periodStart: string, periodEnd: string) => {
    if (!userId || generating) return;
    setGenerating(true);
    try {
      const report = await generateHealthReport(periodStart, periodEnd);
      setReports((prev) => [report, ...prev]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      Alert.alert('Report generation failed', message);
    } finally {
      setGenerating(false);
    }
  }, [userId, generating]);

  return { reports, loading, generating, generateReport, refresh };
}
