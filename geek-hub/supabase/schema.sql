-- GeekHub schema.
--
-- Supabase-проєкт спільний для кількох портфоліо-проєктів (job-platform,
-- task-manager, ...), тож кожна таблиця тут має префікс `geek_hub_`.
--
-- Каталог аніме НЕ зберігаємо — він живе в AniList. Тут лише дані
-- користувачів: статуси/прогрес/оцінки, власні списки й відгуки. `anime_id` —
-- id тайтлу в AniList. У записах лежить `anime` jsonb — знімок картки тайтлу
-- (назва, постер, тип, епізоди), щоб сторінки бібліотеки й списків
-- рендерились без жодного запиту в AniList.
--
-- Безпечно перезапускати: `if not exists` / `drop ... if exists` усюди.
-- Вставити весь файл у Supabase SQL Editor спільного проєкту.

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.geek_hub_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Міграція: перша версія схеми зберігала id MyAnimeList у колонці `mal_id`.
-- Джерело даних тепер AniList, тож колонка — `anime_id` (id AniList). Старі
-- тестові рядки з MAL-id вказували б не на ті тайтли — видаляємо їх.
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['geek_hub_entries', 'geek_hub_list_items', 'geek_hub_reviews'] loop
    if exists (
      select 1 from information_schema.columns
       where table_schema = 'public' and table_name = t and column_name = 'mal_id'
    ) then
      execute format('delete from public.%I', t);
      execute format('alter table public.%I rename column mal_id to anime_id', t);
    end if;
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- geek_hub_profiles
-- ---------------------------------------------------------------------------
-- Без тригера на auth.users: користувачі спільного Supabase належать і
-- іншим проєктам, тож профіль створюємо ліниво при першому вході в GeekHub
-- (lib/auth/ensureProfile.ts).
create table if not exists public.geek_hub_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,24}$'),
  display_name text check (char_length(display_name) <= 50),
  bio text check (char_length(bio) <= 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists geek_hub_profiles_touch on public.geek_hub_profiles;
create trigger geek_hub_profiles_touch
  before update on public.geek_hub_profiles
  for each row execute function public.geek_hub_touch_updated_at();

-- ---------------------------------------------------------------------------
-- geek_hub_entries — статус тайтлу в бібліотеці користувача
-- ---------------------------------------------------------------------------
create table if not exists public.geek_hub_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  anime_id int not null,
  status text not null check (status in ('watching', 'completed', 'planned', 'on_hold', 'dropped')),
  progress int not null default 0 check (progress >= 0),
  score smallint check (score between 1 and 10),
  is_favorite boolean not null default false,
  notes text check (char_length(notes) <= 1000),
  anime jsonb not null, -- знімок AnimeCard (types/anime.ts)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, anime_id)
);

create index if not exists geek_hub_entries_user_updated_idx
  on public.geek_hub_entries (user_id, updated_at desc);

drop trigger if exists geek_hub_entries_touch on public.geek_hub_entries;
create trigger geek_hub_entries_touch
  before update on public.geek_hub_entries
  for each row execute function public.geek_hub_touch_updated_at();

-- ---------------------------------------------------------------------------
-- geek_hub_lists — власні списки ("Топ осені", "Для новачків", ...)
-- ---------------------------------------------------------------------------
-- user_id → geek_hub_profiles, щоб публічна сторінка списку могла вбудувати автора.
create table if not exists public.geek_hub_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.geek_hub_profiles (user_id) on delete cascade default auth.uid(),
  title text not null check (char_length(title) between 1 and 80),
  description text check (char_length(description) <= 500),
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists geek_hub_lists_user_idx
  on public.geek_hub_lists (user_id, updated_at desc);

drop trigger if exists geek_hub_lists_touch on public.geek_hub_lists;
create trigger geek_hub_lists_touch
  before update on public.geek_hub_lists
  for each row execute function public.geek_hub_touch_updated_at();

-- ---------------------------------------------------------------------------
-- geek_hub_list_items
-- ---------------------------------------------------------------------------
create table if not exists public.geek_hub_list_items (
  list_id uuid not null references public.geek_hub_lists (id) on delete cascade,
  anime_id int not null,
  anime jsonb not null, -- знімок AnimeCard (types/anime.ts)
  added_at timestamptz not null default now(),
  primary key (list_id, anime_id)
);

