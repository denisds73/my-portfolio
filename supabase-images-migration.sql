-- Run this in Supabase SQL Editor to add the images column
-- This adds multi-image support to projects

alter table public.projects
add column if not exists images text[] not null default '{}';

-- Backfill: copy existing thumbnail_url into images array
update public.projects
set images = array[thumbnail_url]
where thumbnail_url is not null
  and thumbnail_url != ''
  and (images is null or images = '{}');
