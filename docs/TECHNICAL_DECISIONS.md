# Technical Decision Records (TDRs)

This document tracks major technical decisions made during the development of the Food Tracker App.

## TDR-001: Expo Router over React Navigation

**Date**: August 2025  
**Status**: Accepted  
**Context**: Need for navigation system in React Native app

### Decision
Use Expo Router (v5.1.3) for navigation instead of React Navigation.

### Alternatives Considered
- React Navigation v7
- Manual navigation implementation

### Rationale
- **File-based routing**: More intuitive project structure
- **Type safety**: Automatic TypeScript integration
- **Deep linking**: Built-in support with minimal configuration
- **Code splitting**: Automatic with Expo Router
- **Developer experience**: Familiar to web developers

### Consequences
- **Positive**: Better DX, type safety, automatic route generation
- **Negative**: Newer technology, smaller community than React Navigation
- **Mitigation**: Well-documented by Expo team, active development

---

## TDR-002: React Context API for State Management

**Date**: August 2025  
**Status**: Accepted  
**Context**: Need for global state management for tracking data

### Decision
Use React Context API with custom hooks instead of Redux or other state management libraries.

### Alternatives Considered
- Redux Toolkit
- Zustand
- Jotai
- Local state only

### Rationale
- **Simplicity**: Built into React, no additional dependencies
- **Scale appropriate**: Current app scope doesn't require Redux complexity
- **Performance**: Adequate for current data flow patterns
- **Learning curve**: Team familiar with React patterns

### Consequences
- **Positive**: Smaller bundle, simpler debugging, native React patterns
- **Negative**: May need refactoring if app grows significantly
- **Mitigation**: Context can be migrated to other solutions if needed

---

## TDR-003: React Native Skia for Charts

**Date**: August 2025  
**Status**: Accepted  
**Context**: Need for high-performance charts and data visualization

### Decision
Use @shopify/react-native-skia for charts and data visualization.

### Alternatives Considered
- Victory Native
- React Native Chart Kit
- D3 with react-native-svg
- Custom canvas implementation

### Rationale
- **Performance**: 60fps animations, GPU acceleration
- **Flexibility**: Full control over graphics rendering
- **Future-proof**: Shopify's active development and maintenance
- **Capabilities**: Supports complex visualizations needed for health data

### Consequences
- **Positive**: Excellent performance, unlimited customization
- **Negative**: Requires native builds, larger bundle size, steeper learning curve
- **Mitigation**: Development builds required, but acceptable trade-off for UX

---

## TDR-004: TypeScript Strict Mode

**Date**: August 2025  
**Status**: Accepted  
**Context**: Code quality and maintainability requirements

### Decision
Use TypeScript in strict mode across the entire application.

### Alternatives Considered
- JavaScript with JSDoc
- TypeScript with loose configuration
- Gradual TypeScript adoption

### Rationale
- **Error prevention**: Catch errors at compile time
- **Developer experience**: Better IDE support, autocomplete
- **Maintainability**: Self-documenting code, easier refactoring
- **Team productivity**: Clearer interfaces and contracts

### Consequences
- **Positive**: Fewer runtime errors, better code quality, improved DX
- **Negative**: Initial learning curve, more verbose code
- **Mitigation**: Team training, gradual adoption of advanced features

---

## TDR-005: Native Builds Required

**Date**: August 2025  
**Status**: Accepted  
**Context**: Skia dependency requires native compilation

### Decision
Require development builds instead of supporting Expo Go for development.

### Alternatives Considered
- Use Expo Go-compatible chart library
- Conditional rendering for development vs production
- Web-only development with mobile testing later

### Rationale
- **Feature requirements**: Skia charts are core to the app experience
- **Testing accuracy**: Development builds closer to production
- **Performance**: Native builds perform better than Expo Go

### Consequences
- **Positive**: Better development/production parity, access to native features
- **Negative**: Longer development setup, slower iteration cycle
- **Mitigation**: Clear setup documentation, CI/CD for automated builds

---

## TDR-006: Styles Directory Structure

**Date**: August 2025  
**Status**: Accepted  
**Context**: Expo Router treating styles as routes when in app/ directory

### Decision
Move styles directory from `app/styles/` to root-level `styles/` directory.

### Alternatives Considered
- Rename files with underscore prefix (app/styles/_index.styles.ts)
- Use .styles suffix in component directories
- Inline styles only

### Rationale
- **Routing conflicts**: Expo Router treats all app/ files as potential routes
- **Organization**: Central location for global styles
- **Imports**: Clear distinction between routes and styles

