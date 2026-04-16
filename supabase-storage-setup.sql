-- Run this in Supabase SQL Editor to set up image storage

-- 1. Create the storage bucket
insert into storage.buckets (id, name, public)
values ('thumbnails', 'thumbnails', true);

-- 2. Allow public read access (images are shown on the portfolio)
create policy "Public can read thumbnails"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'thumbnails');

-- 3. Allow authenticated users to upload
create policy "Authenticated users can upload thumbnails"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'thumbnails');

-- 4. Allow authenticated users to update (replace) files
create policy "Authenticated users can update thumbnails"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'thumbnails');

-- 5. Allow authenticated users to delete files
create policy "Authenticated users can delete thumbnails"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'thumbnails');
