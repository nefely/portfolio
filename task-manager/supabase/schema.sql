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
-- Row Level Security — every row is only visible/editable by its owner.
-- ---------------------------------------------------------------------------

alter table public.columns enable row level security;
alter table public.tasks enable row level security;

drop policy if exists "Users manage their own columns" on public.columns;
create policy "Users manage their own columns"
  on public.columns
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage their own tasks" on public.tasks;
create policy "Users manage their own tasks"
  on public.tasks
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- New user bootstrap — create the default board columns automatically.
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.columns (user_id, name, color, position) values
    (new.id, 'To Do', '#3b82f6', 1000),
    (new.id, 'In Progress', '#f59e0b', 2000),
    (new.id, 'Done', '#10b981', 3000);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