### Consequences
- **Positive**: No routing conflicts, clearer project structure
- **Negative**: Import paths need updating
- **Mitigation**: IDE-assisted refactoring, updated documentation

---

## TDR-007: Split Date/Time Picker with Calendar Interface

**Date**: August 2025  
**Status**: Accepted  
**Context**: Users need intuitive date/time selection for meal logging with both quick access and precise control

### Decision
Implement a dual-picker system with separate date and time selectors, featuring an expandable calendar interface for date selection.

### Alternatives Considered
- **Single ISO timestamp input**: Manual entry of full ISO format
- **Native date/time pickers**: Platform-specific date/time components
- **Third-party date picker library**: External dependency like react-native-date-picker
- **Simple dropdown lists**: Basic day/time selection without calendar

### Rationale
- **User Experience**: Split interface is more intuitive than single timestamp input
- **Quick Access**: "Today"/"Yesterday" options for common use cases
- **Precision Control**: Full calendar allows selection of any past date
- **Visual Clarity**: Calendar grid provides clear date context and navigation
- **Consistent Styling**: Custom implementation matches app design system
- **No Dependencies**: Avoids external libraries and platform inconsistencies

### Implementation Details
```typescript
// Dual state management
const [selectedDate, setSelectedDate] = useState(new Date());
const [selectedTime, setSelectedTime] = useState({ 
  hours: new Date().getHours(), 
  minutes: 0 
});

// Calendar generation with metadata
const generateCalendarDays = (year: number, month: number) => {
  // 42-day grid with isSelectable, isToday, isCurrentMonth flags
};

// Smart time intervals
const timeOptions = Array.from({ length: 24 }, (_, hour) =>
  [0, 15, 30, 45].map(minute => ({ hour, minute }))
);
```

### Date Picker Features
- **Quick Selection**: Today/Yesterday buttons for common scenarios
- **Expandable Calendar**: Traditional month grid with navigation
- **Smart Restrictions**: Only past dates selectable, future dates disabled
- **Visual Indicators**: Today highlighted, selected date emphasized
- **Month Navigation**: Previous/next with intelligent boundary handling

### Time Picker Features
- **Structured Intervals**: 15-minute increments (00, 15, 30, 45)
- **Complete Coverage**: All 24 hours × 4 intervals = 96 time slots
- **User-Friendly Display**: 12-hour AM/PM format in UI
- **ISO Timestamp Output**: Combined date/time for consistent storage

### Consequences
- **Positive**: 
  - Intuitive user experience with both quick and precise options
  - No external dependencies or platform-specific behavior
  - Consistent visual design with app theme
  - Comprehensive test coverage possible with testID attributes
  - Flexible architecture for future enhancements
- **Negative**: 
  - Custom implementation requires more initial development time
  - Additional state management complexity
  - Larger component file size
- **Mitigation**: 
  - Well-structured helper functions keep code maintainable
  - Comprehensive test suite ensures reliability
  - Clear documentation for future developers

### Testing Strategy
- Unit tests for calendar generation logic
- Integration tests for date/time selection flow
- Accessibility testing for keyboard navigation
- Visual regression testing for calendar display

---

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

---

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

---

## TDR-010: Supabase for Cloud Persistence

**Date**: 2026-03-28
**Status**: Accepted
**Context**: The app had no data persistence — all state was in-memory and lost on restart. A backend was needed for database storage, file storage (meal photos), and user authentication in a single, cohesive platform.

### Decision
Use Supabase (Postgres + Row Level Security + Storage + Auth) as the backend. Persistence is isolated in `lib/trackingService.ts`; the Supabase client singleton lives in `lib/supabase.ts`.

### Alternatives Considered
- **Firebase/Firestore**: NoSQL, strong ecosystem, but vendor lock-in and no SQL query power
- **AWS Amplify**: Very capable but heavyweight config overhead for a solo project
- **SQLite (local-only)**: Considered as a first step, rejected because multi-device sync would require a rewrite

### Rationale
- **Single platform**: DB, storage, and auth in one service — no gluing separate tools
- **Row Level Security**: Per-user data isolation enforced at the DB layer, not in application code
- **Private photo bucket**: Signed URL access (60-second expiry) — meal photo URLs are never public
- **Postgres**: Relational model fits the entry → ingredients relationship cleanly
- **Open source / self-hostable**: Reduces vendor risk vs Firebase

### Consequences
- **Positive**: Data persists across sessions; multi-device access; photos safely stored; RLS means even direct DB access is user-scoped
- **Negative**: Requires network access; adds Supabase dependency; SQL migration must be run manually in dashboard
- **Mitigation**: `lib/trackingService.ts` isolation means the persistence layer can be swapped; all Supabase calls are mocked globally in `jest.setup.ts` so tests run offline

