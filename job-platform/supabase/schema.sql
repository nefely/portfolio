-- Work (job-platform) schema.
--
-- This Supabase project is shared across several portfolio projects living
-- in one database (see portfolio/task-manager for the sibling project), so
-- every table here is prefixed `job_platform_` to avoid clashing with
-- another project's tables (e.g. `task_manager_*`).
--
-- Safe to re-run: uses `if not exists` / `drop policy if exists` throughout.
-- Paste this whole file into the Supabase SQL Editor for the shared project.
--
-- NOTE: if you already ran a version of this file predating jsonb content
-- (plain `text` columns for name/summary/title/description/location instead
-- of jsonb + location_code), the `if not exists` guards below will NOT
-- migrate those columns automatically. Drop the 3 tables first:
--   drop table if exists public.job_platform_jobs cascade;
--   drop table if exists public.job_platform_partners cascade;
--   drop table if exists public.job_platform_contact_submissions cascade;
-- then re-run this file and supabase/seed.sql.
--
-- If you already have the jsonb-based schema and are only picking up the
-- job filter fields added later (work_format/experience_level/
-- required_languages, employment_type gaining 'project'), no drop is
-- needed — just re-run this file, then:
--   delete from public.job_platform_jobs;
-- and re-run the updated supabase/seed.sql (partners are untouched, only
-- jobs are replaced since the job dataset grew substantially).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- job_platform_partners
-- ---------------------------------------------------------------------------
create table if not exists public.job_platform_partners (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  logo_url text,
  location_code text not null, -- код міста; лейбл — messages/*.json ("locations")
  categories text[] not null default '{}',
  name jsonb not null,    -- { "uk": "...", "en": "...", "pl": "..." }
  summary jsonb not null, -- { "uk": "...", "en": "...", "pl": "..." }
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- job_platform_employers
-- ---------------------------------------------------------------------------
-- Не всі роботодавці — партнери: партнер (job_platform_partners) — агенція
-- чи компанія зі спеціальними стосунками з платформою (своя сторінка,
-- categories, summary), а employer — легка сутність для прямого
-- роботодавця, що просто розмістив вакансію(ї) без жодного зв'язку з
-- партнерами. Без власної сторінки — лише те, що показати на картці/у
-- деталях вакансії.
create table if not exists public.job_platform_employers (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  location_code text not null, -- код міста; лейбл — messages/*.json ("locations")
  name text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- job_platform_jobs
-- ---------------------------------------------------------------------------
create table if not exists public.job_platform_jobs (
  id uuid primary key default gen_random_uuid(),
  -- Взаємовиключні (див. job_platform_jobs_org_check нижче): вакансія
  -- належить АБО партнеру, АБО прямому роботодавцю, ніколи обом і ніколи
  -- жодному.
  partner_id uuid references public.job_platform_partners (id) on delete cascade,
  employer_id uuid references public.job_platform_employers (id) on delete cascade,
  category text not null check (category in
    ('construction', 'manufacturing', 'logistics', 'hospitality', 'it', 'drivers', 'other')),
  location_code text not null, -- код міста; лейбл — messages/*.json ("locations")
  employment_type text not null check (employment_type in ('full-time', 'part-time', 'seasonal', 'project')),
  work_format text not null default 'onsite' check (work_format in ('onsite', 'remote', 'hybrid')),
  experience_level text not null default '0-1' check (experience_level in ('0-1', '1-3', '3-5', '5+')),
  required_languages text[] not null default '{}', -- коди мов, messages/*.json ("languages")
  salary_from int,
  salary_to int,
  currency text check (currency in ('UAH', 'EUR', 'PLN')),
  title jsonb not null,       -- { "uk": "...", "en": "...", "pl": "..." }
  description jsonb not null, -- { "uk": "...", "en": "...", "pl": "..." }
  posted_at timestamptz not null default now()
);

-- Міграція для вже існуючої таблиці job_platform_jobs (безпечно
-- перезапускати, нічого не видаляє). `default` у `add column` потрібен
-- лише щоб ALTER не впав на вже заповненій таблиці — реальні значення для
-- кожного рядка все одно приходять із seed.sql.
alter table public.job_platform_jobs
  add column if not exists work_format text not null default 'onsite',
  add column if not exists experience_level text not null default '0-1',
  add column if not exists required_languages text[] not null default '{}',
  add column if not exists employer_id uuid references public.job_platform_employers (id) on delete cascade;

-- partner_id був not null, поки кожна вакансія обов'язково належала
-- партнеру — тепер вакансія може належати прямому роботодавцю замість
-- партнера, тож обмеження переїхало у job_platform_jobs_org_check нижче.
alter table public.job_platform_jobs alter column partner_id drop not null;

alter table public.job_platform_jobs drop constraint if exists job_platform_jobs_employment_type_check;
alter table public.job_platform_jobs add constraint job_platform_jobs_employment_type_check
  check (employment_type in ('full-time', 'part-time', 'seasonal', 'project'));

alter table public.job_platform_jobs drop constraint if exists job_platform_jobs_work_format_check;
alter table public.job_platform_jobs add constraint job_platform_jobs_work_format_check
  check (work_format in ('onsite', 'remote', 'hybrid'));

alter table public.job_platform_jobs drop constraint if exists job_platform_jobs_experience_level_check;
alter table public.job_platform_jobs add constraint job_platform_jobs_experience_level_check
  check (experience_level in ('0-1', '1-3', '3-5', '5+'));

-- Рівно одне з partner_id/employer_id має бути заповнене — вакансія або
-- партнерська, або від прямого роботодавця, ніколи обидва й ніколи жодне.
alter table public.job_platform_jobs drop constraint if exists job_platform_jobs_org_check;
alter table public.job_platform_jobs add constraint job_platform_jobs_org_check
  check (
    (partner_id is not null and employer_id is null) or
    (partner_id is null and employer_id is not null)
  );

create index if not exists job_platform_jobs_partner_id_idx on public.job_platform_jobs (partner_id);
create index if not exists job_platform_jobs_employer_id_idx on public.job_platform_jobs (employer_id);
create index if not exists job_platform_jobs_category_idx on public.job_platform_jobs (category);

-- ---------------------------------------------------------------------------
-- job_platform_candidates
-- ---------------------------------------------------------------------------
-- На відміну від partners/jobs, name/headline/about НЕ jsonb: це текст,
-- який кандидат один раз пише про себе своєю мовою (як справжнє резюме),
-- а не маркетинговий контент, перекладений на 3 мови. profile_locale
-- фіксує, якою мовою написано профіль.
create table if not exists public.job_platform_candidates (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  avatar_url text,
  categories text[] not null default '{}',
  headline text not null,
  profile_locale text not null check (profile_locale in ('uk', 'en', 'pl')),
  location_code text not null, -- код міста; лейбл — messages/*.json ("locations")
  desired_employment_types text[] not null default '{}',
  desired_work_formats text[] not null default '{}',
  experience_level text not null default '0-1' check (experience_level in ('0-1', '1-3', '3-5', '5+')),
  languages jsonb not null default '[]', -- [{ "code": "uk", "level": "native" }, ...]
  skills text[] not null default '{}',
  about text,
  salary_expectation_from int,
  currency text check (currency in ('UAH', 'EUR', 'PLN')),
  available_from date,
  updated_at timestamptz not null default now()
);

create index if not exists job_platform_candidates_categories_idx
  on public.job_platform_candidates using gin (categories);

-- ---------------------------------------------------------------------------
-- job_platform_contact_submissions
-- ---------------------------------------------------------------------------
-- Не перекладається: це вхідні дані від користувача (заявка), а не контент,
-- який показуємо різними мовами.
create table if not exists public.job_platform_contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text not null,
  message text default '',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Акаунти: job_platform_profiles + прив'язка candidates/employers до auth.users
-- ---------------------------------------------------------------------------
-- auth.users спільна для всіх проєктів цього Supabase-інстансу (див. шапку
-- файлу), тож роль НЕ зберігаємо в user_metadata — вона стосується лише
-- цього застосунку. Відсутність рядка тут = користувач ще не обрав роль
-- (напр. акаунт створено в task-manager) → застосунок веде на /account/role.
-- Одна роль на акаунт: update-політики немає, тож змінити роль не можна.
create table if not exists public.job_platform_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('seeker', 'employer')),
  created_at timestamptz not null default now()
);

-- Seed-рядки лишаються з user_id = null (демо-каталог); профіль, створений
-- через кабінет, належить рівно одному користувачу (unique).
alter table public.job_platform_candidates
  add column if not exists user_id uuid unique references auth.users (id) on delete cascade,
  add column if not exists is_public boolean not null default true;

alter table public.job_platform_employers
  add column if not exists user_id uuid unique references auth.users (id) on delete cascade,
  add column if not exists about text,
  add column if not exists website text;

-- security definer: політики інших таблиць викликають це під anon/
-- authenticated, а RLS на job_platform_profiles інакше обмежувала б і сам
-- підзапит. stable — Postgres може кешувати результат у межах запиту.
create or replace function public.job_platform_has_role(required_role text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.job_platform_profiles
    where user_id = auth.uid() and role = required_role
  );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.job_platform_partners enable row level security;
alter table public.job_platform_employers enable row level security;
alter table public.job_platform_jobs enable row level security;
alter table public.job_platform_candidates enable row level security;
alter table public.job_platform_contact_submissions enable row level security;
alter table public.job_platform_profiles enable row level security;

drop policy if exists "own profile read" on public.job_platform_profiles;
create policy "own profile read" on public.job_platform_profiles
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "own profile insert" on public.job_platform_profiles;
create policy "own profile insert" on public.job_platform_profiles
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "public read partners" on public.job_platform_partners;
create policy "public read partners" on public.job_platform_partners
  for select using (true);

drop policy if exists "public read employers" on public.job_platform_employers;
create policy "public read employers" on public.job_platform_employers
  for select using (true);

drop policy if exists "own employer insert" on public.job_platform_employers;
create policy "own employer insert" on public.job_platform_employers
  for insert to authenticated
  with check (user_id = auth.uid() and public.job_platform_has_role('employer'));

drop policy if exists "own employer update" on public.job_platform_employers;
create policy "own employer update" on public.job_platform_employers
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and public.job_platform_has_role('employer'));

drop policy if exists "public read jobs" on public.job_platform_jobs;
create policy "public read jobs" on public.job_platform_jobs
  for select using (true);

-- Роботодавець з акаунтом публікує вакансії лише від імені СВОЄЇ компанії
-- (job_platform_employers.user_id = він), ніколи від партнера. posted_at не
-- можна поставити в майбутнє — інакше вакансія назавжди "висіла б" першою в
-- сортуванні за датою.
drop policy if exists "own employer jobs insert" on public.job_platform_jobs;
create policy "own employer jobs insert" on public.job_platform_jobs
  for insert to authenticated
  with check (
    partner_id is null
    and employer_id in (select id from public.job_platform_employers where user_id = auth.uid())
    and public.job_platform_has_role('employer')
    and posted_at <= now()
  );

drop policy if exists "own employer jobs update" on public.job_platform_jobs;
create policy "own employer jobs update" on public.job_platform_jobs
  for update to authenticated
  using (employer_id in (select id from public.job_platform_employers where user_id = auth.uid()))
  with check (
    partner_id is null
    and employer_id in (select id from public.job_platform_employers where user_id = auth.uid())
    and public.job_platform_has_role('employer')
    and posted_at <= now()
  );

drop policy if exists "own employer jobs delete" on public.job_platform_jobs;
create policy "own employer jobs delete" on public.job_platform_jobs
  for delete to authenticated
  using (employer_id in (select id from public.job_platform_employers where user_id = auth.uid()));

-- Каталог = seed-профілі (user_id null, завжди is_public) + профілі
-- зареєстрованих шукачів. Прихований профіль (is_public = false) бачить
-- лише його власник — у кабінеті.
drop policy if exists "public read candidates" on public.job_platform_candidates;
create policy "public read candidates" on public.job_platform_candidates
  for select using (is_public or user_id = auth.uid());

drop policy if exists "own candidate insert" on public.job_platform_candidates;
create policy "own candidate insert" on public.job_platform_candidates
  for insert to authenticated
  with check (user_id = auth.uid() and public.job_platform_has_role('seeker'));

drop policy if exists "own candidate update" on public.job_platform_candidates;
create policy "own candidate update" on public.job_platform_candidates
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and public.job_platform_has_role('seeker'));

drop policy if exists "own candidate delete" on public.job_platform_candidates;
create policy "own candidate delete" on public.job_platform_candidates
  for delete to authenticated using (user_id = auth.uid());

-- Anyone (anon key) can submit the contact/application form, but nobody can
-- read submissions back through the API — no select policy is defined, so
-- with RLS enabled that action is denied by default. Submissions are meant
-- to be reviewed in the Supabase Dashboard (or with the service_role key).
drop policy if exists "public insert contact submissions" on public.job_platform_contact_submissions;
create policy "public insert contact submissions" on public.job_platform_contact_submissions
  for insert with check (true);

-- ---------------------------------------------------------------------------
-- Чат: job_platform_conversations + job_platform_messages
-- ---------------------------------------------------------------------------
-- Розмова — завжди між двома акаунтами цього застосунку (будь-які ролі:
-- роботодавець ↔ шукач, шукач ↔ шукач тощо). Пара зберігається у
-- фіксованому порядку (user_a < user_b), тож unique гарантує одну розмову
-- на пару незалежно від того, хто написав першим.
create table if not exists public.job_platform_conversations (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references auth.users (id) on delete cascade,
  user_b uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  -- Для сортування списку розмов; оновлює лише тригер нижче.
  last_message_at timestamptz not null default now(),
  constraint job_platform_conversations_pair_order check (user_a < user_b),
  constraint job_platform_conversations_pair_unique unique (user_a, user_b)
);

-- (user_a, …) покриває unique-індекс; для user_b — окремий.
create index if not exists job_platform_conversations_user_b_idx
  on public.job_platform_conversations (user_b);

create table if not exists public.job_platform_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.job_platform_conversations (id) on delete cascade,
  sender_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now(),
  -- null = отримувач ще не відкривав розмову після цього повідомлення.
  read_at timestamptz
);

create index if not exists job_platform_messages_conversation_created_idx
  on public.job_platform_messages (conversation_id, created_at desc);

-- Чи має акаунт роль у ЦЬОМУ застосунку. security definer — бо RLS на
-- job_platform_profiles дозволяє читати лише власний рядок, а тут треба
-- перевірити співрозмовника (щоб не можна було створити розмову з
-- акаунтом іншого проєкту спільного Supabase).
create or replace function public.job_platform_is_member(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.job_platform_profiles where user_id = uid);
$$;

create or replace function public.job_platform_is_participant(conversation uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.job_platform_conversations
    where id = conversation and auth.uid() in (user_a, user_b)
  );
$$;

-- Час і "прочитаність" повідомлення від клієнта ставить сервер (інакше можна
-- було б "підняти" повідомлення в майбутнє чи вставити вже прочитаним).
-- auth.uid() is null — вставка з SQL Editor (postgres), напр.
-- supabase/demo-accounts.sql з історичними датами: її не чіпаємо.
create or replace function public.job_platform_messages_before_insert()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.uid() is not null then
    new.created_at := now();
    new.read_at := null;
  end if;
  return new;
end;
$$;

-- security definer: update-політики на conversations для клієнтів немає.
create or replace function public.job_platform_messages_after_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.job_platform_conversations
  set last_message_at = new.created_at
  where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists job_platform_messages_before_insert on public.job_platform_messages;
create trigger job_platform_messages_before_insert
  before insert on public.job_platform_messages
  for each row execute function public.job_platform_messages_before_insert();

drop trigger if exists job_platform_messages_after_insert on public.job_platform_messages;
create trigger job_platform_messages_after_insert
  after insert on public.job_platform_messages
  for each row execute function public.job_platform_messages_after_insert();

-- Позначити вхідні повідомлення розмови прочитаними. Окрема функція замість
-- update-політики на messages: так клієнт не може змінити body чи чужий
-- read_at — лише "я прочитав(ла) все до цього моменту".
create or replace function public.job_platform_mark_conversation_read(conversation uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.job_platform_messages
  set read_at = now()
  where conversation_id = conversation
    and sender_id <> auth.uid()
    and read_at is null
    and public.job_platform_is_participant(conversation);
$$;

revoke execute on function public.job_platform_mark_conversation_read(uuid) from public, anon;
grant execute on function public.job_platform_mark_conversation_read(uuid) to authenticated;

-- Список розмов поточного користувача з останнім повідомленням і кількістю
-- непрочитаних — одним запитом замість N+1. security invoker: RLS таблиць
-- діє як звичайно.
create or replace function public.job_platform_my_conversations()
returns table (
  id uuid,
  other_user_id uuid,
  last_message_at timestamptz,
  last_message_body text,
  last_message_sender_id uuid,
  unread_count int
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    c.id,
    case when c.user_a = auth.uid() then c.user_b else c.user_a end,
    c.last_message_at,
    lm.body,
    lm.sender_id,
    (
      select count(*)::int from public.job_platform_messages m
      where m.conversation_id = c.id and m.sender_id <> auth.uid() and m.read_at is null
    )
  from public.job_platform_conversations c
  left join lateral (
    select m.body, m.sender_id from public.job_platform_messages m
    where m.conversation_id = c.id
    order by m.created_at desc
    limit 1
  ) lm on true
  where auth.uid() in (c.user_a, c.user_b)
  order by c.last_message_at desc;
$$;

alter table public.job_platform_conversations enable row level security;
alter table public.job_platform_messages enable row level security;

drop policy if exists "participant read conversations" on public.job_platform_conversations;
create policy "participant read conversations" on public.job_platform_conversations
  for select to authenticated using (auth.uid() in (user_a, user_b));

drop policy if exists "participant insert conversations" on public.job_platform_conversations;
create policy "participant insert conversations" on public.job_platform_conversations
  for insert to authenticated
  with check (
    auth.uid() in (user_a, user_b)
    and public.job_platform_is_member(user_a)
    and public.job_platform_is_member(user_b)
  );

drop policy if exists "participant read messages" on public.job_platform_messages;
create policy "participant read messages" on public.job_platform_messages
  for select to authenticated using (public.job_platform_is_participant(conversation_id));

drop policy if exists "participant insert messages" on public.job_platform_messages;
create policy "participant insert messages" on public.job_platform_messages
  for insert to authenticated
  with check (sender_id = auth.uid() and public.job_platform_is_participant(conversation_id));

-- Supabase Realtime (WebSocket) розсилає INSERT-и в job_platform_messages
-- підписаним клієнтам — з урахуванням RLS вище, тобто лише учасникам.
-- `alter publication ... add table` не має `if not exists`, звідси do-блок.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'job_platform_messages'
  ) then
    alter publication supabase_realtime add table public.job_platform_messages;
  end if;
end;
$$;
