-- Migration: rename meal-photos bucket to user-photos
-- Run in Supabase Dashboard → SQL Editor

-- 1. Create the new generic bucket (private, same settings as meal-photos)
insert into storage.buckets (id, name, public)
values ('user-photos', 'user-photos', false)
on conflict (id) do nothing;

-- 2. RLS policy: users can only access their own files (path: {userId}/{entryId}.enc)
create policy "Users can upload their own photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'user-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can read their own photos"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'user-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'user-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 3. If migrating existing data: copy objects from meal-photos to user-photos
--    (Only needed if meal-photos bucket already has production data)
--    Run manually if required:
--    UPDATE storage.objects SET bucket_id = 'user-photos' WHERE bucket_id = 'meal-photos';

-- 4. Drop old bucket policies and bucket (after verifying no production data remains)
--    Run manually when ready:
--    DROP POLICY IF EXISTS "Users can upload their own photos" ON storage.objects;
--    DELETE FROM storage.buckets WHERE id = 'meal-photos';