---

## TDR-011: Supabase Auth + expo-secure-store for Session Persistence

**Date**: 2026-03-28
**Status**: Accepted
**Context**: With cloud persistence added, user identity is required to scope data. A secure, low-friction auth approach was needed that integrates naturally with Expo and Supabase.

### Decision
Use Supabase Auth (email/password) for authentication. Sessions are stored in the device keychain/keystore via `expo-secure-store` instead of AsyncStorage. Auth state is managed in `hooks/AuthContext.tsx` (`AuthProvider` + `useAuth`). Route guarding via `AuthGate` in `app/_layout.tsx`.

### Alternatives Considered
- **AsyncStorage for session**: Easier but insecure — tokens in plaintext on the filesystem
- **Custom JWT backend**: Too much infrastructure for a solo project
- **OAuth-only (Google/Apple)**: Better UX but higher setup complexity; can be added later on top of this

### Rationale
- **Keychain storage**: `expo-secure-store` uses iOS Keychain / Android Keystore — session tokens are encrypted at rest, never in plaintext
- **Supabase Auth integration**: The Supabase JS client accepts a custom storage adapter; `ExpoSecureStoreAdapter` drops in with no other changes
- **AuthProvider pattern**: Isolates auth concerns; `TrackingContext` depends on `useAuth()` to scope data fetches to the signed-in user
- **Auth route group**: `app/(auth)/` follows Expo Router conventions; `AuthGate` in root layout handles redirects declaratively

### Consequences
- **Positive**: Session tokens encrypted on device; clean separation of auth vs data concerns; auth screens follow app design language
- **Negative**: `expo-secure-store` is a native module — `npx expo install` required (not `npm install`); cannot be tested without mocking
- **Mitigation**: `expo-secure-store` globally mocked in `jest.setup.ts`; `AuthContext` globally mocked so all tests work without real credentials

---

## Decision Template

For future decisions, use this template:

## TDR-012: Client-Side AES-256-GCM Encryption for Meal Photos

**Date**: 2026-03-28
**Status**: Accepted
**Context**: The app will track bowel movements and other sensitive health data. Meal (and future stool) photos stored in Supabase Storage were readable by the project owner and any party with access to the Supabase dashboard. For data in the GDPR Special Category and potential HIPAA PHI territory, server-visible plaintext photos are not acceptable even in a private bucket.

### Decision
Encrypt every photo on-device using AES-256-GCM before it is uploaded to Supabase Storage. The encryption key is a 256-bit random value generated once per user, stored exclusively in the device keychain via `expo-secure-store`, and never transmitted to the server. Supabase Storage receives and stores only opaque ciphertext (`*.enc` files with `application/octet-stream` content type).

On read, `getDecryptedPhotoUri` downloads the ciphertext, decrypts it on-device, writes the plaintext bytes to a short-lived temp file in `FileSystem.cacheDirectory`, and returns a `file://` URI that `<Image>` can consume. The `useSignedPhotoUrl` hook was updated to call `getDecryptedPhotoUri` instead of the former `getPhotoSignedUrl`.

The crypto implementation uses `react-native-quick-crypto` (`createCipheriv` / `createDecipheriv` with `aes-256-gcm`) because Hermes does not expose `crypto.subtle` and `expo-crypto` provides only hashing. Each photo gets a fresh 12-byte random IV prepended to the ciphertext; the 16-byte GCM auth tag is appended, providing authenticated encryption.

Key management: device-only, no server escrow. If the user reinstalls the app or moves to a new device, encrypted photos become permanently unreadable. This is an explicit trade-off accepted for the privacy guarantee.

New files: `utils/photoEncryption.ts` — `encryptPhoto`, `decryptPhoto`, `getOrCreateEncryptionKey`.

### Alternatives Considered
- **Supabase Vault (pgsodium column encryption)**: Covers DB fields but not Storage files; transparent to the project owner via dashboard — insufficient for photos
- **Password-derived key (PBKDF2)**: Allows cross-device recovery but key strength depends on password quality; deferred for a future iteration
- **No encryption, rely on private bucket + RLS**: Adequate for general food data; not sufficient for stool/bowel movement photos under GDPR Special Category

### Rationale
- Bowel movement photos are unambiguously sensitive health data (GDPR Special Category; HIPAA PHI in clinical contexts)
- AES-256-GCM provides authenticated encryption — tampering with the ciphertext is detectable
- Device-only key means zero-knowledge storage: even a full Supabase compromise exposes no readable photos
- `react-native-quick-crypto` is the only option that provides AES-GCM in the Hermes JS environment

