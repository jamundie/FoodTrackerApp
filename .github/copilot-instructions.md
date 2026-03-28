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
- All Supabase DB and storage calls go through `lib/trackingService.ts` — never call `supabase.from()` or `supabase.storage` directly from components or hooks
- Supabase client singleton is in `lib/supabase.ts` — import from there, never instantiate inline
- `TrackingContext` uses `user?.id` (not the whole `user` object) as `useEffect` dependency to prevent re-running when the auth provider returns a new object reference on re-render

### TypeScript Conventions
- All types live in `types/` directory - import from `types/tracking.ts`
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
- Modals follow naming convention: `*Modal.tsx` (e.g., `CategoryModal`, `DatePickerModal`)
- Always include backdrop press handling and proper state management
- Use consistent animation patterns across modals

### Form Component Architecture
```typescript
// Separate form data types from domain types
export type IngredientFormData = {
  name: string;
  amount: string; // Always string in forms
  unit: Unit;
  caloriesPer100g: string; // String until parsed
};

// Domain types use proper types
export type Ingredient = {
  id: string;
  name: string;
  amount: number; // Parsed number
  unit: Unit;
  caloriesPer100g?: number; // Optional parsed number
};
```

### Water Entry Patterns
- `WaterEntry` carries `volumePresetId` (which preset was selected), `volumeMl` (ml from preset), and `totalVolume` (preset ml + any ml ingredients — always set).
- Use `WaterVolumeSelector` (modal dropdown) wherever a preset picker is needed. Props: `selectedPresetId` + `onSelect`.
- `useWaterEntryForm` seeds `volumePresetId` from `userProfile.defaultVolumePresetId` and resets to it on `resetForm()`.

### Profile Pattern
- `ProfileForm` is a self-contained form component: reads an `UserProfile` prop, holds local draft state, calls `onSave(updated)` on submit.
- The profile screen (`app/(tabs)/profile.tsx`) wires `ProfileForm` directly to `useTracking()`.
- `ProfileForm` embeds `WaterVolumeSelector` for the default glass size field.


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
  - `modals/` - for modal components (e.g., `CategoryModal`, `DatePickerModal`)
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

## Documentation Protocol

Documentation must stay current as part of every feature or fix — **not as an afterthought**.

### Always — every non-trivial change
- **`docs/ARCHITECTURE.md`**: Update any section that is no longer accurate (component lists, data-flow, tech-stack versions, styling architecture, known limitations). Remove stale content; do not just append.

### When a new coding pattern is introduced
- **This file (`.github/copilot-instructions.md`)**: Add or revise the relevant section so the next feature automatically follows the same pattern.

### When a significant decision is made
Add a new TDR to **`docs/TECHNICAL_DECISIONS.md`** (next number is TDR-012):

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