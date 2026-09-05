## TDR-019: expo-camera for Barcode Scanning
**Date**: 2026-05-31
**Status**: Accepted
**Context**: `searchFoodByBarcode()` in `openFoodFactsService.ts` existed but had no UI. Barcode scanning was listed as Option C in the planned feature set.
**Decision**: Install `expo-camera` (the Expo-recommended package; `expo-barcode-scanner` is deprecated). A `BarcodeScannerModal` component wraps `CameraView` from `expo-camera` with a viewfinder overlay, handles camera permissions, calls `searchFoodByBarcode()` on a successful scan, and feeds the result to `applyNutritionToIngredient` via `onResult`. A scan-barcode icon button (Ionicons `barcode-outline`) is placed in each ingredient row header in `IngredientForm`, opening the modal targeted at that row index.
**Consequences**: Camera permission is requested at runtime on first scan — no additional app.json manifest changes required for development builds. The modal resets `scanning` state each time it opens so consecutive scans work without reopening. Not wired to `WaterIngredientsForm` (water additives are rarely barcoded).
