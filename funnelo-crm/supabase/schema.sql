-- Funnelo CRM schema.
--
-- Supabase-проєкт спільний для кількох портфоліо-проєктів (geek-hub,
-- job-platform, task-manager, ...), тож УСЕ тут — таблиці, функції, тригери,
-- політики, view — має префікс `funnelo_`. Чужих об'єктів скрипт не змінює.
-- Єдине спільне, чого він торкається, — публікація `supabase_realtime`:
-- до неї лише ДОДАЮТЬСЯ funnelo_deals і funnelo_activities.
--
-- Модель: одна спільна команда продажів. Кожен учасник бачить усі дані,
-- а редагує лише записи, де він owner. Admin редагує все, керує етапами
-- воронки, ролями й доступом, бачить журнал змін.
--
-- Безпечно перезапускати: `if not exists` / `create or replace` / `drop ... if exists`.
-- Виконується однією транзакцією — якщо щось піде не так, не зміниться нічого.
-- Вставити весь файл у Supabase SQL Editor спільного проєкту, потім demo-data.sql.

begin;

-- Під час цього скрипта не пишемо журнал змін і не спрацьовують guard-тригери
-- (сідінг дефолтних етапів). Налаштування діє лише до кінця транзакції.
select set_config('funnelo.seeding', 'on', true);

-- ---------------------------------------------------------------------------
-- Запобіжник: якщо таблиця з нашою назвою вже існує, але має іншу структуру
-- (хтось раніше створив `funnelo_*` під інше), зупиняємось, нічого не змінивши.
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
  sentinel text;
begin
  for t, sentinel in
    select * from (values
      ('funnelo_profiles', 'role'),
      ('funnelo_pipeline_stages', 'probability'),
      ('funnelo_companies', 'owner_id'),
      ('funnelo_contacts', 'company_id'),
      ('funnelo_deals', 'stage_id'),
      ('funnelo_activities', 'completed_at'),
      ('funnelo_audit_log', 'changes')
    ) v (t, s)
  loop
    if to_regclass('public.' || t) is not null and not exists (
      select 1 from information_schema.columns
       where table_schema = 'public' and table_name = t and column_name = sentinel
    ) then
      raise exception 'public.% already exists with a different structure; nothing was changed', t;
    end if;
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.funnelo_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- funnelo_profiles — учасник команди продажів
-- ---------------------------------------------------------------------------
-- Без тригера на auth.users: користувачі спільного Supabase належать і іншим
-- проєктам, тож профіль створюється ліниво при першому вході у Funnelo
-- (rpc funnelo_ensure_profile). email копіюємо сюди, бо auth.users клієнту не видно.
create table if not exists public.funnelo_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null check (char_length(full_name) between 1 and 80),
  title text check (char_length(title) <= 80),
  role text not null default 'user' check (role in ('admin', 'user')),
  avatar_color text not null default '#6366f1' check (avatar_color ~ '^#[0-9a-fA-F]{6}$'),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- funnelo_pipeline_stages — етапи воронки (налаштовує admin)
-- ---------------------------------------------------------------------------
-- kind: open — робочі етапи; won / lost — рівно по одному фінальному етапу.
create table if not exists public.funnelo_pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 40),
  position int not null,
  probability smallint not null default 0 check (probability between 0 and 100),
  kind text not null default 'open' check (kind in ('open', 'won', 'lost')),
  color text not null default '#64748b' check (color ~ '^#[0-9a-fA-F]{6}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (kind = 'open' or (kind = 'won' and probability = 100) or (kind = 'lost' and probability = 0))
);

create unique index if not exists funnelo_pipeline_stages_final_kind_idx
  on public.funnelo_pipeline_stages (kind) where kind in ('won', 'lost');

