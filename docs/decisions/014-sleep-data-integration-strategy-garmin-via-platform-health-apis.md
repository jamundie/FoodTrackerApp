## TDR-014: Sleep Data Integration Strategy — Garmin via Platform Health APIs

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
