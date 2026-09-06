# GitHub Copilot Instructions

## Overview
This is a React Native food tracking app built with Expo Router, TypeScript, and Context API, backed by Supabase (Postgres + Storage + Auth). Focus on type safety, performance, and consistent patterns when contributing.

## Architecture Patterns

### File-Based Routing with Expo Router
- Routes live in `app/` directory with automatic generation
- Tab navigation in `app/(tabs)/` — authenticated screens only
- Auth screens in `app/(auth)/` — sign-in and sign-up
- `AuthGate` in `app/_layout.tsx` handles redirects between auth and tabs
- Use `@/` path alias for imports (configured in `tsconfig.json`)

### Auth Pattern
- Auth state lives in `hooks/AuthContext.tsx` (`AuthProvider` + `useAuth`)
- `useAuth()` exposes: `user`, `session`, `loading`, `signIn`, `signUp`, `signOut`
- Sessions stored in device keychain via `expo-secure-store` (not AsyncStorage)
- Never read auth state from anywhere other than `useAuth()` — don't access `supabase.auth` directly in components

### State Management Strategy
- **Auth state**: Use `useAuth()` from `hooks/AuthContext.tsx`
- **Global tracking state**: Use `TrackingContext` in `hooks/TrackingContext.tsx`. Current context shape: `data` (food/water entries), `userProfile` (display name, age, weight, height, daily water goal, default volume preset), `loading`, `addFoodEntry`, `addWaterEntry`, `updateUserProfile`. All action functions are `async`.
- **Local state**: Use React's `useState` for component-specific UI state
- **Form state**: Use custom hooks like `useFoodEntryForm` / `useWaterEntryForm` for complex form logic. Form hooks may read from `userProfile` to seed default values (e.g. `defaultVolumePresetId`).
- Never introduce Redux or other state libraries - stick to React Context pattern
- Provider order in `app/_layout.tsx`: `AuthProvider` → `TrackingProvider` → `ThemeProvider`

### Persistence Pattern
- All Supabase DB, storage, and Edge Function calls go through `lib/trackingService.ts` — never call `supabase.from()`, `supabase.storage`, or `supabase.functions.invoke()` directly from components or hooks
- Supabase client singleton is in `lib/supabase.ts` — import from there, never instantiate inline
- `TrackingContext` uses `user?.id` (not the whole `user` object) as `useEffect` dependency to prevent re-running when the auth provider returns a new object reference on re-render

### Standalone Data Hooks (outside TrackingContext)
- Not every feature belongs in `TrackingContext`'s boot-time `Promise.all` load. Opt-in/infrequently-visited data (e.g. `hooks/useHealthReports.ts`) should be its own hook with its own `useState`/`useEffect`, fetching only when mounted — this keeps `TrackingContext`'s shape stable and avoids growing every app-start load for features most sessions won't touch
- Pattern: `loading` (fetch-on-mount state) + a separate `generating`/`submitting`-style busy flag for user-triggered async actions, guarded at the top of the action (`if (!x || generating) return`), `try { await service call } catch { Alert.alert(...) } finally { setGenerating(false) }`
- Still call through `lib/trackingService.ts` only — the hook itself never imports `lib/supabase.ts`

### TypeScript Conventions
- All types live in `types/` directory
- **Ingredient types** (`Unit`, `Ingredient`, `IngredientFormData`) live in `types/ingredient.ts` — import from there directly; `types/tracking.ts` re-exports them for backward compatibility only
- All other domain types import from `types/tracking.ts`
- Use strict typing with `const` assertions for readonly arrays (see `FOOD_CATEGORIES`, `VOLUME_PRESETS`)
- Custom hooks must have proper return types and error boundaries
- Form data interfaces separate from domain types (e.g., `IngredientFormData` vs `Ingredient`)
- Volume presets: use `VolumePresetId` union type; `VOLUME_PRESETS` constant holds all preset objects; always look up a preset from `VOLUME_PRESETS` by ID rather than constructing one inline

