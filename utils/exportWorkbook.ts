/**
 * Native I/O half of the data export: assembles the .xlsx workbook, writes it to
 * the cache directory and opens the share sheet. Row building is in lib/exportBuilder.ts.
 */
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { buildExportFilename } from '../lib/exportBuilder';
import type { ExportSheets, SheetRows } from '../lib/exportBuilder';
import type { ExportRange } from './dateUtils';

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const XLSX_UTI = 'org.openxmlformats.spreadsheetml.sheet';

// Excel sheet names are capped at 31 chars and these tabs are fixed by design.
const SHEET_ORDER: { name: string; key: keyof ExportSheets }[] = [
  { name: 'Food', key: 'food' },
  { name: 'Water', key: 'water' },
  { name: 'Bowel', key: 'bowel' },
  { name: 'Daily Summary', key: 'dailySummary' },
  { name: 'Patterns', key: 'patterns' },
];

/** Approximate auto-fit: widest cell per column, capped. Single-cell rows are notes that overflow into empty neighbours, so they're ignored. */
const columnWidths = (rows: SheetRows) => {
  const widest = rows.reduce<number[]>((acc, row) => {
    if (row.length === 1) return acc;
    row.forEach((cell, i) => {
      const len = cell == null ? 0 : String(cell).length;
      acc[i] = Math.max(acc[i] ?? 0, len);
    });
    return acc;
  }, []);
  return widest.map((w) => ({ wch: Math.min(Math.max(w + 2, 10), 50) }));
};

export function buildWorkbookBase64(sheets: ExportSheets): string {
  const wb = XLSX.utils.book_new();
  SHEET_ORDER.forEach(({ name, key }) => {
    const rows = sheets[key];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = columnWidths(rows);
    XLSX.utils.book_append_sheet(wb, ws, name);
  });
  return XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
}

/** Writes the workbook to cache and opens the native share sheet. Throws when sharing is unavailable. */
export async function shareWorkbook(sheets: ExportSheets, range: ExportRange): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing is not available on this device.');
  }
  if (!FileSystem.cacheDirectory) {
    throw new Error('No writable cache directory available.');
  }

  const uri = `${FileSystem.cacheDirectory}${buildExportFilename(range)}`;
  await FileSystem.writeAsStringAsync(uri, buildWorkbookBase64(sheets), {
    encoding: FileSystem.EncodingType.Base64,
  });

  try {
    await Sharing.shareAsync(uri, {
      mimeType: XLSX_MIME,
      UTI: XLSX_UTI,
      dialogTitle: 'Export health data',
    });
  } finally {
    // Cache copy contains health data; don't leave it lying around after sharing.
    await FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => undefined);
  }
}
