-- Task Manager — Supabase schema
-- Run this once in your Supabase project's SQL Editor
-- (Dashboard → SQL Editor → New query → paste → Run).
--
-- It creates the `columns` and `tasks` tables, secures them with Row Level
-- Security so every user can only ever see their own data, and wires up a
-- trigger that gives every new user three starter columns (To Do / In
-- Progress / Done) the moment they sign up.

-- pgcrypto gives us gen_random_uuid() for primary keys.
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.columns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  color text not null default '#6366f1',
  position double precision not null,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  column_id uuid not null references public.columns (id) on delete cascade,
  title text not null,
  description text default '',
  position double precision not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists columns_user_id_idx on public.columns (user_id);
create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists tasks_column_id_idx on public.tasks (column_id);

-- Keep tasks.updated_at fresh automatically.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Profiles — a public mirror of auth.users so the client can list people
-- (e.g. for the "Assigned to" dropdown). auth.users itself isn't queryable
-- from client code, so every signed-in user gets a row here too.
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by any signed-in user" on public.profiles;
create policy "Profiles are viewable by any signed-in user"
  on public.profiles
  for select
  using (auth.uid() is not null);

-- Backfill profiles for accounts that already existed before this table did.
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;

-- Who a task is assigned to. Nullable — a task can be unassigned.
alter table public.tasks
  add column if not exists assigned_to uuid references public.profiles (id) on delete set null;

-- How urgent a task is. Kept as free text (like `columns.color`) rather than
-- a DB-level enum/check — the fixed low/medium/high options live in the UI.
alter table public.tasks
  add column if not exists priority text not null default 'medium';

-- ---------------------------------------------------------------------------
-- Row Level Security — this is a shared board: every signed-in user can see
-- and manage every column/task. `user_id` on both tables is kept and now
-- means "created by" (shown as such in the UI) rather than "owner" — it's no
-- longer what gates visibility.
-- ---------------------------------------------------------------------------

alter table public.columns enable row level security;
alter table public.tasks enable row level security;

drop policy if exists "Users manage their own columns" on public.columns;
drop policy if exists "Any signed-in user can view and manage columns" on public.columns;
create policy "Any signed-in user can view and manage columns"
  on public.columns
  for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

drop policy if exists "Users manage their own tasks" on public.tasks;
drop policy if exists "Any signed-in user can view and manage tasks" on public.tasks;
create policy "Any signed-in user can view and manage tasks"
  on public.tasks
  for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- ---------------------------------------------------------------------------
-- New user bootstrap — everyone joins the same shared board, so a new
-- signup just needs a profile row (no personal columns to seed anymore).
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
