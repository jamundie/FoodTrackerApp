import { useState, useCallback } from 'react';
import { useTracking } from './TrackingContext';
import { getExportRange } from '../utils/dateUtils';
import type { ExportRangeKey } from '../utils/dateUtils';
import { buildExportSheets } from '../lib/exportBuilder';
import { shareWorkbook } from '../utils/exportWorkbook';

/** Builds an .xlsx from in-memory tracking data and opens the share sheet. */
export function useDataExport() {
  const { data, userProfile } = useTracking();
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportData = useCallback(
    async (key: ExportRangeKey) => {
      if (exporting) return;
      setExporting(true);
      setError(null);
      try {
        const timestamps = [
          ...data.foodEntries,
          ...data.waterEntries,
          ...data.bowelEntries,
        ].map((e) => e.timestamp);
        const range = getExportRange(key, timestamps);
        await shareWorkbook(buildExportSheets(data, userProfile, range), range);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Export failed.');
      } finally {
        setExporting(false);
      }
    },
    [data, userProfile, exporting],
  );

  return { exporting, error, exportData };
}