### Consequences
- **Positive**: Photos are unreadable server-side; strong basis for GDPR/HIPAA compliance claims around photo data
- **Negative**: Key loss (reinstall/new device) means permanent photo loss; no admin recovery path; `npm run android` rebuild required for the native module
- **Mitigation**: Surface a clear in-app warning when photos are present that uninstalling will permanently delete them; document the key-escrow gap for future consideration

---

```markdown
## TDR-XXX: [Decision Title]

**Date**: [Date]  
**Status**: [Proposed/Accepted/Rejected/Superseded]  
**Context**: [What situation requires a decision?]

### Decision
[What is the decision?]

### Alternatives Considered
- Option 1
- Option 2
- Option 3

### Rationale
- Reason 1
- Reason 2
- Reason 3

### Consequences
- **Positive**: [Benefits]
- **Negative**: [Drawbacks]
- **Mitigation**: [How to address drawbacks]
```

## TDR-012: Bowel Movement Tracking Feature

**Date**: 2026-04-24
**Status**: Accepted
**Context**: The app's end goal is to correlate bowel health with food, water, and sleep habits, then use AI to provide dietary improvement suggestions. Bowel movement tracking is the core differentiating feature and must be implemented first to start collecting the data the AI will rely on.
**Decision**: Added a dedicated `bowel` tab with full Supabase persistence. The `BowelEntry` type captures: a `falseAlarm` flag (sensation to go but no movement — shown early in the form so it collapses irrelevant fields), the clinically-recognised Bristol Stool Scale (types 1–7, optional when `falseAlarm` is true), urgency (none/mild/moderate/urgent), pain level (0–10), blood presence (hidden when `falseAlarm` is true), and freeform notes. A new `bowel_entries` table was added via migration `002_bowel_entries.sql` (applied) with RLS policies mirroring the food and water tables. `bristol_type` is nullable in the DB with a check constraint (1–7) that only fires when a value is present. The `TrackingContext` was extended with `bowelEntries: BowelEntry[]` and `addBowelEntry` (optimistic update pattern, same as water). The home dashboard Stress placeholder card was replaced with a live Bowel card.
**Consequences**: `TrackingData` now carries a third array (`bowelEntries`), which is a breaking change to the type — all existing consumers (tests, context) updated. `BowelEntry.bristolType` is `BristolType | undefined`; consumers must guard against `undefined` before indexing `BRISTOL_DESCRIPTIONS`. Data is immediately useful for future AI analysis once sleep tracking is also in place.

---

## TDR-013: Sleep Data Integration Strategy — Garmin via Platform Health APIs

**Date**: 2026-04-24
**Status**: Proposed
**Context**: Sleep tracking is the next planned feature and a prerequisite for the AI bowel assessment, which needs sleep data correlated with food, water, and bowel entries. The primary wearable target is a Garmin watch. Three integration paths were evaluated.

### Options Considered

#### Option A — Garmin Health API (Official, Cloud-to-Cloud)
Garmin's official REST API, protected by OAuth 2.0. Delivers a rich sleep payload after the user syncs their watch with Garmin Connect. Data fields include: `sleepStartTimestampGMT`, `sleepEndTimestampGMT`, deep/light/REM/awake seconds, `totalSleepTimeInSeconds`, SpO2 (avg/min/max), respiration rate, composite `sleepScores`, Body Battery delta, and per-epoch HRV via a separate `/hrv-service/hrv/{date}` endpoint.

Access is free for approved businesses but requires a formal application to the Garmin Connect Developer Programme (`developer.garmin.com/gc-developer-program`). Not open to individual developers. Requires a backend webhook receiver to accept push notifications when a user syncs. Garmin-specific fields (HRV detail, Body Battery, eBBI) are only available through this path.

#### Option B — Apple Health / Google Fit Relay (Indirect)
Garmin Connect natively syncs sleep data to Apple Health (iOS) and Google Fit / Health Connect (Android). A React Native app reads the data from the platform health store using HealthKit or the Health Connect API — no Garmin partnership required, no backend webhook infrastructure.

Fields available via this path are normalised to the platform schema: sleep start/end, sleep stages (deep/light/REM/awake), and a quality score. Garmin-specific metadata (HRV epochs, Body Battery, eBBI) is not exposed. Depends on the user having Garmin Connect installed with platform health sync enabled.

#### Option C — Unofficial Reverse-Engineered API (python-garminconnect)
A community Python library (`github.com/cyberjunky/python-garminconnect`, 2.2k stars, actively maintained) that mimics Garmin's SSO login flow to access the same undocumented endpoints the Garmin Connect app uses. Exposes `get_sleep_data(date)` and `get_hrv_data(date)`. Full Garmin field access without a partnership.

