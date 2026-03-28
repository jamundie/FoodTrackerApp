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
- **Supabase (Postgres)**: Cloud database — `food_entries`, `food_ingredients`, `water_entries`, `water_ingredients`, `user_profiles`
- **Supabase Storage**: Private `meal-photos` bucket; photos are AES-256-GCM encrypted on-device before upload — server holds only opaque ciphertext
- **Supabase Auth**: Email/password authentication; session stored in device keychain via `expo-secure-store`
- **Row Level Security (RLS)**: All tables scoped to `auth.uid() = user_id` — data isolation enforced at DB layer

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
│  session, user,        │  │  data (food/water),       │
│  signIn/signUp/signOut │  │  userProfile, loading,    │
│  (hooks/AuthContext)   │  │  addFoodEntry/addWater/   │
└────────────┬──────────┘  │  updateUserProfile        │
             │              └────────────┬─────────────┘
             │                           │
┌────────────▼───────────────────────────▼─────────────┐
│                 Persistence Layer                      │
│              lib/trackingService.ts                    │
│  fetchFoodEntries / insertFoodEntry                    │
│  fetchWaterEntries / insertWaterEntry                  │
│  fetchUserProfile / upsertUserProfile                  │
│  uploadMealPhoto / getDecryptedPhotoUri                │
└──────────────────────┬────────────────────────────────┘
                       │
┌──────────────────────▼────────────────────────────────┐
│               lib/supabase.ts (client singleton)       │
│     Supabase JS client + ExpoSecureStoreAdapter        │
└──────────────────────┬────────────────────────────────┘
                       │
┌──────────────────────▼────────────────────────────────┐
│                    Supabase Cloud                       │
│  Postgres (RLS)  │  Auth  │  Storage (meal-photos)     │
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
│   ├── profile.tsx   # User profile + sign-out
│   └── stats.tsx     # Statistics (stub)
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
├── MealPhotoInput.tsx    # Photo picker/preview; supports camera + library
├── IngredientForm.tsx    # Dynamic ingredient card list
├── CategoryModal.tsx     # Category selection modal
├── FoodEntriesList.tsx   # Rendered list of past food entries
├── WaterInfoForm.tsx     # Water entry metadata form (name, volume preset, date/time)
├── WaterVolumeSelector.tsx  # Modal dropdown for selecting drink-size preset
├── WaterIngredientsForm.tsx # Water ingredient card list
├── WaterEntriesList.tsx  # Rendered list of past water entries
├── ProfileForm.tsx       # User profile form (name, age, weight, height, goals, default glass)
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
2. On submit: `uploadMealPhoto` reads the file, encrypts it on-device (AES-256-GCM, per-user key in device keychain), uploads ciphertext to private `meal-photos` bucket as `userId/entryId.enc`
3. Returned storage path stored on `FoodEntry.photoUri`
4. `hooks/useSignedPhotoUrl.ts` calls `getDecryptedPhotoUri`: downloads ciphertext via signed URL, decrypts on-device, writes to a temp `file://` URI for `<Image>` to render
5. Encryption key (`PHOTO_ENCRYPTION_KEY`) lives only in `expo-secure-store` — never leaves the device

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
└── tracking.ts       # Domain-specific type definitions
                      # — FoodEntry, WaterEntry, Ingredient, VolumePreset, UserProfile
```

**Implementation:**
- Strict TypeScript configuration
- Interface definitions for all data structures
- Typed navigation parameters
- Generic hooks for reusability

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
- **Supabase migration**: SQL in `supabase/migrations/001_initial_schema.sql` — run once in Supabase Dashboard SQL Editor

## Scalability Considerations

### Current Architecture Supports:
- Adding new tracking categories (exercise, sleep, etc.)
- Multiple user accounts (data isolated by RLS)
- Cross-device sync (data in cloud, not local-only)
- Push notifications (future enhancement)

### Future Enhancements:
- AI-driven photo analysis → auto-populate estimated ingredients from meal photo
- Social features
- Advanced analytics
- OAuth providers (Google/Apple) — layerable on top of existing AuthContext

## Security & Privacy
- Session tokens stored in device keychain (iOS Keychain / Android Keystore) via `expo-secure-store`
- Meal photos encrypted on-device (AES-256-GCM) before upload — Supabase Storage holds only ciphertext; decryption key never leaves the device keychain
- Row Level Security enforced at DB layer — user data isolated even from direct DB queries
- Supabase credentials stored in `.env.local` (gitignored); CI uses GitHub environment secrets

## Known Limitations
- `stats.tsx` is a stub — not yet implemented
- Sleep and Stress tracking not yet started
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
2. **Setup**: `npm install` → copy `.env.example` to `.env.local` and fill in Supabase credentials → run SQL migration in Supabase Dashboard → `npm run android`
3. **Development**: Use development builds, not Expo Go
4. **Testing**: `npm test` for unit tests (runs fully offline via mocks)
5. **Architecture**: Follow existing patterns, update this doc for major changes

## Contributing Guidelines

- Follow TypeScript strict mode
- Add tests for new components
- Update documentation for architectural changes
- Use conventional commit messages
- Run linting before commits