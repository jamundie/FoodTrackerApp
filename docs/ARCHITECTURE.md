# Architecture Documentation

## Overview
Food Tracker App is a React Native application built with Expo, designed for tracking nutritional intake with a focus on performance, user experience, and maintainability. Data is persisted to Supabase (Postgres + Storage), with user identity managed via Supabase Auth and sessions stored in the device keychain.

## Core Technologies

### Frontend Stack
- **React Native 0.79.5**: Cross-platform mobile development
- **Expo SDK 53**: Development tooling and managed workflow
- **TypeScript 5.8.3**: Static typing for better code quality
- **Expo Router 5.1.3**: File-based navigation system

### UI & Graphics
- **@shopify/react-native-skia**: High-performance 2D graphics for charts
- **@expo/vector-icons**: Icon library
- **expo-image-picker**: Camera and photo library access for meal photos
- **React Native StyleSheet**: Styling with performance optimizations

### State Management
- **React Context API**: Global state management (`AuthContext`, `TrackingContext`)
- **Custom Hooks**: Encapsulated business logic
- **Local Component State**: For UI-specific state

### Backend & Persistence
- **Supabase (Postgres)**: Cloud database — `food_entries`, `food_ingredients`, `water_entries`, `water_ingredients`, `bowel_entries`, `user_profiles`, `health_reports` (see [Reporting](#reporting) for schema and indexes)
- **Supabase Storage**: Private `user-photos` bucket; photos are AES-256-GCM encrypted on-device before upload — server holds only opaque ciphertext
- **Supabase Auth**: Email/password authentication; session stored in device keychain via `expo-secure-store`
- **Row Level Security (RLS)**: All tables scoped to `auth.uid() = user_id` — data isolation enforced at DB layer
- **Supabase Edge Functions**: `generate-health-report` (Deno) — first backend compute layer; JWT-scoped, no service-role key

## Architecture Patterns

### System Overview

```
┌─────────────────────────────────────────────────────┐
│                    App Layer                         │
│  Expo Router  │  (auth) group  │  (tabs) group       │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│               Provider Stack (app/_layout.tsx)       │
│  AuthProvider → TrackingProvider → ThemeProvider     │
└────────────┬──────────────────────────┬─────────────┘
             │                          │
┌────────────▼──────────┐  ┌────────────▼────────────┐
│    AuthContext         │  │    TrackingContext        │
│  session, user,        │  │  data (food/water/bowel), │
│  signIn/signUp/signOut │  │  userProfile, loading,    │
│  (hooks/AuthContext)   │  │  addFoodEntry/            │
└────────────┬──────────┘  │  addWaterEntry/            │
             │              │  addBowelEntry/            │
             │              │  updateUserProfile         │
             │              └────────────┬─────────────┘
             │                           │
┌────────────▼───────────────────────────▼─────────────┐
│                 Persistence Layer                      │
│              lib/trackingService.ts                    │
│  fetchFoodEntries / insertFoodEntry                    │
│  fetchWaterEntries / insertWaterEntry                  │
│  fetchBowelEntries / insertBowelEntry                  │
│  fetchUserProfile / upsertUserProfile                  │
│  uploadPhoto / getDecryptedPhotoUri                    │
└──────────────────────┬────────────────────────────────┘
                       │
┌──────────────────────▼────────────────────────────────┐
│               lib/supabase.ts (client singleton)       │
│     Supabase JS client + ExpoSecureStoreAdapter        │
└──────────────────────┬────────────────────────────────┘
                       │
┌──────────────────────▼────────────────────────────────┐
│                    Supabase Cloud                       │
│  Postgres (RLS)  │  Auth  │  Storage (user-photos)     │
└────────────────────────────────────────────────────────┘
```

📊 **[View System Overview Diagram](./diagrams/system-overview.mmd)**

### Component Hierarchy

📊 **[View Component Hierarchy Diagram](./diagrams/component-hierarchy.mmd)**

### 1. File-Based Routing
```
app/
├── (auth)/           # Auth route group (unauthenticated)
│   ├── _layout.tsx   # Headerless stack layout
│   ├── sign-in.tsx   # Email/password sign-in
│   └── sign-up.tsx   # Registration + email verification state
├── (tabs)/           # Tab navigation group (authenticated)
│   ├── index.tsx     # Home/Dashboard
│   ├── food.tsx      # Food tracking
│   ├── water.tsx     # Water tracking
│   ├── bowel.tsx     # Bowel movement tracking
│   ├── profile.tsx   # User profile + sign-out
│   └── stats.tsx     # Statistics — bar charts, macro trends, bowel health
├── _layout.tsx       # Root layout: AuthProvider + AuthGate + providers
└── +not-found.tsx    # 404 handling
```

**AuthGate** (in `app/_layout.tsx`): redirects unauthenticated users to `/(auth)/sign-in` and authenticated users away from auth screens.

**Benefits:**
- Intuitive navigation structure
- Automatic route generation
- Type-safe navigation
- Easy deep linking setup

### 2. Component Architecture
```
components/
├── MealInfoForm.tsx      # Meal metadata form (name, category, date/time, photo)
├── PhotoInput.tsx          # Generic photo picker/preview; supports camera + library; optional label/aspect/quality props
├── IngredientForm.tsx    # Dynamic ingredient card list
├── CategoryModal.tsx     # Category selection modal
├── FoodEntriesList.tsx   # Rendered list of past food entries
├── WaterInfoForm.tsx     # Water entry metadata form (name, volume preset, date/time)
├── WaterVolumeSelector.tsx  # Modal dropdown for selecting drink-size preset
├── WaterIngredientsForm.tsx # Water ingredient card list
├── WaterEntriesList.tsx  # Rendered list of past water entries
├── BowelEntryForm.tsx    # Bristol type, urgency, pain, blood toggle, notes
├── BowelEntriesList.tsx  # Rendered list of past bowel entries
├── ProfileForm.tsx       # User profile form (name, age, weight, height, goals, default glass)
├── HealthReportGenerator.tsx # Period picker (7/30/90d) + generate button/loading, Stats tab
├── HealthReportsList.tsx      # Past health reports newest-first, AI text + correlations, Stats tab
├── Themed*/              # Design system components
└── __tests__/            # Component tests
```

**Design Principles:**
- Single Responsibility Principle
- Composition over inheritance
- Reusable and testable components
- Consistent theming system

### 3. State Management Strategy

#### Auth State (AuthContext)
- Managed by `hooks/AuthContext.tsx`
- Exposes: `user`, `session`, `loading`, `signIn`, `signUp`, `signOut`
- Session persisted to device keychain via `expo-secure-store`

#### Global Tracking State (TrackingContext)
- Managed by `hooks/TrackingContext.tsx`
- Depends on `useAuth()` — loads data for signed-in user, clears on sign-out
- Uses `user?.id` (not the whole `user` object) as `useEffect` dependency to avoid re-running on object reference changes
- **Optimistic updates**: `addFoodEntry` / `addWaterEntry` update local state immediately before the Supabase write resolves
- User tracking data (food, water intake)
- User profile (`userProfile`: display name, age, weight, height, daily water goal, default glass volume preset)

#### Local State
- Form inputs
- UI toggles
- Component-specific data

#### Benefits of This Approach:
- Lightweight compared to Redux
- Built-in React patterns
- Easy to understand and maintain
- Auth and data concerns cleanly separated into two contexts

### 4. Persistence Layer

`lib/trackingService.ts` isolates all Supabase DB and storage calls. `TrackingContext` never imports from `lib/supabase.ts` directly — it only calls service functions. This makes the persistence layer swappable and trivially mockable in tests.

**Meal photos flow:**
1. User picks/captures photo → local `file://` URI stored in form state
2. On submit: `uploadPhoto` reads the file, encrypts it on-device (AES-256-GCM, per-user key in device keychain), uploads ciphertext to private `user-photos` bucket as `userId/entryId.enc`
3. Returned storage path stored on `FoodEntry.photoUri`
4. `hooks/useSignedPhotoUrl.ts` calls `getDecryptedPhotoUri`: downloads ciphertext via signed URL, decrypts on-device, writes to a temp `file://` URI for `<Image>` to render
5. Encryption key (`PHOTO_ENCRYPTION_KEY`) lives only in `expo-secure-store` — never leaves the device

**Health reports:** `hooks/useHealthReports.ts` is a standalone hook (own `useState`/`useEffect`, not folded into `TrackingContext`) — reports are opt-in and infrequent, so eagerly loading them in the boot-time `Promise.all` would grow every app-start load for a feature most sessions won't touch. It fetches `fetchHealthReports(userId)` on mount and exposes `generateReport(periodStart, periodEnd)`, which calls `generateHealthReport` (invokes the `generate-health-report` Edge Function via `supabase.functions.invoke`) and prepends the result to local state on success. Consumed by the Stats tab's Health Reports section (`components/HealthReportGenerator.tsx` + `components/HealthReportsList.tsx`) — `useHealthReports` surfaces generation failures via `Alert.alert` itself, so the UI has no separate error state to render. Full generation flow and schema: see [Reporting](#reporting) below.

### 5. Styling Architecture
```
styles/
├── auth.styles.ts    # Sign-in / sign-up screen styles
├── food.styles.ts    # All food screen + component styles (includes photo input)
├── water.styles.ts   # Water screen + volume selector styles
├── profile.styles.ts # Profile screen styles
├── index.styles.ts   # Home screen styles
└── layout.styles.ts  # Layout styles
```

**Strategy:**
- Centralized styling files
- StyleSheet.create() for performance
- Consistent spacing and colors via constants
- Platform-specific styles when needed

### 6. Type Safety
```
types/
├── tracking.ts       # Domain-specific type definitions
│                     # — FoodEntry, WaterEntry, VolumePreset, UserProfile, BowelEntry, HealthReport
│                     # — re-exports Unit, Ingredient, IngredientFormData from ./ingredient
└── ingredient.ts     # Shared ingredient module — Unit, Ingredient, IngredientFormData
                      # Imported directly by food/water forms, helpers, and trackingService
```

**Implementation:**
- Strict TypeScript configuration
- Interface definitions for all data structures
- Typed navigation parameters
- Generic hooks for reusability

## Reporting

AI-generated health correlation reports (e.g. "does loose stools correlate with dairy intake?") — the first backend compute layer in the app (see TDR-026). Raw entry logs are never sent to the LLM; a deterministic stats/correlation layer runs first, and only its compact JSON output is sent to Gemini for narration.

### `supabase/functions/generate-health-report` (Edge Function)

The app's first Supabase Edge Function (Deno runtime), introduced to fix the pre-existing security gap where the Gemini key was bundled client-side (`EXPO_PUBLIC_GEMINI_API_KEY`, see TDR-021) with no rate limiting.

**Flow:**
1. Client calls the function with `{ periodStart, periodEnd }` (`YYYY-MM-DD`), authenticated via the user's session JWT — no service-role key, RLS applies throughout
2. Rate limit check: rejects with `429` if the caller already has ≥5 `health_reports` rows generated in the last 24h
3. Fetches `food_entries`, `water_entries`, `bowel_entries` for the period, widened by a 2-day lookback buffer on food/water only (so a bowel entry near the period start can still see triggers just before it)
4. Computes `summary_stats` and `correlations` via `lib/insightsEngine.ts` — the **same shared module** used by the Stats screen, imported by relative path into the Deno function (see below)
5. Sends only that compact JSON (never raw entry logs) to Gemini (`gemini-2.5-flash`, thinking disabled to avoid output truncation) with a report-writing prompt hard-coding the "not medical advice" and correlation-≠-causation framing
6. A code-level backstop (`ensureBloodCallout`) appends a doctor recommendation if the model's own text somehow omits it despite `hasBlood === true` in the period's data — the mandatory safety call-out never depends solely on prompt compliance
7. Inserts the result into `health_reports` and returns it to the caller

**Secrets:** the Gemini key is stored as an Edge Function secret (`GEMINI_API_KEY`, via `supabase secrets set`), never `EXPO_PUBLIC_*`. Local dev reads it from `supabase/functions/.env` (gitignored).

### `lib/insightsEngine.ts` + `lib/ingredientTags.ts` (shared modules)

Plain, dependency-free TypeScript — no React Native or Deno-specific APIs — so both files are unit-testable under plain Jest (like `utils/foodHelpers.ts`) and importable unmodified by both the client (Stats screen) and the Deno Edge Function.

- **`lib/insightsEngine.ts`**: daily aggregation (calories, water, macro averages — the same shapes previously computed inline in `app/(tabs)/stats.tsx`, now extracted so the Stats screen and the report engine share one implementation) plus the correlation/lift-ratio math that compares outcome rates in a trigger's lookback window against baseline.
- **`lib/ingredientTags.ts`**: a static, hand-maintained ingredient → trigger-tag lookup (`tagIngredient(name)`) using name-substring regex matching (e.g. `milk|cheese|yog(h)?urt` → `dairy`). Ten tags covered (`dairy`, `gluten`, `caffeine`, `alcohol`, `spicy`, `fried`, `high_fat`, `high_fodmap`, `artificial_sweetener`, `citrus`). No DB schema change or backfill — tags are derived on the fly at report-generation time.

**Sharing with Deno:** both files use explicit `.ts` extensions on their relative imports (`allowImportingTsExtensions` in `tsconfig.json`), since Deno's module resolution — unlike Metro/tsc's bundler mode — does not infer extensions. This lets the Edge Function import them unmodified with **zero logic duplication** between client and server. `supabase/functions` is excluded from the root `tsconfig.json` — it has its own Deno runtime, module specifiers (`npm:`/`jsr:`), and globals (`Deno.env`), and is type-checked separately by the Deno LSP / `supabase functions serve`, not `tsc`.

### `health_reports` table

Added in migration `009_health_reports.sql`. Stores generated reports as immutable snapshots — RLS policies cover select/insert/delete only (no update), matching the `bowel_entries` precedent (reports are never edited after generation).

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | FK to `auth.users`, cascade delete |
| `period_start` / `period_end` | `date` | The report's date range |
| `generated_at` | `timestamptz` | Defaults to `now()` |
| `summary_stats` | `jsonb` | Deterministic aggregates from `insightsEngine.ts` — the app's first `jsonb` columns |
| `correlations` | `jsonb` | Lift-ratio correlation results, keyed on a generic `entry_type` (not food/water/bowel-specific) so sleep/activity tracking can feed the same engine later without a second migration |
| `ai_report_text` | `text` | Gemini's generated narrative |
| `model` | `text` | Model identifier used (`gemini-2.5-flash`) |

Index: `idx_health_reports_user_period` on `(user_id, period_start desc)` — supports the newest-first history query in `fetchHealthReports`.

**Reporting indexes** (migration `008_reporting_indexes.sql`): prior to this feature, no indexes existed beyond implicit PKs on `food_entries`, `water_entries`, or `bowel_entries` — every fetch in `trackingService.ts` pulled the full unfiltered history per user. Added `idx_food_entries_user_timestamp`, `idx_water_entries_user_timestamp`, and `idx_bowel_entries_user_timestamp` (each `(user_id, timestamp desc)`) to support the Edge Function's server-side, date-range queries.

## Performance Considerations

### 1. React Native Skia for Charts
- **Why**: 60fps animations, complex graphics capability
- **Alternative considered**: Victory Native (chose Skia for performance)
- **Trade-off**: Larger bundle size for better UX

### 2. Native Builds Required
- Skia and `expo-secure-store` require native compilation
- Cannot use Expo Go for development
- Development builds necessary for testing

### 3. Memory Management
- StyleSheet.create() for style caching
- Memoized components where appropriate
- Lazy loading for heavy screens

## Development Workflow

### Testing Strategy
- **Framework**: Jest + `@testing-library/react-native`
- **Global mocks**: `jest.setup.ts` mocks `lib/supabase`, `lib/trackingService`, `hooks/AuthContext`, and `expo-secure-store` so all tests run without network or native modules
- **Async pattern**: Tests that render `TrackingProvider` must wait for the initial `load()` to settle (`await waitFor(() => loading === 'ready')`) before asserting on context-driven state, to avoid race conditions with optimistic updates
- **Test organization**: `components/__tests__/forms/`, `lists/`, `modals/`, `screens/`

### Code Quality
- **Husky**: Pre-commit hooks
- **TypeScript**: Compile-time error checking
- **Expo Lint**: Code style consistency

### Build Process
- **Development**: `expo start` with development build
- **Android**: `npm run android`
- **iOS**: `npm run ios`
- **Supabase migrations**: SQL files in `supabase/migrations/`, numbered sequentially (001 → 009). Local/first-time setup runs them manually in the Supabase Dashboard SQL Editor; pushes to `main` deploy them automatically to production via `.github/workflows/supabase-migrations.yml` (Supabase CLI `db push`)

## Scalability Considerations

### Current Architecture Supports:
- Adding new tracking categories (exercise, sleep, etc.)
- Multiple user accounts (data isolated by RLS)
- Cross-device sync (data in cloud, not local-only)
- Push notifications (future enhancement)

### Future Enhancements:
- Social features
- Advanced analytics
- OAuth providers (Google/Apple) — layerable on top of existing AuthContext

## Security & Privacy
- Session tokens stored in device keychain (iOS Keychain / Android Keystore) via `expo-secure-store`
- Meal photos encrypted on-device (AES-256-GCM) before upload — Supabase Storage holds only ciphertext; decryption key never leaves the device keychain
- Row Level Security enforced at DB layer — user data isolated even from direct DB queries
- Supabase credentials stored in `.env.local` (gitignored); CI uses GitHub environment secrets

## Current Implementation Status

### Implemented & Supabase-backed
| Feature | Status | Notes |
|---|---|---|
| Food tracking | Complete | Form with Open Food Facts live search, per-ingredient macro tracking, daily summary, photo (encrypted upload/download), Supabase-persisted |
| Nutrition lookup | Complete | `FoodSearchInput` queries Open Food Facts; results auto-fill calories + protein/carbs/fat; manual entry preserved |
| Macro tracking | Complete | `Ingredient` carries `calculatedProtein/Carbs/Fat`; `FoodEntry` carries `totalProtein/Carbs/Fat`; `calculateTotals()` in `foodHelpers.ts` |
| Nutrition goals | Complete | `UserProfile` carries `dailyCalorieGoal/ProteinGoal/CarbGoal/FatGoal`; set in Profile tab; shown in `DailySummaryCard` |
| Daily summary | Complete | `DailySummaryCard` on Home — today's calorie + macro progress bars vs goals; context-driven, no props |
| Water tracking | Complete | Volume preset selector, optional ingredients, optimistic updates, Supabase-persisted |
| User profile | Complete | Display name, age, weight, height, water goal, glass size, nutrition goals — Supabase-persisted |
| Auth | Complete | Email/password, session in device keychain |
| Bowel movement tracking | Complete | Bristol scale 1–7 (optional on false alarm), false alarm flag, urgency, pain level 0–10, blood flag, notes — Supabase-persisted via `bowel_entries` |
| Health reports (Edge Function + client + UI) | Complete | `supabase/functions/generate-health-report` computes deterministic stats/correlations via `lib/insightsEngine.ts`, sends only that compact payload to Gemini, and persists to `health_reports`. UI lives in a "Health Reports" section on the Stats tab (`app/(tabs)/stats.tsx`): `HealthReportGenerator` (7/30/90-day period picker + generate button, loading state) and `HealthReportsList` (past reports newest-first, AI text + correlation summaries, insufficient-data messaging when a report has no surfaced correlations) |

| Home dashboard | Mostly real | `DailySummaryCard` + summary cards + 7-day chart use real data; 2500 kcal reference line in `ProgressChart` is still hardcoded |

### Stubbed / Not Started
| Feature | Status | Notes |
|---|---|---|
| Stats tab | Implemented | See `app/(tabs)/stats.tsx` — 7/30-day Skia bar charts for calories and water, average macro bars, Bristol type distribution, and a Health Reports section (generate + history) |
| Sleep tracking | Not started | "Coming Soon" card on Home only; no tab, no types, no DB table |
| Stress tracking | Not started | Same as sleep — card only |
| AI photo analysis (Gemini Vision) | Implemented | `lib/geminiService.ts` base64-encodes the photo and calls Gemini 2.5 Flash; results fan into ingredient rows via `applyNutritionToIngredient`; "Analyse Photo with AI" button in `MealInfoForm` |
| Barcode scanning | Planned | `searchFoodByBarcode()` in `lib/openFoodFactsService.ts` is implemented; needs `expo-barcode-scanner` UI |

### Planned Feature Backlog (priority order)
1. **Sleep tracking** — new tab, `SleepEntry` type (start/end times, quality rating, notes), DB table, service functions, `TrackingContext` additions
2. **Stats — sleep/stress** — add sleep quality and stress trend charts to the Stats screen once those data sources exist
3. **ProgressChart goal line** — wire the hardcoded 2500 kcal reference line in `ProgressChart` to `userProfile.dailyCalorieGoal`

## Known Limitations
- Sleep tracking not started (no tab, no types, no DB table; "Coming Soon" card on Home only)
- Stress tracking not started (no screen, no types, no DB table)
- 2500 kcal reference line in `ProgressChart` is hardcoded — not yet wired to `userProfile.dailyCalorieGoal`
- Stats-tab charts still read the full in-memory history from `TrackingContext` and aggregate client-side — fine for personal use; may need pagination if entry counts grow large. Health reports no longer share this limitation: `generate-health-report` runs server-side date-range queries against the new reporting indexes (migration `008_reporting_indexes.sql`), so report generation cost doesn't grow with total history size
- Photo encryption key tied to device install — reinstalling the app permanently loses access to previously uploaded photos
- No offline support — app requires network for data operations
- CI uses Node 18 but `.nvmrc` pins Node 20 — align before changing CI

## Decision Log

### Major Architectural Decisions

| Decision | Alternatives Considered | Rationale |
|----------|------------------------|-----------|
| Expo Router | React Navigation | File-based routing, better DX, type safety |
| Context API | Redux, Zustand | Simpler for current scope, built-in React |
| React Native Skia | Victory Native, D3 | Performance for complex charts |
| TypeScript | JavaScript | Better maintainability, fewer runtime errors |
| Native builds | Expo Go | Required for Skia + secure store |
| Supabase | Firebase, AWS Amplify | SQL + RLS + Auth + Storage in one platform |
| expo-secure-store | AsyncStorage | Keychain/Keystore encryption for session tokens |

### File Organization Decisions

| Decision | Issue | Resolution |
|----------|--------|------------|
| Moved styles/ out of app/ | Expo Router treating styles as routes | Relocated to root level to avoid routing conflicts |
| Separate navigation components | Code organization | Better separation of concerns |
| Custom hooks for business logic | State management | Reusable logic, easier testing |
| lib/ for Supabase client + service | Keep infra separate from UI | Single import path; easy to mock in tests |

## Getting Started for Contributors

1. **Prerequisites**: Node.js 20, Android Studio, Java 17
2. **Setup**: `npm install` → copy `.env.example` to `.env.local` and fill in Supabase credentials → run all SQL migrations in order (001 → 009) in Supabase Dashboard SQL Editor → `npm run android`
3. **Development**: Use development builds, not Expo Go
4. **Testing**: `npm test` for unit tests (runs fully offline via mocks)
5. **Architecture**: Follow existing patterns, update this doc for major changes

## Contributing Guidelines

- Follow TypeScript strict mode
- Add tests for new components
- Update documentation for architectural changes
- Use conventional commit messages
- Run linting before commits