-- ---------------------------------------------------------------------------
-- funnelo_companies
-- ---------------------------------------------------------------------------
-- owner_id → funnelo_profiles (а не auth.users), щоб PostgREST міг вбудувати
-- власника у вибірку. on delete set null: видалення користувача в іншому
-- проєкті не має падати через CRM — запис просто лишається без власника.
create table if not exists public.funnelo_companies (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  domain text check (char_length(domain) <= 120),
  industry text check (char_length(industry) <= 60),
  size text check (size in ('1-10', '11-50', '51-200', '201-1000', '1000+')),
  country text check (char_length(country) <= 60),
  city text check (char_length(city) <= 60),
  phone text check (char_length(phone) <= 40),
  notes text check (char_length(notes) <= 2000),
  owner_id uuid references public.funnelo_profiles (user_id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists funnelo_companies_owner_idx on public.funnelo_companies (owner_id);
create index if not exists funnelo_companies_name_idx on public.funnelo_companies (lower(name));

-- ---------------------------------------------------------------------------
-- funnelo_contacts
-- ---------------------------------------------------------------------------
create table if not exists public.funnelo_contacts (
  id uuid primary key default gen_random_uuid(),
  first_name text not null check (char_length(first_name) between 1 and 60),
  last_name text check (char_length(last_name) <= 60),
  full_name text generated always as (first_name || coalesce(' ' || last_name, '')) stored,
  email text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text check (char_length(phone) <= 40),
  job_title text check (char_length(job_title) <= 80),
  company_id uuid references public.funnelo_companies (id) on delete set null,
  notes text check (char_length(notes) <= 2000),
  owner_id uuid references public.funnelo_profiles (user_id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists funnelo_contacts_company_idx on public.funnelo_contacts (company_id);
create index if not exists funnelo_contacts_owner_idx on public.funnelo_contacts (owner_id);
create index if not exists funnelo_contacts_name_idx on public.funnelo_contacts (lower(full_name));

-- ---------------------------------------------------------------------------
-- funnelo_deals
-- ---------------------------------------------------------------------------
-- Валюта одна (USD) — суми в дашборді коректно додаються.
-- position — дробовий порядок картки в колонці канбану: перетягування між
-- двома картками = середнє їхніх position, без перенумерації всієї колонки.
-- closed_at веде тригер funnelo_deals_sync_closed за kind етапу.
create table if not exists public.funnelo_deals (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 160),
  value numeric(14, 2) not null default 0 check (value >= 0),
  stage_id uuid not null references public.funnelo_pipeline_stages (id) on delete restrict,
  company_id uuid references public.funnelo_companies (id) on delete set null,
  contact_id uuid references public.funnelo_contacts (id) on delete set null,
  owner_id uuid references public.funnelo_profiles (user_id) on delete set null default auth.uid(),
  expected_close_date date,
  position double precision not null default 0,
  closed_at timestamptz,
  lost_reason text check (char_length(lost_reason) <= 300),
  notes text check (char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists funnelo_deals_stage_position_idx on public.funnelo_deals (stage_id, position);
create index if not exists funnelo_deals_owner_idx on public.funnelo_deals (owner_id);
create index if not exists funnelo_deals_company_idx on public.funnelo_deals (company_id);
create index if not exists funnelo_deals_contact_idx on public.funnelo_deals (contact_id);
create index if not exists funnelo_deals_closed_idx on public.funnelo_deals (closed_at desc) where closed_at is not null;

-- ---------------------------------------------------------------------------
-- funnelo_activities — дзвінки, листи, зустрічі, задачі, нотатки
-- ---------------------------------------------------------------------------
create table if not exists public.funnelo_activities (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('call', 'email', 'meeting', 'task', 'note')),
  subject text not null check (char_length(subject) between 1 and 200),
  body text check (char_length(body) <= 4000),
  due_at timestamptz,
  completed_at timestamptz,
  deal_id uuid references public.funnelo_deals (id) on delete cascade,
  contact_id uuid references public.funnelo_contacts (id) on delete set null,
  company_id uuid references public.funnelo_companies (id) on delete set null,
  owner_id uuid references public.funnelo_profiles (user_id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists funnelo_activities_deal_idx on public.funnelo_activities (deal_id, created_at desc);
create index if not exists funnelo_activities_contact_idx on public.funnelo_activities (contact_id);
create index if not exists funnelo_activities_company_idx on public.funnelo_activities (company_id);
create index if not exists funnelo_activities_open_due_idx
  on public.funnelo_activities (owner_id, due_at) where completed_at is null;

-- ---------------------------------------------------------------------------
-- funnelo_audit_log — хто, що і коли змінив (пише тригер funnelo_audit)
-- ---------------------------------------------------------------------------
-- record_label — назва запису на момент зміни, щоб журнал був читабельним
-- навіть після видалення запису.
create table if not exists public.funnelo_audit_log (
  id bigint generated always as identity primary key,
  table_name text not null,
  record_id uuid not null,
  record_label text,
  action text not null check (action in ('insert', 'update', 'delete')),
  actor_id uuid references public.funnelo_profiles (user_id) on delete set null,
  changes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists funnelo_audit_log_created_idx on public.funnelo_audit_log (created_at desc);
create index if not exists funnelo_audit_log_record_idx on public.funnelo_audit_log (table_name, record_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Ролі
-- ---------------------------------------------------------------------------
-- security definer: читають funnelo_profiles в обхід RLS (інакше політика на
-- funnelo_profiles рекурсивно викликала б сама себе).
create or replace function public.funnelo_is_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.funnelo_profiles
     where user_id = (select auth.uid()) and is_active
  );
$$;

create or replace function public.funnelo_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.funnelo_profiles
     where user_id = (select auth.uid()) and is_active and role = 'admin'
  );
$$;

-- Перший вхід у Funnelo: створює профіль із роллю user (admin призначає
-- лише інший admin). Повертає профіль — зокрема й деактивований, щоб
-- застосунок міг показати "доступ закрито".
create or replace function public.funnelo_ensure_profile()
returns public.funnelo_profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  palette text[] := array['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9', '#ec4899', '#14b8a6'];
  result public.funnelo_profiles;
begin
  if uid is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  insert into public.funnelo_profiles (user_id, email, full_name, role, avatar_color)
  select u.id,
         u.email,
         left(coalesce(nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''), split_part(u.email, '@', 1)), 80),
         'user',
         palette[1 + abs(hashtext(u.id::text) % array_length(palette, 1))]
    from auth.users u
   where u.id = uid
  on conflict (user_id) do nothing;

  select * into result from public.funnelo_profiles where user_id = uid;
  return result;
end;
$$;

-- Роль і доступ змінює лише admin, і не собі (щоб не залишитись без admin).
-- Запити з SQL Editor / service_role (auth.uid() = null) не обмежуються.
create or replace function public.funnelo_profiles_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    return new;
  end if;

  if new.user_id is distinct from old.user_id or new.email is distinct from old.email then
    raise exception 'Profile identity cannot be changed' using errcode = '42501';
  end if;

  if new.role is distinct from old.role or new.is_active is distinct from old.is_active then
    if not public.funnelo_is_admin() then
      raise exception 'Only admins can change roles or access' using errcode = '42501';
    end if;
    if old.user_id = (select auth.uid()) then
      raise exception 'You cannot change your own role or access' using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Етапи: фінальні (won/lost) не видаляються, тип етапу незмінний
-- ---------------------------------------------------------------------------
create or replace function public.funnelo_stages_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_setting('funnelo.seeding', true) = 'on' then
    return coalesce(new, old);
  end if;

  if tg_op = 'DELETE' then
    if old.kind <> 'open' then
      raise exception 'Won and Lost stages cannot be deleted' using errcode = '42501';
    end if;
    return old;
  end if;

  if new.kind is distinct from old.kind then
    raise exception 'Stage type cannot be changed' using errcode = '42501';
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Угоди: closed_at за типом етапу
-- ---------------------------------------------------------------------------
-- open → closed_at/lost_reason скидаються; перехід у won/lost → closed_at = now().
-- Явно переданий closed_at при вставці зберігається (демо-дані з історією).
create or replace function public.funnelo_deals_sync_closed()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  stage_kind text;
begin
  select kind into stage_kind from public.funnelo_pipeline_stages where id = new.stage_id;

  if stage_kind = 'open' then
    new.closed_at := null;
    new.lost_reason := null;
  elsif tg_op = 'UPDATE' and new.stage_id is distinct from old.stage_id then
    new.closed_at := now();
  else
    new.closed_at := coalesce(new.closed_at, now());
  end if;

  if stage_kind <> 'lost' then
    new.lost_reason := null;
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Журнал змін
-- ---------------------------------------------------------------------------
-- insert/delete — знімок рядка; update — лише змінені поля {field: {old, new}}.
-- updated_at і position (перетягування в межах колонки) — шум, не логуються.
create or replace function public.funnelo_audit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  old_row jsonb := case when tg_op <> 'INSERT' then to_jsonb(old) end;
  new_row jsonb := case when tg_op <> 'DELETE' then to_jsonb(new) end;
  row_data jsonb := coalesce(new_row, old_row);
  noise text[] := array['created_at', 'updated_at', 'position'];
  diff jsonb := '{}'::jsonb;
  k text;
begin
  if current_setting('funnelo.seeding', true) = 'on' then
    return null;
  end if;

  if tg_op = 'UPDATE' then
    for k in select jsonb_object_keys(new_row) loop
      if k <> all (noise) and new_row -> k is distinct from old_row -> k then
        diff := diff || jsonb_build_object(k, jsonb_build_object('old', old_row -> k, 'new', new_row -> k));
      end if;
    end loop;
    if diff = '{}'::jsonb then
      return null;
    end if;
  else
    diff := row_data - noise;
  end if;

  insert into public.funnelo_audit_log (table_name, record_id, record_label, action, actor_id, changes)
  values (
    tg_table_name,
    coalesce(row_data ->> 'id', row_data ->> 'user_id')::uuid,
    coalesce(row_data ->> 'title', row_data ->> 'full_name', row_data ->> 'name'),
    lower(tg_op),
    (select auth.uid()),
    diff
  );
  return null;
end;
$$;

-- ---------------------------------------------------------------------------
-- Тригери
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['funnelo_profiles', 'funnelo_pipeline_stages', 'funnelo_companies', 'funnelo_contacts', 'funnelo_deals', 'funnelo_activities'] loop
    execute format('drop trigger if exists %I on public.%I', t || '_touch', t);
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.funnelo_touch_updated_at()',
      t || '_touch', t
    );
  end loop;

  -- Активності не логуються: їх багато, а таймлайн угоди й так показує історію.
  foreach t in array array['funnelo_profiles', 'funnelo_pipeline_stages', 'funnelo_companies', 'funnelo_contacts', 'funnelo_deals'] loop
    execute format('drop trigger if exists %I on public.%I', t || '_audit', t);
    execute format(
      'create trigger %I after insert or update or delete on public.%I for each row execute function public.funnelo_audit()',
      t || '_audit', t
    );
  end loop;
end;
$$;

drop trigger if exists funnelo_profiles_guard on public.funnelo_profiles;
create trigger funnelo_profiles_guard
  before update on public.funnelo_profiles
  for each row execute function public.funnelo_profiles_guard();

drop trigger if exists funnelo_pipeline_stages_guard on public.funnelo_pipeline_stages;
create trigger funnelo_pipeline_stages_guard
  before update or delete on public.funnelo_pipeline_stages
  for each row execute function public.funnelo_stages_guard();

drop trigger if exists funnelo_deals_sync_closed on public.funnelo_deals;
create trigger funnelo_deals_sync_closed
  before insert or update on public.funnelo_deals
  for each row execute function public.funnelo_deals_sync_closed();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.funnelo_profiles enable row level security;
alter table public.funnelo_pipeline_stages enable row level security;
alter table public.funnelo_audit_log enable row level security;

-- Профілі бачать учасники; ім'я/посаду редагує власник, решту — admin
-- (роль і доступ додатково стереже funnelo_profiles_guard). Вставка — лише через
-- funnelo_ensure_profile, тож insert-політики немає.
drop policy if exists "funnelo_profiles_select" on public.funnelo_profiles;
create policy "funnelo_profiles_select" on public.funnelo_profiles
  for select to authenticated using ((select public.funnelo_is_member()));

drop policy if exists "funnelo_profiles_update" on public.funnelo_profiles;
create policy "funnelo_profiles_update" on public.funnelo_profiles
  for update to authenticated
  using (user_id = (select auth.uid()) or (select public.funnelo_is_admin()))
  with check (user_id = (select auth.uid()) or (select public.funnelo_is_admin()));

-- Етапи бачать усі учасники, змінює лише admin.
drop policy if exists "funnelo_pipeline_stages_select" on public.funnelo_pipeline_stages;
create policy "funnelo_pipeline_stages_select" on public.funnelo_pipeline_stages
  for select to authenticated using ((select public.funnelo_is_member()));

drop policy if exists "funnelo_pipeline_stages_admin" on public.funnelo_pipeline_stages;
create policy "funnelo_pipeline_stages_admin" on public.funnelo_pipeline_stages
  for all to authenticated
  using ((select public.funnelo_is_admin()))
  with check ((select public.funnelo_is_admin()));

-- Журнал — лише для admin; пише тільки тригер (security definer).
drop policy if exists "funnelo_audit_log_select" on public.funnelo_audit_log;
create policy "funnelo_audit_log_select" on public.funnelo_audit_log
  for select to authenticated using ((select public.funnelo_is_admin()));

-- Робочі дані: бачать усі учасники, редагує власник або admin. Звичайний
-- користувач створює записи лише на себе і не може передати їх іншому.
do $$
declare
  t text;
  can_write text := '(select public.funnelo_is_admin()) or (owner_id = (select auth.uid()) and (select public.funnelo_is_member()))';
begin
  foreach t in array array['funnelo_companies', 'funnelo_contacts', 'funnelo_deals', 'funnelo_activities'] loop
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists %I on public.%I', t || '_select', t);
    execute format(
      'create policy %I on public.%I for select to authenticated using ((select public.funnelo_is_member()))',
      t || '_select', t
    );

    execute format('drop policy if exists %I on public.%I', t || '_insert', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (%s)', t || '_insert', t, can_write);

    execute format('drop policy if exists %I on public.%I', t || '_update', t);
    execute format(
      'create policy %I on public.%I for update to authenticated using (%s) with check (%s)',
      t || '_update', t, can_write, can_write
    );

    execute format('drop policy if exists %I on public.%I', t || '_delete', t);
    execute format('create policy %I on public.%I for delete to authenticated using (%s)', t || '_delete', t, can_write);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- funnelo_companies_list — компанії з лічильниками для таблиці
-- ---------------------------------------------------------------------------
-- security_invoker: view працює з правами того, хто читає, тож RLS діє.
-- Окремий view, щоб сортувати й фільтрувати за сумами на сервері.
create or replace view public.funnelo_companies_list
with (security_invoker = true)
as
select
  c.*,
  (select count(*) from public.funnelo_contacts x where x.company_id = c.id) as contacts_count,
  (select count(*)
     from public.funnelo_deals d join public.funnelo_pipeline_stages s on s.id = d.stage_id
    where d.company_id = c.id and s.kind = 'open') as open_deals_count,
  coalesce((select sum(d.value)
     from public.funnelo_deals d join public.funnelo_pipeline_stages s on s.id = d.stage_id
    where d.company_id = c.id and s.kind = 'open'), 0) as open_value,
  coalesce((select sum(d.value)
     from public.funnelo_deals d join public.funnelo_pipeline_stages s on s.id = d.stage_id
    where d.company_id = c.id and s.kind = 'won'), 0) as won_value
from public.funnelo_companies c;

-- ---------------------------------------------------------------------------
-- funnelo_dashboard — усі метрики дашборду одним запитом
-- ---------------------------------------------------------------------------
-- p_owner = null — уся команда, інакше — один менеджер. Лідерборд завжди
-- по всій команді. security invoker → RLS діє.
create or replace function public.funnelo_dashboard(p_owner uuid default null)
returns jsonb
language sql
stable
set search_path = ''
as $$
  with all_deals as (
    select d.id, d.value, d.owner_id, d.stage_id, d.created_at, d.closed_at, s.kind, s.probability
      from public.funnelo_deals d
      join public.funnelo_pipeline_stages s on s.id = d.stage_id
  ),
  deals as (
    select * from all_deals where p_owner is null or owner_id = p_owner
  ),
  closed_90d as (
    select * from deals where kind <> 'open' and closed_at >= now() - interval '90 days'
  )
  select jsonb_build_object(
    'open_count', (select count(*) from deals where kind = 'open'),
    'open_value', (select coalesce(sum(value), 0) from deals where kind = 'open'),
    'weighted_value', (select coalesce(round(sum(value * probability / 100.0), 2), 0) from deals where kind = 'open'),
    'won_this_month', (
      select coalesce(sum(value), 0) from deals
       where kind = 'won' and closed_at >= date_trunc('month', now())
    ),
    'won_last_month', (
      select coalesce(sum(value), 0) from deals
       where kind = 'won'
         and closed_at >= date_trunc('month', now()) - interval '1 month'
         and closed_at < date_trunc('month', now())
    ),
    'win_rate_90d', (
      select case when count(*) = 0 then null
                  else round(100.0 * count(*) filter (where kind = 'won') / count(*), 1) end
        from closed_90d
    ),
    'avg_won_value_90d', (select round(avg(value), 2) from closed_90d where kind = 'won'),
    'avg_cycle_days_90d', (
      select round(avg(extract(epoch from closed_at - created_at) / 86400)::numeric, 1)
        from closed_90d where kind = 'won'
    ),
    'by_stage', (
      select coalesce(jsonb_agg(jsonb_build_object(
               'stage_id', s.id, 'name', s.name, 'color', s.color, 'kind', s.kind,
               'count', coalesce(x.cnt, 0), 'value', coalesce(x.val, 0)
             ) order by s.position), '[]'::jsonb)
        from public.funnelo_pipeline_stages s
        left join (select stage_id, count(*) as cnt, sum(value) as val from deals group by stage_id) x
          on x.stage_id = s.id
    ),
    'monthly', (
      select coalesce(jsonb_agg(to_jsonb(m) order by m.month), '[]'::jsonb)
        from (
          select to_char(g.month, 'YYYY-MM') as month,
                 coalesce(sum(d.value) filter (where d.kind = 'won'), 0) as won_value,
                 count(d.id) filter (where d.kind = 'won') as won_count,
                 count(d.id) filter (where d.kind = 'lost') as lost_count
            from generate_series(
                   date_trunc('month', now()) - interval '11 months',
                   date_trunc('month', now()),
                   interval '1 month'
                 ) as g (month)
            left join deals d
              on d.kind <> 'open' and date_trunc('month', d.closed_at) = g.month
           group by g.month
        ) m
    ),
    'leaderboard', (
      select coalesce(jsonb_agg(to_jsonb(l) order by l.won_value desc, l.full_name), '[]'::jsonb)
        from (
          select p.user_id, p.full_name, p.avatar_color,
                 coalesce(sum(a.value) filter (where a.kind = 'won'), 0) as won_value,
                 count(a.id) filter (where a.kind = 'won') as won_count,
                 count(a.id) as closed_count
            from public.funnelo_profiles p
            left join all_deals a
              on a.owner_id = p.user_id and a.kind <> 'open' and a.closed_at >= now() - interval '90 days'
           where p.is_active
           group by p.user_id, p.full_name, p.avatar_color
        ) l
    )
  );
$$;

-- ---------------------------------------------------------------------------
-- Доступи: anon до CRM не має доступу взагалі (RLS і так закриває, це ще один шар)
-- ---------------------------------------------------------------------------
revoke all on table
  public.funnelo_profiles, public.funnelo_pipeline_stages, public.funnelo_companies, public.funnelo_contacts,
  public.funnelo_deals, public.funnelo_activities, public.funnelo_audit_log, public.funnelo_companies_list
from anon;

revoke execute on function
  public.funnelo_is_member(), public.funnelo_is_admin(), public.funnelo_ensure_profile(), public.funnelo_dashboard(uuid)
from public, anon;

grant execute on function
  public.funnelo_is_member(), public.funnelo_is_admin(), public.funnelo_ensure_profile(), public.funnelo_dashboard(uuid)
to authenticated;

-- ---------------------------------------------------------------------------
-- Realtime: канбан і задачі оновлюються в усіх відкритих вкладках
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach t in array array['funnelo_deals', 'funnelo_activities'] loop
      if not exists (
        select 1 from pg_publication_tables
         where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
      ) then
        execute format('alter publication supabase_realtime add table public.%I', t);
      end if;
    end loop;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Дефолтна воронка (лише якщо етапів ще немає)
-- ---------------------------------------------------------------------------
insert into public.funnelo_pipeline_stages (name, position, probability, kind, color)
select v.name, v.position, v.probability, v.kind, v.color
  from (values
    ('Lead', 1, 10, 'open', '#64748b'),
    ('Qualified', 2, 25, 'open', '#0ea5e9'),
    ('Proposal', 3, 50, 'open', '#6366f1'),
    ('Negotiation', 4, 75, 'open', '#f59e0b'),
    ('Won', 5, 100, 'won', '#10b981'),
    ('Lost', 6, 0, 'lost', '#ef4444')
  ) as v (name, position, probability, kind, color)
 where not exists (select 1 from public.funnelo_pipeline_stages);

commit;
