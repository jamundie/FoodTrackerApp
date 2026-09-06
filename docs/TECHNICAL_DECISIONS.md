# Technical Decision Records (TDRs)

This directory tracks major technical decisions made during the development of the Food Tracker App. Each TDR is its own file — read only the ones relevant to your task rather than the whole set (use `graphify explain "TDR-XXX"` or `minimal-context` first to find the relevant entries; see `AGENTS.md`'s Graphify section).

**Next number: TDR-028**

## Template for new TDRs

```markdown
## TDR-XXX: [Title]
**Date**: YYYY-MM-DD
**Status**: Accepted
**Context**: Why this change was needed
**Decision**: What was decided and why; alternatives considered
**Consequences**: Trade-offs and implications
```

**A TDR is required for:**
- New external dependency added
- New screen, tab, or navigation pattern
- New global state shape (context fields added/removed/renamed)
- Data persistence introduced or changed
- New component category or test subfolder added
- Architectural pattern changed (styling, typing, ID generation, etc.)

**A TDR is NOT required for:**
- Bug fixes and refactors that don't change patterns
- Adding a new component that follows an existing pattern
- Style or copy changes

## Index

| TDR | Title | Date | Status |
|---|---|---|---|
| [TDR-001](./decisions/001-expo-router-over-react-navigation.md) | Expo Router over React Navigation | August 2025 | Accepted |
| [TDR-002](./decisions/002-react-context-api-for-state-management.md) | React Context API for State Management | August 2025 | Accepted |
| [TDR-003](./decisions/003-react-native-skia-for-charts.md) | React Native Skia for Charts | August 2025 | Accepted |
| [TDR-004](./decisions/004-typescript-strict-mode.md) | TypeScript Strict Mode | August 2025 | Accepted |
| [TDR-005](./decisions/005-native-builds-required.md) | Native Builds Required | August 2025 | Accepted |
| [TDR-006](./decisions/006-styles-directory-structure.md) | Styles Directory Structure | August 2025 | Accepted |
| [TDR-007](./decisions/007-split-date-time-picker-with-calendar-interface.md) | Split Date/Time Picker with Calendar Interface | August 2025 | Accepted |
| [TDR-008](./decisions/008-meal-photo-feature-with-expo-image-picker.md) | Meal Photo Feature with expo-image-picker | 2026-03-13 | Accepted |
| [TDR-009](./decisions/009-user-profile-tab-and-volume-preset-feature.md) | User Profile Tab and Volume Preset Feature | 2026-03-13 | Accepted |
| [TDR-010](./decisions/010-supabase-for-cloud-persistence.md) | Supabase for Cloud Persistence | 2026-03-28 | Accepted |
| [TDR-011](./decisions/011-supabase-auth-expo-secure-store-for-session-persistence.md) | Supabase Auth + expo-secure-store for Session Persistence | 2026-03-28 | Accepted |
| [TDR-012](./decisions/012-client-side-aes-256-gcm-encryption-for-meal-photos.md) | Client-Side AES-256-GCM Encryption for Meal Photos | 2026-03-28 | Accepted |
| [TDR-013](./decisions/013-bowel-movement-tracking-feature.md) | Bowel Movement Tracking Feature | 2026-04-24 | Accepted |
| [TDR-014](./decisions/014-sleep-data-integration-strategy-garmin-via-platform-health-apis.md) | Sleep Data Integration Strategy — Garmin via Platform Health APIs | 2026-04-24 | Proposed |
| [TDR-015](./decisions/015-generic-photo-infrastructure-user-photos-bucket-photoinput-component.md) | Generic Photo Infrastructure (user-photos bucket + PhotoInput component) | 2026-04-24 | Accepted |
| [TDR-016](./decisions/016-dedicated-types-ingredient-ts-module.md) | Dedicated `types/ingredient.ts` Module | 2026-05-31 | Accepted |
| [TDR-017](./decisions/017-open-food-facts-api-integration-for-nutrition-lookup.md) | Open Food Facts API Integration for Nutrition Lookup | 2026-05-31 | Accepted |
| [TDR-018](./decisions/018-full-macro-tracking-protein-carbs-fat.md) | Full Macro Tracking (Protein, Carbs, Fat) | 2026-05-31 | Accepted |
| [TDR-019](./decisions/019-expo-camera-for-barcode-scanning.md) | expo-camera for Barcode Scanning | 2026-05-31 | Accepted |
| [TDR-020](./decisions/020-entry-history-with-full-crud-edit-and-delete.md) | Entry History with Full CRUD (Edit and Delete) | 2026-05-31 | Accepted |
| [TDR-021](./decisions/021-gemini-vision-ai-photo-analysis.md) | Gemini Vision AI Photo Analysis | 2026-05-31 | Accepted |
| [TDR-022](./decisions/022-stats-screen-implementation.md) | Stats Screen Implementation | 2026-05-31 | Accepted |
| [TDR-023](./decisions/023-ci-driven-supabase-migrations.md) | CI-Driven Supabase Migrations | 2026-09-05 | Accepted |
| [TDR-024](./decisions/024-generate-health-report-supabase-edge-function.md) | `generate-health-report` Supabase Edge Function | 2026-09-05 | Accepted |
| [TDR-025](./decisions/025-health-report-ui-placement-stats-tab-section.md) | Health Report UI Placement — Stats Tab Section | 2026-09-05 | Accepted |
| [TDR-026](./decisions/026-ai-health-report-generation-via-supabase-edge-function.md) | AI Health Report Generation via Supabase Edge Function | 2026-09-05 | Accepted |
| [TDR-027](./decisions/027-compact-ingredient-list-with-add-ingredient-modal.md) | Compact Ingredient List with AddIngredientModal | 2026-09-06 | Accepted |
