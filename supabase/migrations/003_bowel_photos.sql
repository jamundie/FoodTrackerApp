-- ============================================================
-- FoodTrackerApp — add photo support to bowel_entries
-- Run this in Supabase Dashboard → SQL Editor after 002_bowel_entries.sql
-- ============================================================

alter table public.bowel_entries
  add column if not exists photo_storage_path text;

-- Photos are stored in the user-photos bucket (created in 004_user_photos_bucket.sql)
-- under the path {userId}/{entryId}.enc. The bucket RLS policies cover bowel photos:
--   users upload own photos  → auth.uid()::text = (storage.foldername(name))[1]
--   users read own photos    → auth.uid()::text = (storage.foldername(name))[1]
--   users delete own photos  → auth.uid()::text = (storage.foldername(name))[1]
-- No additional storage policy changes are required.
