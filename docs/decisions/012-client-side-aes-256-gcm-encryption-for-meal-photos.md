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
