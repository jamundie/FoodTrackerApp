## TDR-008: Meal Photo Feature with expo-image-picker

**Date**: 2026-03-13
**Status**: Accepted
**Context**: Users want to attach a photo to a meal entry for reference. A future goal is to run AI analysis on the photo to auto-populate estimated ingredients, so the architecture must support that hook without requiring a redesign.

**Decision**: Add an optional `photoUri?: string` field to `FoodEntry`. Introduce a `MealPhotoInput` presentational component that uses `expo-image-picker` to let the user take a photo or pick from the library (one photo per meal). Photo state is kept separate from ingredient state in `useFoodEntryForm` so AI analysis can overwrite ingredients without touching the photo. The photo is rendered in `MealInfoForm` between the Date & Time and Ingredients sections.

**Alternatives considered**:
- `expo-camera` directly — more control but higher complexity; `expo-image-picker` covers both camera and library with one API
- Storing photos in the Context/global state — rejected; photo URI lives only in form state until the entry is submitted, keeping global state minimal
- Embedding the photo in `MealInfoData` — rejected; photo is independent of meal metadata and must survive ingredient resets from AI analysis

**Consequences**:
- `expo-image-picker` is now a runtime dependency (requires camera and media library permissions on device)
- `FoodEntry.photoUri` is optional — existing entries without photos are unaffected
- AI analysis hook: call `analyzePhoto(entry.photoUri)` post-submit and pipe result to `setIngredients()`; no architectural change needed
- Tests mock `expo-image-picker` globally in `jest.setup.ts`
