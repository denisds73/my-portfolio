-- ============================================
-- Portfolio Database Setup for Supabase
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create tables
-- ============================================

create table public.projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  long_description text,
  thumbnail_url text not null default '',
  live_url text,
  github_url text,
  tech_stack text[] not null default '{}',
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.skills (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text not null,
  proficiency integer not null default 80,
  icon text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.experience (
  id uuid default gen_random_uuid() primary key,
  company text not null,
  role text not null,
  start_date date not null,
  end_date date,
  description text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 2. Enable Row Level Security (RLS)
-- ============================================

alter table public.projects enable row level security;
alter table public.skills enable row level security;
alter table public.experience enable row level security;

-- 3. RLS Policies
-- Everyone can READ (public portfolio)
-- Only authenticated users can INSERT/UPDATE/DELETE (admin panel)
-- ============================================

-- Projects
create policy "Public can read projects"
  on public.projects for select
  to anon, authenticated
  using (true);

create policy "Authenticated users can insert projects"
  on public.projects for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update projects"
  on public.projects for update
  to authenticated
  using (true);

create policy "Authenticated users can delete projects"
  on public.projects for delete
  to authenticated
  using (true);

-- Skills
create policy "Public can read skills"
  on public.skills for select
  to anon, authenticated
  using (true);

create policy "Authenticated users can insert skills"
  on public.skills for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update skills"
  on public.skills for update
  to authenticated
  using (true);

create policy "Authenticated users can delete skills"
  on public.skills for delete
  to authenticated
  using (true);

-- Experience
create policy "Public can read experience"
  on public.experience for select
  to anon, authenticated
  using (true);

create policy "Authenticated users can insert experience"
  on public.experience for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update experience"
  on public.experience for update
  to authenticated
  using (true);

create policy "Authenticated users can delete experience"
  on public.experience for delete
  to authenticated
  using (true);

-- 4. Auto-update updated_at on projects
-- ============================================

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_project_update
  before update on public.projects
  for each row
  execute function public.handle_updated_at();

-- 5. Resume (single-row JSONB document)
-- ============================================

create table if not exists public.resume (
  id uuid default gen_random_uuid() primary key,
  singleton boolean not null default true unique,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.resume enable row level security;

create policy "Public can read resume"
  on public.resume for select
  to anon, authenticated
  using (true);

create policy "Authenticated users can insert resume"
  on public.resume for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update resume"
  on public.resume for update
  to authenticated
  using (true);

create policy "Authenticated users can delete resume"
  on public.resume for delete
  to authenticated
  using (true);
