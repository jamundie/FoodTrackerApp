## TDR-029: Multi-Tab XLSX Data Export via Native Share Sheet
**Date**: 2026-10-05
**Status**: Accepted
**Context**: Users asked to download their data for the last week, last month or all time, split into separate food, bowel and water views plus some pattern analysis. A CSV file cannot hold multiple tabs, so the requirement needed either a real spreadsheet format or several files. The app is a mobile client with all entries already in memory in `TrackingContext`, and the Edge Function reporting path (TDR-024/026) is for AI narration, not data portability.
**Decision**: Export a single `.xlsx` workbook with five tabs: Food, Water, Bowel, Daily Summary and Patterns.
- **Format:** `.xlsx` over a zip of CSVs or one sectioned CSV. It opens natively in Excel, Numbers and Google Sheets and gives real tabs with one share action.
- **Library:** `xlsx` (SheetJS) `0.18.x`. `XLSX.write(wb, { type: 'base64' })` yields a string `expo-file-system` can write directly. `write-excel-file` was rejected because it only outputs a `Blob`, and React Native cannot build a Blob from binary data. The npm `xlsx@0.18.5` has known CVEs in the *parsing* path; the export only writes, and never reads untrusted files at runtime (the library is read only in tests, on files we generate).
- **Delivery:** `expo-sharing` opens the native share sheet from a file in `FileSystem.cacheDirectory`; the cache copy is deleted afterwards (finally block) since it contains health data.
- **No backend change:** the export is built client-side from `useTracking().data`, so there is no migration, no `trackingService` function and no new Edge Function.
- **Split of responsibility:** `lib/exportBuilder.ts` is pure (rows only, no RN imports, unit-tested under plain Jest); `utils/exportWorkbook.ts` owns xlsx + file + share; `hooks/useDataExport.ts` owns busy/error state; `components/DataExportCard.tsx` is the UI.
- **Patterns tab:** reuses `computeCorrelations` and `extractTriggerExposures` from `lib/insightsEngine.ts`, so figures match the AI health report. Food/water entries up to 48h before the range start are used as exposure (same buffer as the Edge Function) but not exported. Rows where no adverse outcome followed exposure are omitted and the rest are sorted strongest first. Infinite lift is written as text because it cannot be stored in a cell.
- **Placement:** an "Export Data" `SectionCard` at the bottom of the Stats tab, following TDR-025.
**Consequences**:
- Two new dependencies (`xlsx`, `expo-sharing`); `expo-sharing` needs a native rebuild of dev clients.
- Mobile only: `expo-sharing` is not supported on web, and the hook surfaces that as an inline error rather than failing silently.
- The whole workbook is built in memory on the JS thread. This is fine for personal-scale histories; a very large all-time export may briefly block the UI, and moving the build off-thread would be a future decision.
- Exports contain no photos (they are encrypted and stored as paths).
- Timestamps are written as local date and time columns only, not raw UTC.