Not suitable for a distributed app: using it requires storing and replaying user credentials (Garmin's SSO does not issue tokens for third-party apps), which violates Garmin's Terms of Service. Appropriate only for personal dashboards or local prototyping.

### Decision
**Proceed with Option B (platform health relay) as the implementation target for the initial sleep tracking feature.** Apply to the Garmin Connect Developer Programme in parallel if the app is published to external users and richer Garmin data (HRV, Body Battery) becomes a product requirement.

### Rationale
- No partnership or backend infrastructure required — unblocks feature development immediately
- Covers the core sleep primitives (`SleepEntry` type: start time, end time, duration, sleep stages, quality score) needed for AI correlation
- Works for users of any sleep-tracking device that syncs to Apple Health or Health Connect — not limited to Garmin
- Garmin Connect already syncs sleep to both platforms out of the box; no user setup beyond enabling the sync toggle in Garmin Connect settings
- If/when the Garmin Developer Programme is approved, the `trackingService` layer can be extended to pull Garmin-specific fields (HRV, Body Battery) without changing the `SleepEntry` type visible to the rest of the app

### Implementation Notes
- **iOS**: `HealthKit` via `react-native-health` or an Expo plugin (e.g. `expo-health`). Requires `NSHealthShareUsageDescription` in `Info.plist` and a runtime permissions prompt.
- **Android**: `Health Connect` API (successor to Google Fit) via `react-native-health-connect`. Requires `HEALTH_CONNECT_CLIENT_ID` and runtime permissions.
- **`SleepEntry` type** (to be added to `types/tracking.ts`): `id`, `userId`, `startTime` (ISO string), `endTime` (ISO string), `totalMinutes`, `deepSleepMinutes?`, `lightSleepMinutes?`, `remSleepMinutes?`, `awakeMinutes?`, `qualityScore?` (0–100), `notes?`, `source` (`'manual' | 'apple_health' | 'health_connect'`), `createdAt`.
- All Supabase calls go through `lib/trackingService.ts` (`fetchSleepEntries`, `insertSleepEntry`). A new migration `003_sleep_entries.sql` is required.
- `TrackingContext` gains `sleepEntries: SleepEntry[]` and `addSleepEntry`.
- Manual entry must also be supported for users without a compatible wearable.

### Consequences
- **Positive**: Feature can be built without waiting for Garmin partnership approval; works across wearable brands; `SleepEntry` type is device-agnostic
- **Negative**: Garmin-specific fields (HRV epochs, Body Battery) are unavailable; depends on user keeping platform health sync active; adds two new native modules (one per platform) requiring a native rebuild
- **Mitigation**: The `source` field on `SleepEntry` preserves provenance; the service layer is designed to accept richer Garmin fields in a future extension without breaking the existing type contract. Native module additions should be documented in the contributor setup guide.

## TDR-012: Generic Photo Infrastructure (user-photos bucket + PhotoInput component)
**Date**: 2026-04-24
**Status**: Accepted
**Context**: Photo upload was originally built for meal photos only (`meal-photos` bucket, `uploadMealPhoto` function, `MealPhotoInput` component). When bowel entry photos were added, those same food-specific names were reused verbatim. With more entry types planned (sleep, stress), the photo infrastructure needed to be made generic before further coupling occurred.
**Decision**: Renamed the Supabase Storage bucket from `meal-photos` to `user-photos` (migration `004_user_photos_bucket.sql`). Renamed `uploadMealPhoto` → `uploadPhoto` in `trackingService.ts`; bucket reference updated in both `uploadPhoto` and `getDecryptedPhotoUri`. Replaced `MealPhotoInput.tsx` with `PhotoInput.tsx` — the component now accepts optional props (`label`, `addLabel`, `aspect`, `quality`) so each feature can customise it without forking. Both `MealInfoForm` and `BowelEntryForm` import `PhotoInput`. `jest.setup.ts` mock updated accordingly; test file renamed `PhotoInput.test.tsx` with an additional test for custom label rendering.
**Consequences**: Any feature adding photos (sleep, body measurements, etc.) imports `PhotoInput` and calls `uploadPhoto` — no food-specific naming to work around. The `user-photos` bucket RLS policy is path-agnostic (`(storage.foldername(name))[1] = auth.uid()::text`) so it covers all features automatically. The old `meal-photos` bucket must be removed from Supabase manually once `004_user_photos_bucket.sql` has been applied and verified.