-- Додавання/видалення тайтлу піднімає список угору в "My lists".
create or replace function public.geek_hub_touch_parent_list()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.geek_hub_lists
     set updated_at = now()
   where id = coalesce(new.list_id, old.list_id);
  return null;
end;
$$;

drop trigger if exists geek_hub_list_items_touch_list on public.geek_hub_list_items;
create trigger geek_hub_list_items_touch_list
  after insert or delete on public.geek_hub_list_items
  for each row execute function public.geek_hub_touch_parent_list();

-- ---------------------------------------------------------------------------
-- geek_hub_reviews — відгуки під тайтлом (один на користувача)
-- ---------------------------------------------------------------------------
-- user_id посилається на geek_hub_profiles, а не на auth.users: так PostgREST
-- може вбудувати автора у вибірку (`author:geek_hub_profiles(...)`).
create table if not exists public.geek_hub_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.geek_hub_profiles (user_id) on delete cascade default auth.uid(),
  anime_id int not null,
  score smallint not null check (score between 1 and 10),
  body text not null check (char_length(body) between 20 and 5000),
  has_spoilers boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, anime_id)
);

create index if not exists geek_hub_reviews_anime_idx
  on public.geek_hub_reviews (anime_id, created_at desc);

drop trigger if exists geek_hub_reviews_touch on public.geek_hub_reviews;
create trigger geek_hub_reviews_touch
  before update on public.geek_hub_reviews
  for each row execute function public.geek_hub_touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.geek_hub_profiles enable row level security;
alter table public.geek_hub_entries enable row level security;
alter table public.geek_hub_lists enable row level security;
alter table public.geek_hub_list_items enable row level security;
alter table public.geek_hub_reviews enable row level security;

-- Відгуки читає будь-хто, пише/редагує/видаляє лише автор.
drop policy if exists "geek_hub_reviews_select" on public.geek_hub_reviews;
create policy "geek_hub_reviews_select" on public.geek_hub_reviews
  for select using (true);

drop policy if exists "geek_hub_reviews_write" on public.geek_hub_reviews;
create policy "geek_hub_reviews_write" on public.geek_hub_reviews
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Профілі публічні (автор публічного списку), редагує лише власник.
drop policy if exists "geek_hub_profiles_select" on public.geek_hub_profiles;
create policy "geek_hub_profiles_select" on public.geek_hub_profiles
  for select using (true);

drop policy if exists "geek_hub_profiles_insert" on public.geek_hub_profiles;
create policy "geek_hub_profiles_insert" on public.geek_hub_profiles
  for insert with check ((select auth.uid()) = user_id);

drop policy if exists "geek_hub_profiles_update" on public.geek_hub_profiles;
create policy "geek_hub_profiles_update" on public.geek_hub_profiles
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Бібліотека приватна.
drop policy if exists "geek_hub_entries_all" on public.geek_hub_entries;
create policy "geek_hub_entries_all" on public.geek_hub_entries
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Список бачить власник, а публічний — будь-хто (і гість).
drop policy if exists "geek_hub_lists_select" on public.geek_hub_lists;
create policy "geek_hub_lists_select" on public.geek_hub_lists
  for select using (is_public or (select auth.uid()) = user_id);

drop policy if exists "geek_hub_lists_write" on public.geek_hub_lists;
create policy "geek_hub_lists_write" on public.geek_hub_lists
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "geek_hub_list_items_select" on public.geek_hub_list_items;
create policy "geek_hub_list_items_select" on public.geek_hub_list_items
  for select using (
    exists (
      select 1 from public.geek_hub_lists l
       where l.id = list_id and (l.is_public or l.user_id = (select auth.uid()))
    )
  );

drop policy if exists "geek_hub_list_items_write" on public.geek_hub_list_items;
create policy "geek_hub_list_items_write" on public.geek_hub_list_items
  for all using (
    exists (select 1 from public.geek_hub_lists l where l.id = list_id and l.user_id = (select auth.uid()))
  ) with check (
    exists (select 1 from public.geek_hub_lists l where l.id = list_id and l.user_id = (select auth.uid()))
  );