## Component Patterns

### Themed Components
- Use `ThemedText` and `ThemedView` instead of raw React Native components
- Theme components accept `lightColor`/`darkColor` props for manual overrides
- Use `useThemeColor` hook for custom themed components

### Modal Patterns
- Modals follow naming convention: `*Modal.tsx` (e.g., `CategoryModal`, `DatePickerModal`, `AddIngredientModal`)
- Always include backdrop press handling and proper state management
- Use consistent animation patterns across modals

### Ingredient List + AddIngredientModal Pattern
`IngredientForm.tsx` (food) and `WaterIngredientsForm.tsx` (water) render a **compact row list** — one row per ingredient (name + amount/unit), with Edit (pencil) and Trash icon actions reusing `entryActionButton`/`editButton`/`deleteButton` from `styles/food.styles.ts` (the same styles `FoodEntriesList`/`WaterEntriesList` use for whole-entry rows). Neither component renders the actual input fields inline anymore.

- `components/AddIngredientModal.tsx` holds the single-ingredient form and is shared by both screens via a `mode: "food" | "water"` prop. `mode="food"` renders `FoodSearchInput` + a barcode scan icon (opens `BarcodeScannerModal`); `mode="water"` renders a plain `TextInput` for the name, no search/scan.
- The modal owns a **local draft** (`useState<IngredientFormData>`) — nothing is written to the parent's `ingredients` array until Save. This gives Cancel a true discard.
- **Add flow** (`initialData` absent): Save calls `onSave(draft)`, then shows an "Ingredient added" confirmation with "Add Another" (resets to a blank draft) / "Done" (closes) — letting several ingredients be added back-to-back without reopening the modal.
- **Edit flow** (`initialData` present, from pressing the row's Edit icon): a single Save calls `onSave(draft)` and closes immediately — no add-another prompt.
- Delete (Trash icon) shows an `Alert.alert("Delete ingredient?", ...)` confirmation before calling `onRemoveIngredient(index)` — same pattern as whole-entry delete in `FoodEntriesList`/`WaterEntriesList`.
- `IngredientForm`/`WaterIngredientsForm` translate `onSave(draft)` into the existing hook calls via a `commitIngredientData` helper: for a new ingredient it calls `onAddIngredient()` then writes every defined field of the draft to the new index via `onUpdateIngredient`; for an edit it writes directly to the existing index. `onAddIngredient`/`onUpdateIngredient`/`onRemoveIngredient`/`onApplyNutrition` (food only) signatures are unchanged from the hooks — only how they're driven changed.
- `ingredients` seeds as `[]` for new entries (not a single blank row) in both `useFoodEntryForm` and `useWaterEntryForm` — the compact list starts empty with just the "+ Add Ingredient" button. `removeIngredient` has no "keep at least one" guard; the list can reach zero, since `validateForm` already requires ≥1 valid ingredient at submit time.

### Form Component Architecture
```typescript
// Separate form data types from domain types
export type IngredientFormData = {
  name: string;
  amount: string; // Always string in forms
  unit: Unit;
  // kcal per 100g for g/ml units; kcal per piece for piece unit
  caloriesRef: string;
};

// Domain types use proper types
export type Ingredient = {
  id: string;
  name: string;
  amount: number; // Parsed number
  unit: Unit;
  caloriesPer100g?: number; // Optional parsed number (always per-100g; piece semantics handled by scalingFactor)
};
```

### Barcode Scanning Pattern
- `BarcodeScannerModal` wraps `expo-camera`'s `CameraView` with a viewfinder overlay and handles camera permissions at runtime.
- `AddIngredientModal` (in `mode="food"`) renders a `barcode-outline` icon button next to the name field; pressing it opens `BarcodeScannerModal` targeted at the modal's current draft.
- On a successful scan the modal calls `searchFoodByBarcode()` from `openFoodFactsService.ts`; the result is passed to `onResult`, which writes straight into the draft (same field-population logic as a search-result select — see Nutrition Lookup Pattern below). The draft is only committed to the parent ingredient array on Save.
- The `scanning` boolean gate in `BarcodeScannerModal` prevents duplicate scan events; it resets each time the modal opens.
- Do NOT add `expo-barcode-scanner` — it is deprecated; use `expo-camera` only.

### Water Entry Patterns
- `WaterEntry` carries `volumePresetId` (which preset was selected), `volumeMl` (ml from preset), and `totalVolume` (preset ml + any ml ingredients — always set).
- Use `WaterVolumeSelector` (modal dropdown) wherever a preset picker is needed. Props: `selectedPresetId` + `onSelect`.
- `useWaterEntryForm` seeds `volumePresetId` from `userProfile.defaultVolumePresetId` and resets to it on `resetForm()`.

### Nutrition Lookup Pattern (Open Food Facts)

The ingredient name field inside `AddIngredientModal` (`mode="food"`) is a `FoodSearchInput` component — not a plain `TextInput`. It queries the Open Food Facts free API with a 350 ms debounce and shows a result dropdown.

**Key types in `types/ingredient.ts`:**
```ts
NutritionData {
  caloriesPer100g: number;
  proteinPer100g?: number;
  carbsPer100g?:   number;
  fatPer100g?:     number;
  fiberPer100g?:   number;
  sugarPer100g?:   number;
  saltPer100g?:    number;
}

Ingredient {
  ...
  nutritionData?:     NutritionData;   // from lookup or AI
  calculatedProtein?: number;
  calculatedCarbs?:   number;
  calculatedFat?:     number;
}

IngredientFormData {
  ...
  caloriesRef:        string;   // kcal per 100g for g/ml; kcal per piece for piece unit
  proteinPer100g?:    string;
  carbsPer100g?:      string;
  fatPer100g?:        string;
  nutritionSource?:   'manual' | 'open_food_facts' | 'gemini_vision';
}
```

**Rules:**
- `FoodSearchResult` and `NutritionData` from `lib/openFoodFactsService.ts` are the shared contract; Gemini Vision (Option B) must produce the same shapes.
- `useFoodEntryForm` exposes `applyNutritionToIngredient(index, result)` — this is the only way to write a lookup result into an ingredient row once the modal's draft is committed via `onSave`.
- `AddIngredientModal` calls `FoodSearchInput.onSelectResult` directly against its local draft; the result only reaches `applyNutritionToIngredient` indirectly, via `IngredientForm`'s `commitIngredientData` writing the saved draft's fields (including `nutritionSource`) back through `onUpdateIngredient`.
- Macro fields in `IngredientFormData` (`proteinPer100g`, `carbsPer100g`, `fatPer100g`) are strings for the form; `processIngredients()` parses them.
- `calculateTotals()` in `foodHelpers.ts` returns `MacroTotals`; use it instead of the deprecated `calculateTotalCalories()`.
- Ingredient name input placeholder is `"Search ingredient or product…"` — update tests accordingly.

### Daily Summary Pattern
- `DailySummaryCard` on the Home screen reads `data.foodEntries` and `userProfile` goals from `TrackingContext`.
- It filters entries by today's date using `isSameDay()` from `utils/dateUtils.ts`.
- The card renders nothing when the user has no entries today and no calorie goal set.
- Do not pass data into it via props — it is always context-driven.

### Stats Screen Pattern
- `app/(tabs)/stats.tsx` visualises historical trends across a user-selected 7 or 30-day period.
- All aggregation is done client-side via `useMemo` against `data.foodEntries`, `data.waterEntries`, and `data.bowelEntries` from `TrackingContext` — no new service calls.
- Skia `Rect` + `Line` primitives inside a `Canvas` are used for bar charts (daily calorie and water totals). Follow the same primitive pattern as `ProgressChart.tsx`.
- Macro averages and bowel Bristol-type distribution are rendered with plain React Native `View` progress bars — no Skia needed for horizontal bars.
- The bowel section is hidden when `bowelInPeriod.length === 0` to avoid noise for users who haven't used bowel tracking.
- Styles live in `styles/stats.styles.ts`.
- The screen never receives props — it is always context-driven. Do not add props to `StatsScreen`.

### Health Report Pattern
This is the repo's first Edge Function + cross-runtime shared module pair. Follow this shape for any future server-side compute (e.g. sleep/activity correlation work) rather than inventing a new one.

**Edge Function call flow:**
- Client → `trackingService.generateHealthReport(periodStart, periodEnd)` → `supabase.functions.invoke('generate-health-report', { body: { periodStart, periodEnd } })` — authenticated via the caller's session JWT, no service-role key
- The function (`supabase/functions/generate-health-report`) is scaffolded with `@supabase/server`'s `withSupabase({ auth: 'user' })`, giving an RLS-scoped `ctx.supabase` client — never a service-role client — so the function can only ever see the calling user's own rows
- Handler order: validate request → rate-limit check (`429` if ≥5 `health_reports` rows in the last 24h) → fetch `food_entries`/`water_entries`/`bowel_entries` for the period (2-day lookback buffer on food/water only, not bowel) → compute `summary_stats`/`correlations` via the shared modules below → send only that compact JSON to Gemini → insert into `health_reports` → return to caller
- Secrets: read via `Deno.env.get('GEMINI_API_KEY')`, set with `supabase secrets set`, never `EXPO_PUBLIC_*`. Local dev secret lives in `supabase/functions/.env` (gitignored)
- New Edge Functions are scaffolded with `supabase functions new <name> --auth user` and verified locally with `supabase functions serve --env-file supabase/functions/.env` against the local Postgres stack before merging (`supabase start` first)

**`lib/insightsEngine.ts` / `lib/ingredientTags.ts` shared-module convention:**
- Any logic that must run identically on both the client and an Edge Function (Deno) belongs in a plain, dependency-free `lib/*.ts` file — no React Native or Deno-specific APIs, unit-testable under plain Jest like `utils/foodHelpers.ts`
- Relative imports in these files **must** use explicit `.ts` extensions (e.g. `from '../utils/dateUtils.ts'`) — Deno's module resolution does not infer extensions the way Metro/tsc's bundler mode does. This is the only special rule; everything else is normal TypeScript
- `tsconfig.json` needs `allowImportingTsExtensions: true` for `tsc` to accept these files, and `supabase/functions` must stay in `tsconfig.json`'s `exclude` — that tree has its own Deno runtime, `npm:`/`jsr:` specifiers, and globals (`Deno.env`), type-checked separately by the Deno LSP, not `tsc`
- Do not attempt Deno's `sloppy-imports` unstable flag as an alternative — it satisfies the Deno LSP locally but the Supabase Edge Runtime's module graph construction does not honour it, producing a boot-time `Module not found` error in `supabase functions serve`
- The AI/report-computation boundary is a hard rule, not just this feature's convention: deterministic code computes all aggregates and correlation math; the LLM only ever receives the compact computed JSON to narrate, never raw entry rows

**`useHealthReports` lazy-load-outside-`TrackingContext` pattern:** see "Standalone Data Hooks" above — this is the reference implementation of that pattern. Any new opt-in/infrequently-used data source should follow it rather than growing `TrackingContext`'s boot-time `Promise.all`.

### Health Reports Pattern (UI)
- Lives in a "Health Reports" `SectionCard` at the bottom of `app/(tabs)/stats.tsx`, not a separate screen/tab — confirmed placement decision for issue #6.
- `StatsScreen` calls `useHealthReports()` directly and passes `reports`/`generating`/`generateReport` down; `HealthReportGenerator` and `HealthReportsList` are pure presentational components, no context access of their own.
- `HealthReportGenerator` owns its own 7/30/90-day period selection state — this is a report-specific `ReportPeriod` type, deliberately separate from `StatsScreen`'s own `Period` (7/30) used for the charts above it. Do not merge the two.
- `getPeriodDateRange(days)` in `utils/dateUtils.ts` converts a day count into the `{ periodStart, periodEnd }` YYYY-MM-DD strings `generateReport` expects.
- `useHealthReports` already surfaces generation failures via `Alert.alert` and returns reports newest-first — `HealthReportsList` does no error handling or sorting of its own.
- `HealthReport.correlations` is loosely typed (`Record<string, unknown>[]`, jsonb from the Edge Function) — `HealthReportsList` reads fields defensively and skips/falls back to the insufficient-data message for any malformed entry rather than throwing.
- Empty/insufficient-data states are copy-first ("keep logging and try again"), following the `RecentActivities` placeholder-row precedent rather than the `WaterEntriesList` return-`null` precedent — reports should say plainly when there isn't enough data, never render nothing.

### Nutrition Goals
- `UserProfile` carries `dailyCalorieGoal`, `dailyProteinGoal`, `dailyCarbGoal`, `dailyFatGoal` — all optional numbers.
- These are set in `ProfileForm` and persisted via `upsertUserProfile` in `trackingService.ts`.
- They have corresponding columns in the `user_profiles` Supabase table (added in `005_macros.sql`).

### Profile Pattern
- `ProfileForm` is a self-contained form component: reads an `UserProfile` prop, holds local draft state, calls `onSave(updated)` on submit.
- The profile screen (`app/(tabs)/profile.tsx`) wires `ProfileForm` directly to `useTracking()`.
- `ProfileForm` embeds `WaterVolumeSelector` for the default glass size field.

### Edit Entry Modal Pattern
- `EditFoodEntryModal` / `EditWaterEntryModal` are full-screen `Modal` components with a Cancel/Save header, a `ScrollView` body, and nested picker modals.
- They pass `initialEntry` and an `onSuccess` callback to the respective form hook (`useFoodEntryForm` / `useWaterEntryForm`). The hook seeds all form state from the entry and switches `handleSubmit` to call `updateFoodEntry` / `updateWaterEntry`.
- The parent screen passes `key={entry.id}` on the modal so the hook remounts with fresh state each time a different entry is selected for editing.
- `onSuccess` is wired to `onClose` so the modal closes automatically on a successful save.
- Storage-path `photoUri` values (non-`file://`) are dropped when seeding the edit form — only local `file://` URIs are displayable.
- `FoodEntriesList` / `WaterEntriesList` render Edit/Delete buttons only when the optional `onEditEntry` / `onDeleteEntry` props are provided. Delete confirmation is handled inside the list component via `Alert.alert`.
- The entry list no longer caps at 3 — all entries are shown in reverse-chronological order.


### Key Commands
```bash
npm run start          # Development server
npm run test           # Run Jest tests
npm run test:watch     # Test watch mode
npm run typecheck      # TypeScript checking
npm run lint           # Expo linting
npm run android        # Android build
npm run ios            # iOS build
```

### Testing Patterns
- Tests use `@testing-library/react-native` with Jest
- Mock data patterns established in `__tests__` files
- Some legacy tests use `.skip()` - update when modifying components
- Snapshot tests exist but prefer behavioral testing
- **Global mocks**: `jest.setup.ts` mocks `lib/supabase`, `lib/trackingService`, `hooks/AuthContext`, and `expo-secure-store` globally — tests run fully offline with no real credentials needed
- **Async context tests**: `TrackingContext` fires an async `load()` on mount. Tests that render `TrackingProvider` and then assert on context-driven state must wait for the initial load to settle first:
  ```tsx
  // Expose loading state in your test component, then:
  await waitFor(() => expect(getByTestId('context-loading').props.children).toBe('ready'));
  // Now safe to interact and assert on state
  ```
  This prevents a race where `load()` resolves after an optimistic update and overwrites it with empty data.
- **Test Organization**: Component tests must be organized into appropriate subfolders within `components/__tests__/`:
  - `forms/` - for form components (e.g., `IngredientForm`, `MealInfoForm`)
  - `lists/` - for list/display components (e.g., `FoodEntriesList`, `RecentActivities`)
  - `modals/` - for modal components (e.g., `CategoryModal`, `DatePickerModal`, `AddIngredientModal`)
  - `screens/` - for screen-level components
  - Create new categorized folders as needed for other component types
  - **Never place component tests directly in `components/__tests__/` root** - always organize into subfolders

### Performance Considerations
- Use `@shopify/react-native-skia` for charts and graphics (already configured)
- StyleSheet objects for styling, not inline styles
- `useCallback` for event handlers in complex forms
- Memoization patterns in `useFoodEntryForm` hook

## Utility Functions

### Date/Time Handling
- Use `utils/dateUtils.ts` for consistent timestamp creation
- Always work with ISO strings for persistence
- Local Date objects only for UI components

### Food Entry Processing
- Use `utils/foodHelpers.ts` for calorie calculations
- `processIngredients()` converts form data to domain objects
- `calculateTotalCalories()` aggregates ingredient calories
- Handle optional calorie data gracefully

## File Organization

### Critical Files
- `app/_layout.tsx` - Root provider setup (don't modify provider order)
- `hooks/AuthContext.tsx` - Auth state and session management
- `hooks/TrackingContext.tsx` - Central tracking state management
- `lib/supabase.ts` - Supabase client singleton
- `lib/trackingService.ts` - All Supabase DB/storage calls (the persistence layer)
- `types/tracking.ts` - All domain types
- `docs/ARCHITECTURE.md` - Detailed technical documentation

### Styling Architecture
- Component-specific styles in `styles/` directory
- Use StyleSheet.create() for performance
- Follow existing color theming patterns

## Integration Points

### Expo Router Navigation
- Use file-based routing - don't manually configure routes
- Navigation types auto-generated from file structure
- Deep linking works automatically with proper file naming

### Context Provider Setup
```tsx
// Root layout pattern - maintain this order
<AuthProvider>
  <TrackingProvider>
    <ThemeProvider value={theme}>
      <Slot />
    </ThemeProvider>
  </TrackingProvider>
</AuthProvider>
```

### External Dependencies
- `@expo/vector-icons` for consistent iconography
- `expo-image-picker` for camera and photo library access in `MealPhotoInput`
- `expo-secure-store` for session persistence in device keychain — install via `npx expo install`, not `npm install`
- `@supabase/supabase-js` for database, storage, and auth
- Skia for high-performance graphics (don't add other chart libraries)
- React Navigation automatically integrated via Expo Router
- No custom ml entry for water volume — presets only (`VOLUME_PRESETS` in `types/tracking.ts`)

## Common Gotchas

1. **Form validation**: Always validate before calling `processIngredients()`
2. **ID generation**: Use consistent UUID patterns for new entities
3. **Unit handling**: Support g/ml/piece units consistently
4. **Calorie calculations**: Handle missing nutritional data gracefully
5. **Date/time precision**: Use 15-minute intervals for time selections

## Graphify — Orient Before Reading Docs

This repo has a pre-built, committed knowledge graph at `.graphify/` (`graph.json`, `GRAPH_REPORT.md`). A `.husky/post-commit` hook keeps it structurally current automatically.

**Before reading `docs/ARCHITECTURE.md`, `docs/TECHNICAL_DECISIONS.md`, or grepping across the codebase for context on existing code**, query the graph first:

```
npx graphifyy@latest summary .graphify/graph.json
npx graphifyy@latest explain "<NodeName>" --graph .graphify/graph.json
npx graphifyy@latest minimal-context <file> --graph .graphify/graph.json
```

Fall back to full docs/source reads only when the graph doesn't answer the question. See `AGENTS.md`'s Graphify section for the full workflow, including semantic authoring for new patterns/concepts.

## Documentation Protocol

Documentation must stay current as part of every feature or fix — **not as an afterthought** — but scoped to files actually touched, not a full-document review pass.

### Always — every non-trivial change
- **`docs/ARCHITECTURE.md`**: Update only the sections affected by the files you changed (component lists, data-flow, tech-stack versions, styling architecture, known limitations). Remove stale content; do not just append.

### When a new coding pattern is introduced
- **This file (`.github/copilot-instructions.md`)**: Add or revise the relevant section so the next feature automatically follows the same pattern.

### When a significant decision is made
TDRs live one-per-file in **`docs/decisions/NNN-slug.md`**, indexed at **`docs/TECHNICAL_DECISIONS.md`** (check that index for the next number). Add a new file and a row to the index table:

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

### When architecture diagrams need updating
Update or create draw.io diagrams in `docs/diagrams/` when:
- A new screen, tab, or major component is added
- Data flow through `TrackingContext` changes
- A new TDR is written that changes component relationships

Diagram files live at `docs/diagrams/*.mmd` (existing Mermaid) and `docs/diagrams/*.xml` (draw.io). Prefer draw.io XML for new diagrams — see **draw.io Diagram Rules** in `AGENTS.md`.

### Checklist before committing a feature
- [ ] `docs/ARCHITECTURE.md` reflects the current state (no stale sections)
- [ ] This file updated if a new coding pattern was introduced
- [ ] TDR added to `docs/TECHNICAL_DECISIONS.md` if criteria above are met
- [ ] `AGENTS.md` updated if project structure or conventions changed
- [ ] `docs/diagrams/` updated if component structure or data flow changed

## draw.io Diagram Rules

Use this workflow when creating or updating architecture diagrams.

### Browser injection — loading XML into the live editor

`window.sb.editorUi` is the live `EditorUi` instance (not `window.App` or `window.EditorUi`).

```js
// Load XML
const ui = window.sb.editorUi;
const doc = mxUtils.parseXml(xmlString);
ui.editor.setGraphXml(doc.documentElement);

// Fit to screen after loading
window.sb.editorUi.editor.graph.fit();
```

`mxUtils` is available globally. The "Edit Diagram" textarea (Extras menu) is not accessible via DOM — always use `setGraphXml()`.

### Colour palette (IBM Carbon — colourblind-safe)

| Role | Fill | Stroke |
|---|---|---|
| Normal step | `#D0E8FF` | `#648FFF` |
| Exception / loop | `#FFF3CD` | `#FFB000` |
| Success / final | `#D6F5E3` | `#24A148` |
| Cancel / reject | `#FFD6E8` | `#DC267F` |
| Branch diamond | `#FFE0C2` | `#FE6100` |
| Panel / path (purple) | `#E8D5FF` | `#785EF0` |

### XML authoring rules

- **Z-order:** declare background panels **first** in the XML; foreground content after — later elements render on top.
- **Font size in HTML cells:** use `<span style="font-size:9px;">` inside `html=1` cells, not `<font size="9">`.
- **HTML entities in `value=`:** use `&lt;` `&gt;` `&quot;` `&amp;`; line breaks with `&lt;br&gt;`.
- **Swimlane backgrounds:** plain rectangles with `opacity=30` — avoid draw.io native swimlane containers (they add unwanted chrome).
- **Loop boxes:** plain rectangle, `fillColor=none`, coloured dashed stroke, `fontStyle=1`, `verticalAlign=top`.
- **Lifelines (sequence diagrams):** dashed edge (`dashed=1`) from actor header down to a terminal ellipse at the bottom.
- **Point-to-point edges (no attached nodes):** use `<mxPoint as="sourcePoint">` / `<mxPoint as="targetPoint">` inside `<mxGeometry>` — omit `source=` and `target=` on the cell.
- **Page size for complex diagrams:** `pageWidth="1654" pageHeight="1169"` (A3 landscape).

### QA workflow

1. Open `https://app.diagrams.net/` in Chrome.
2. Inject XML via `window.sb.editorUi.editor.setGraphXml()`.
3. Call `.fit()` to zoom to fit.
4. Take a screenshot to visually verify colours, labels, edges, z-order.
5. Save the XML to `docs/diagrams/<name>.xml`.