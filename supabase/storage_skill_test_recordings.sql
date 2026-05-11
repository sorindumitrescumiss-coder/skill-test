-- Optional: run in Supabase SQL Editor after creating the bucket (or create bucket in Dashboard → Storage → New bucket).
-- Bucket name must match useSessionScreenRecording upload: skill-test-recordings

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'skill-test-recordings',
  'skill-test-recordings',
  false,
  524288000, -- 500 MB max per object (adjust if needed)
  array['video/webm', 'video/mp4', 'application/octet-stream']
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Authenticated users may upload/read/delete only under their user id prefix: {uid}/...

drop policy if exists "skill_test_recordings_insert_own" on storage.objects;
create policy "skill_test_recordings_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'skill-test-recordings'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "skill_test_recordings_select_own" on storage.objects;
create policy "skill_test_recordings_select_own"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'skill-test-recordings'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "skill_test_recordings_update_own" on storage.objects;
create policy "skill_test_recordings_update_own"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'skill-test-recordings'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'skill-test-recordings'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "skill_test_recordings_delete_own" on storage.objects;
create policy "skill_test_recordings_delete_own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'skill-test-recordings'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
