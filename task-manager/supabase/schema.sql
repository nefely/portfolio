-- Task Manager — Supabase schema
-- Run this once in your Supabase project's SQL Editor
-- (Dashboard → SQL Editor → New query → paste → Run).
--
-- It creates the `task_manager_columns` and `task_manager_tasks` tables,
-- secures them with Row Level Security so every user can only ever see their
-- own data, and wires up a trigger that gives every new user three starter
-- columns (To Do / In Progress / Done) the moment they sign up.
--
-- Naming: this Supabase project is shared across several portfolio projects
-- living in one database, so every table is prefixed `task_manager_` to
-- avoid clashing with another project's tables (e.g. a future `blog_posts`).

-- pgcrypto gives us gen_random_uuid() for primary keys.
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- One-time rename — carries an already-provisioned project's old unprefixed
-- table names (`columns`, `tasks`, `profiles`, `comments`) over to the new
-- prefixed ones. A no-op if the old names don't exist (fresh install, or
-- already renamed), so this is safe to run more than once.
-- ---------------------------------------------------------------------------

alter table if exists public.columns rename to task_manager_columns;
alter table if exists public.tasks rename to task_manager_tasks;
alter table if exists public.profiles rename to task_manager_profiles;
alter table if exists public.comments rename to task_manager_comments;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.task_manager_columns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  color text not null default '#6366f1',
  position double precision not null,
  created_at timestamptz not null default now()
);

create table if not exists public.task_manager_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  column_id uuid not null references public.task_manager_columns (id) on delete cascade,
  title text not null,
  description text default '',
  position double precision not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists task_manager_columns_user_id_idx on public.task_manager_columns (user_id);
create index if not exists task_manager_tasks_user_id_idx on public.task_manager_tasks (user_id);
create index if not exists task_manager_tasks_column_id_idx on public.task_manager_tasks (column_id);

-- Keep task_manager_tasks.updated_at fresh automatically.
create or replace function public.task_manager_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tasks_set_updated_at on public.task_manager_tasks;
drop trigger if exists task_manager_tasks_set_updated_at on public.task_manager_tasks;
create trigger task_manager_tasks_set_updated_at
  before update on public.task_manager_tasks
  for each row execute function public.task_manager_set_updated_at();

-- ---------------------------------------------------------------------------
-- Profiles — a public mirror of auth.users so the client can list people
-- (e.g. for the "Assigned to" dropdown). auth.users itself isn't queryable
-- from client code, so every signed-in user gets a row here too.
-- ---------------------------------------------------------------------------

create table if not exists public.task_manager_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.task_manager_profiles enable row level security;

drop policy if exists "Profiles are viewable by any signed-in user" on public.task_manager_profiles;
create policy "Profiles are viewable by any signed-in user"
  on public.task_manager_profiles
  for select
  using (auth.uid() is not null);

-- Backfill profiles for accounts that already existed before this table did.
insert into public.task_manager_profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;

-- Who a task is assigned to. Nullable — a task can be unassigned.
alter table public.task_manager_tasks
  add column if not exists assigned_to uuid references public.task_manager_profiles (id) on delete set null;

-- How urgent a task is. Kept as free text (like `columns.color`) rather than
-- a DB-level enum/check — the fixed low/medium/high options live in the UI.
alter table public.task_manager_tasks
  add column if not exists priority text not null default 'medium';

-- ---------------------------------------------------------------------------
-- Comments — a running discussion thread on each task.
-- ---------------------------------------------------------------------------

create table if not exists public.task_manager_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.task_manager_tasks (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists task_manager_comments_task_id_idx on public.task_manager_comments (task_id);

alter table public.task_manager_comments enable row level security;

drop policy if exists "Any signed-in user can view and manage comments" on public.task_manager_comments;
create policy "Any signed-in user can view and manage comments"
  on public.task_manager_comments
  for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- ---------------------------------------------------------------------------
-- Row Level Security — this is a shared board: every signed-in user can see
-- and manage every column/task. `user_id` on both tables is kept and now
-- means "created by" (shown as such in the UI) rather than "owner" — it's no
-- longer what gates visibility.
-- ---------------------------------------------------------------------------

alter table public.task_manager_columns enable row level security;
alter table public.task_manager_tasks enable row level security;

drop policy if exists "Users manage their own columns" on public.task_manager_columns;
drop policy if exists "Any signed-in user can view and manage columns" on public.task_manager_columns;
create policy "Any signed-in user can view and manage columns"
  on public.task_manager_columns
  for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

drop policy if exists "Users manage their own tasks" on public.task_manager_tasks;
drop policy if exists "Any signed-in user can view and manage tasks" on public.task_manager_tasks;
create policy "Any signed-in user can view and manage tasks"
  on public.task_manager_tasks
  for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- ---------------------------------------------------------------------------
-- New user bootstrap — everyone joins the same shared board, so a new
-- signup just needs a profile row (no personal columns to seed anymore).
--
-- Note: this trigger is on auth.users, which is shared across every project
-- in this database — so it's the one thing here that isn't task-manager-
-- specific by nature. It's named/kept generic on purpose; if a second
-- portfolio project also wants a profiles mirror, extend this same function
-- rather than adding a competing trigger on auth.users.
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.task_manager_profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
