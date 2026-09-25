-- Демо-акаунти VV Work: один роботодавець і один шукач роботи, одразу
-- підтверджені (без листа), з роллю, заповненим профілем і — для
-- роботодавця — двома вакансіями.
--
--   Роботодавець:  employer@demo.vvwork.test  /  VVwork-demo-2026
--   Шукач роботи:  seeker@demo.vvwork.test    /  VVwork-demo-2026
--
-- Запускати ПІСЛЯ supabase/schema.sql, у Supabase SQL Editor (виконується
-- від імені postgres, тож RLS не заважає вставці в auth.users). Безпечно
-- перезапускати: вже існуючі користувачі/рядки пропускаються.
--
-- Навіщо SQL, а не звичайна реєстрація: у проєкті ввімкнене підтвердження
-- email, а листи на вигадані адреси не доходять. Пряма вставка в auth.users
-- + auth.identities — стандартний спосіб створити підтвердженого
-- користувача без service_role ключа.
--
-- ⚠ auth.users спільна з task-manager — цими ж даними можна увійти й туди.

do $$
declare
  demo_password text := 'VVwork-demo-2026';
  employer_email text := 'employer@demo.vvwork.test';
  seeker_email text := 'seeker@demo.vvwork.test';
  employer_uid uuid;
  seeker_uid uuid;
  company_id uuid;
begin
  -- -------------------------------------------------------------------------
  -- Користувачі (auth.users + auth.identities)
  -- -------------------------------------------------------------------------
  -- Порожні рядки замість null у *_token/email_change — GoTrue падає на
  -- NULL у цих колонках при вході ("converting NULL to string is unsupported").
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  )
  select
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
    e.email, extensions.crypt(demo_password, extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(),
    '', '', '', ''
  from (values (employer_email), (seeker_email)) as e(email)
  where not exists (select 1 from auth.users u where u.email = e.email);

  select id into employer_uid from auth.users where email = employer_email;
  select id into seeker_uid from auth.users where email = seeker_email;

  -- Без identity вхід за email/паролем не працює в поточних версіях GoTrue.
  insert into auth.identities (
    id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  )
  select
    gen_random_uuid(), u.id, u.id::text,
    jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
    'email', now(), now(), now()
  from auth.users u
  where u.id in (employer_uid, seeker_uid)
  on conflict (provider_id, provider) do nothing;

  -- -------------------------------------------------------------------------
  -- Ролі
  -- -------------------------------------------------------------------------
  insert into public.job_platform_profiles (user_id, role)
  values (employer_uid, 'employer'), (seeker_uid, 'seeker')
  on conflict (user_id) do nothing;

  -- -------------------------------------------------------------------------
  -- Роботодавець: компанія + 2 вакансії
  -- -------------------------------------------------------------------------
  insert into public.job_platform_employers (slug, name, location_code, about, website, user_id)
  values (
    'nordbau-demo',
    'Nordbau Demo Sp. z o.o.',
    'wroclaw',
    'Демо-компанія для перегляду кабінету роботодавця: будівельні й монтажні роботи у Вроцлаві та околицях.',
    'https://example.com',
    employer_uid
  )
  on conflict do nothing;

  select id into company_id from public.job_platform_employers where user_id = employer_uid;

  insert into public.job_platform_jobs (
    employer_id, category, location_code, employment_type, work_format, experience_level,
    required_languages, salary_from, salary_to, currency, title, description
  )
  select company_id, j.category, j.location_code, j.employment_type, j.work_format,
    j.experience_level, j.required_languages, j.salary_from, j.salary_to, j.currency,
    jsonb_build_object('uk', j.title, 'en', j.title, 'pl', j.title),
    jsonb_build_object('uk', j.description, 'en', j.description, 'pl', j.description)
  from (values
    ('construction', 'wroclaw', 'full-time', 'onsite', '1-3', array['pl']::text[], 5500, 7500, 'PLN',
     'Монтажник гіпсокартону',
     'Монтаж перегородок і стель з гіпсокартону на житлових об''єктах. Офіційне працевлаштування, житло за рахунок компанії, інструмент надаємо.'),
    ('construction', 'wroclaw', 'seasonal', 'onsite', '0-1', array[]::text[], 4800, 5600, 'PLN',
     'Підсобний робітник на будову',
     'Допомога бригаді на будівельному майданчику: підготовка матеріалів, прибирання, прості роботи. Досвід не потрібен, навчаємо на місці.')
  ) as j(category, location_code, employment_type, work_format, experience_level,
         required_languages, salary_from, salary_to, currency, title, description)
  where not exists (
    select 1 from public.job_platform_jobs x
    where x.employer_id = company_id and x.title->>'uk' = j.title
  );

  -- -------------------------------------------------------------------------
  -- Шукач роботи: профіль кандидата (видимий у /candidates)
  -- -------------------------------------------------------------------------
  insert into public.job_platform_candidates (
    slug, name, categories, headline, profile_locale, location_code,
    desired_employment_types, desired_work_formats, experience_level, languages, skills,
    about, salary_expectation_from, currency, available_from, user_id, is_public
  )
  values (
    'demo-seeker',
    'Олексій Демо',
    array['construction', 'logistics']::text[],
    'Монтажник з досвідом 3 роки, шукаю роботу в Польщі',
    'uk',
    'wroclaw',
    array['full-time']::text[],
    array['onsite']::text[],
    '1-3',
    '[{"code": "uk", "level": "native"}, {"code": "pl", "level": "intermediate"}]'::jsonb,
    array['гіпсокартон', 'шпаклювання', 'водійські права кат. B']::text[],
    'Демо-профіль для перегляду кабінету шукача роботи.',
    5000,
    'PLN',
    current_date + 14,
    seeker_uid,
    true
  )
  on conflict do nothing;
end $$;
