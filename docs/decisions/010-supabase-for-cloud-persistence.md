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
