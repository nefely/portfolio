-- AI Radar schema.
--
-- This Supabase project is shared across several portfolio apps
-- (job-platform, task-manager, crm, …), so every table here is prefixed
-- `ai_radar_` to avoid clashing with another project's tables.
--
-- Safe to re-run: uses `if not exists` / `drop policy if exists`.
-- Paste this whole file into the Supabase SQL Editor of the shared project.

-- ---------------------------------------------------------------------------
-- ai_radar_favorites — sites a user starred in the catalog.
-- Only the domain is stored; the site profile is always fetched fresh from
-- the FreeSerp API, so DR / summary never go stale in our DB.
-- ---------------------------------------------------------------------------
create table if not exists public.ai_radar_favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  domain text not null check (char_length(domain) between 3 and 253),
  created_at timestamptz not null default now(),
  primary key (user_id, domain)
);

create index if not exists ai_radar_favorites_user_created_idx
  on public.ai_radar_favorites (user_id, created_at desc);

alter table public.ai_radar_favorites enable row level security;

-- Each user sees and changes only their own rows. The browser talks to
-- Supabase with the anon key, so these policies ARE the access control.
drop policy if exists "ai_radar_favorites_select_own" on public.ai_radar_favorites;
create policy "ai_radar_favorites_select_own" on public.ai_radar_favorites
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "ai_radar_favorites_insert_own" on public.ai_radar_favorites;
create policy "ai_radar_favorites_insert_own" on public.ai_radar_favorites
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "ai_radar_favorites_delete_own" on public.ai_radar_favorites;
create policy "ai_radar_favorites_delete_own" on public.ai_radar_favorites
  for delete to authenticated using ((select auth.uid()) = user_id);
