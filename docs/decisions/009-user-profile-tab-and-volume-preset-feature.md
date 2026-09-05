## TDR-009: User Profile Tab and Volume Preset Feature

**Date**: 2026-03-13
**Status**: Accepted
**Context**: Water entries had no way to record volume, and there was no persistent user identity or per-user defaults. Two related features were added together: a drink-size preset selector on the water entry form, and a new Profile tab where users configure personal details and their default glass size.

**Decision**:
1. Add `VolumePresetId`, `VolumePreset`, and `VOLUME_PRESETS` to `types/tracking.ts`. Extend `WaterEntry` with `volumePresetId`, `volumeMl`, and `totalVolume` (always set = preset ml + ingredient ml).
2. Add `UserProfile` type to `types/tracking.ts` (display name, age, weight, height, daily water goal, default volume preset ID).
3. Add `userProfile` state and `updateUserProfile` action to `TrackingContext`. Default preset is `'glass'` (250 ml).
4. Create `WaterVolumeSelector` — a modal dropdown component — used inline on the water entry form alongside the entry name field.
5. Create `ProfileForm` component (wraps `WaterVolumeSelector` for default glass selection) and `profile.tsx` screen.
6. Add "Profile" tab (Ionicons `person` icon) between Water and Stats in `_layout.tsx`.
7. `useWaterEntryForm` seeds its initial `volumePresetId` from `userProfile.defaultVolumePresetId` and resets to it on `resetForm()`.

**Alternatives considered**:
- Custom ml entry field instead of presets — rejected for simplicity; presets cover common cases
- Storing `UserProfile` outside Context (e.g. AsyncStorage only) — rejected; in-memory Context is consistent with existing state strategy; persistence can be added later
- Inline unit picker instead of modal for volume — rejected; modal keeps the name-row uncluttered on small screens

**Consequences**:
- `WaterEntry` now always carries `totalVolume`; existing mock entries updated accordingly
- `TrackingContext` shape expanded — any snapshot tests on raw context value would need updating (none exist currently)
- `useWaterEntryForm` now reads from context at hook init; tests that render the hook must wrap with `TrackingProvider`
- `stats.tsx` remains a stub — the Profile tab is inserted before it, shifting its tab index
