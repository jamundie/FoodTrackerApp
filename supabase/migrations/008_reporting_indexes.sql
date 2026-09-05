-- Migration 008: Indexes to support server-side, date-range health report generation
--
-- No indexes exist beyond implicit PKs on food_entries, water_entries, or
-- bowel_entries — every fetch in trackingService.ts pulls the full
-- unfiltered history per user. This is the fix point for the report
-- generator's date-range queries.
--
-- Applied automatically by .github/workflows/supabase-migrations.yml on merge to main.

create index if not exists idx_food_entries_user_timestamp
  on food_entries(user_id, timestamp desc);

create index if not exists idx_water_entries_user_timestamp
  on water_entries(user_id, timestamp desc);

create index if not exists idx_bowel_entries_user_timestamp
  on bowel_entries(user_id, timestamp desc);
