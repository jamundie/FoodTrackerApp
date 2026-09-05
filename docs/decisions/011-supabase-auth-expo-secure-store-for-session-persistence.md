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
