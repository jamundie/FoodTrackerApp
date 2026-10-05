import * as XLSX from 'xlsx';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { buildWorkbookBase64, shareWorkbook } from '../exportWorkbook';
import type { ExportSheets } from '../../lib/exportBuilder';
import { getExportRange } from '../dateUtils';

jest.mock('expo-file-system', () => ({
  cacheDirectory: 'file:///cache/',
  EncodingType: { Base64: 'base64' },
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
  deleteAsync: jest.fn().mockResolvedValue(undefined),
}));

const sheets: ExportSheets = {
  food: [['Date', 'Meal'], ['2026-10-04', 'Lasagne']],
  water: [['Date', 'Entry'], ['2026-10-04', 'Morning']],
  bowel: [['Date', 'Bristol type'], ['2026-10-04', 4]],
  dailySummary: [['Date', 'Calories'], ['2026-10-04', 500]],
  patterns: [['OVERVIEW'], ['Metric', 'Value']],
};

const range = getExportRange('7d', [], new Date(2026, 9, 5, 12));

describe('buildWorkbookBase64', () => {
  it('creates the five named tabs in order', () => {
    const wb = XLSX.read(buildWorkbookBase64(sheets), { type: 'base64' });
    expect(wb.SheetNames).toEqual(['Food', 'Water', 'Bowel', 'Daily Summary', 'Patterns']);
  });

  it('round-trips cell values', () => {
    const wb = XLSX.read(buildWorkbookBase64(sheets), { type: 'base64' });
    const rows = XLSX.utils.sheet_to_json<string[]>(wb.Sheets.Food, { header: 1 });
    expect(rows[1]).toEqual(['2026-10-04', 'Lasagne']);
    const bowel = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets.Bowel, { header: 1 });
    expect(bowel[1][1]).toBe(4);
  });
});

describe('shareWorkbook', () => {
  beforeEach(() => jest.clearAllMocks());

  it('writes the file, shares it, then deletes the cache copy', async () => {
    await shareWorkbook(sheets, range);

    const uri = 'file:///cache/health-export-2026-09-29-to-2026-10-05.xlsx';
    expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(uri, expect.any(String), { encoding: 'base64' });
    expect(Sharing.shareAsync).toHaveBeenCalledWith(uri, expect.objectContaining({ dialogTitle: expect.any(String) }));
    expect(FileSystem.deleteAsync).toHaveBeenCalledWith(uri, { idempotent: true });
  });

  it('throws without writing when sharing is unavailable', async () => {
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValueOnce(false);
    await expect(shareWorkbook(sheets, range)).rejects.toThrow('Sharing is not available');
    expect(FileSystem.writeAsStringAsync).not.toHaveBeenCalled();
  });

  it('still deletes the cache copy when the share sheet fails', async () => {
    (Sharing.shareAsync as jest.Mock).mockRejectedValueOnce(new Error('boom'));
    await expect(shareWorkbook(sheets, range)).rejects.toThrow('boom');
    expect(FileSystem.deleteAsync).toHaveBeenCalled();
  });
});
