-- Демо-дані Funnelo CRM для відвідувачів портфоліо — щоб оцінити проєкт без
-- реєстрації.
--
--   Admin:  admin@funnelo.test / Funnelo-demo-2026   (Alex Morgan, Head of Sales)
--   User:   user@funnelo.test  / Funnelo-demo-2026   (Jamie Carter, Account Executive)
--
-- Ще 4 менеджери (Priya, Marcus, Elena, Tom) — лише для реалістичної команди
-- й лідерборду; пароль у них випадковий, увійти під ними не можна.
--
-- Запускати ПІСЛЯ supabase/schema.sql, у Supabase SQL Editor (виконується від
-- імені postgres, тож RLS не заважає вставці в auth.users).
--
-- ⚠ Скрипт СКИДАЄ ВСІ дані CRM: компанії, контакти, угоди, активності, етапи
-- й журнал видаляються та створюються заново. CRM — одна спільна команда,
-- тож це вітрина: перезапуск повертає її до початкового стану. Профілі
-- користувачів не видаляються.
--
-- Дати рахуються від now(), тож дашборд завжди виглядає "свіжим".
-- setseed робить "випадкові" дані однаковими при кожному запуску.
--
-- Навіщо SQL, а не реєстрація: підтвердження email увімкнене, а листи на
-- вигадані адреси не доходять (так само, як geek-hub/supabase/demo-account.sql).
--
-- ⚠ auth.users спільна з іншими портфоліо-проєктами — цими ж даними можна
-- увійти й туди (там у демо-користувачів просто не буде даних).

begin;

do $$
declare
  demo_password constant text := 'Funnelo-demo-2026';

  team_emails text[] := array[
    'admin@funnelo.test', 'user@funnelo.test', 'priya.shah@funnelo.test',
    'marcus.lee@funnelo.test', 'elena.novak@funnelo.test', 'tom.becker@funnelo.test'
  ];
  team_names text[] := array['Alex Morgan', 'Jamie Carter', 'Priya Shah', 'Marcus Lee', 'Elena Novak', 'Tom Becker'];
  team_titles text[] := array[
    'Head of Sales', 'Account Executive', 'Senior Account Executive',
    'Account Executive', 'Sales Development Rep', 'Account Executive'
  ];
  team_roles text[] := array['admin', 'user', 'user', 'user', 'user', 'user'];
  team_colors text[] := array['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9'];
  team uuid[] := '{}';

  first_names text[] := array[
    'Olivia', 'Liam', 'Emma', 'Noah', 'Sophia', 'Lucas', 'Mia', 'Ethan', 'Isabella', 'Mateo',
    'Amelia', 'Oliver', 'Harper', 'Elijah', 'Chloe', 'Daniel', 'Zoe', 'Henry', 'Nora', 'Samuel',
    'Aria', 'Leo', 'Hannah', 'Gabriel', 'Maya', 'Julian', 'Sofia', 'Adrian', 'Lena', 'Victor'
  ];
  last_names text[] := array[
    'Bennett', 'Hughes', 'Fischer', 'Romero', 'Kowalski', 'Nguyen', 'Patel', 'Larsen', 'Moreau', 'Rossi',
    'Tanaka', 'Silva', 'Sullivan', 'Schmidt', 'Dubois', 'Varga', 'Jensen', 'Kim', 'Morales', 'Andersen',
    'Ricci', 'Weber', 'Costa', 'Hayes', 'Lindqvist', 'Brooks', 'Ward', 'Petrov', 'Castillo', 'Holm'
  ];
  decision_titles text[] := array[
    'CEO', 'COO', 'CFO', 'CTO', 'VP of Operations', 'VP of Sales', 'Head of Procurement', 'Head of IT'
  ];
  other_titles text[] := array[
    'Operations Manager', 'IT Manager', 'Procurement Specialist', 'Office Manager',
    'Finance Manager', 'Product Manager', 'Marketing Lead'
  ];

  products text[] := array[
    'Annual license', 'Platform rollout', 'Pilot project', 'Support renewal', 'Team expansion',
    'Data migration', 'Onboarding package', 'Enterprise plan', 'Analytics add-on', 'Multi-year contract'
  ];
  lost_reasons text[] := array[
    'Chose a competitor', 'Budget cut', 'No decision made', 'Price too high',
    'Timing: revisit next year', 'Missing integration'
  ];

  call_subjects text[] := array['Discovery call', 'Follow-up call', 'Pricing discussion', 'Check-in call', 'Call with decision maker'];
  email_subjects text[] := array['Sent proposal', 'Shared case study', 'Follow-up after demo', 'Sent contract draft', 'Answered security questionnaire'];
  meeting_subjects text[] := array['Product demo', 'Kickoff meeting', 'Stakeholder review', 'On-site visit', 'Technical deep dive'];
  task_subjects text[] := array['Prepare proposal', 'Send updated pricing', 'Schedule demo', 'Update contract terms', 'Follow up on signature'];
  note_subjects text[] := array[
    'Budget confirmed for next quarter', 'CFO signs off on anything above $50k',
    'Competitor is also in evaluation', 'Needs SSO before rollout', 'Prefers async updates over calls'
  ];

  st_lead uuid;
  st_qualified uuid;
  st_proposal uuid;
  st_negotiation uuid;
  st_won uuid;
  st_lost uuid;
  open_stages uuid[];

  uid uuid;
  comp record;
  deal record;
  v_contact uuid;
  v_owner uuid;
  v_stage uuid;
  v_created timestamptz;
  v_closed timestamptz;
  v_close_date date;
  v_value numeric;
  v_reason text;
  v_type text;
  v_subject text;
  v_at timestamptz;
  v_span interval;
  r double precision;
  n int;
  i int;
  j int;
begin
  -- Без журналу змін і guard-тригерів на час сідінгу (лише ця транзакція).
  perform set_config('funnelo.seeding', 'on', true);
  perform setseed(0.2026);

  -- -------------------------------------------------------------------------
  -- Команда
  -- -------------------------------------------------------------------------
  for i in 1 .. array_length(team_emails, 1) loop
    -- Порожні рядки замість null у *_token/email_change — GoTrue падає на NULL
    -- у цих колонках при вході ("converting NULL to string is unsupported").
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    )
    select
      '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
      team_emails[i],
      extensions.crypt(case when i <= 2 then demo_password else gen_random_uuid()::text end, extensions.gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', team_names[i]), now(), now(),
      '', '', '', ''
    where not exists (select 1 from auth.users u where u.email = team_emails[i]);

    select id into uid from auth.users where email = team_emails[i];

    -- Пароль демо-акаунтів скидаємо щоразу — якщо хтось його змінив, вітрина знову відкрита.
    if i <= 2 then
      update auth.users
         set encrypted_password = extensions.crypt(demo_password, extensions.gen_salt('bf'))
       where id = uid;
    end if;

    -- Без identity вхід за email/паролем не працює в поточних версіях GoTrue.
    insert into auth.identities (
      id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    )
    values (
      gen_random_uuid(), uid, uid::text,
      jsonb_build_object('sub', uid::text, 'email', team_emails[i], 'email_verified', true),
      'email', now(), now(), now()
    )
    on conflict (provider_id, provider) do nothing;

    insert into public.funnelo_profiles (user_id, email, full_name, title, role, avatar_color, is_active, created_at)
    values (uid, team_emails[i], team_names[i], team_titles[i], team_roles[i], team_colors[i], true, now() - interval '400 days')
    on conflict (user_id) do update
      set full_name = excluded.full_name,
          title = excluded.title,
          role = excluded.role,
          avatar_color = excluded.avatar_color,
          is_active = true;

    team := team || uid;
  end loop;

  -- -------------------------------------------------------------------------
  -- Скидання попередніх даних CRM
  -- -------------------------------------------------------------------------
  delete from public.funnelo_activities where true;
  delete from public.funnelo_deals where true;
  delete from public.funnelo_contacts where true;
  delete from public.funnelo_companies where true;
  delete from public.funnelo_pipeline_stages where true;
  delete from public.funnelo_audit_log where true;

  -- -------------------------------------------------------------------------
  -- Воронка
  -- -------------------------------------------------------------------------
  insert into public.funnelo_pipeline_stages (name, position, probability, kind, color)
    values ('Lead', 1, 10, 'open', '#64748b') returning id into st_lead;
  insert into public.funnelo_pipeline_stages (name, position, probability, kind, color)
    values ('Qualified', 2, 25, 'open', '#0ea5e9') returning id into st_qualified;
  insert into public.funnelo_pipeline_stages (name, position, probability, kind, color)
    values ('Proposal', 3, 50, 'open', '#6366f1') returning id into st_proposal;
  insert into public.funnelo_pipeline_stages (name, position, probability, kind, color)
    values ('Negotiation', 4, 75, 'open', '#f59e0b') returning id into st_negotiation;
  insert into public.funnelo_pipeline_stages (name, position, probability, kind, color)
    values ('Won', 5, 100, 'won', '#10b981') returning id into st_won;
  insert into public.funnelo_pipeline_stages (name, position, probability, kind, color)
    values ('Lost', 6, 0, 'lost', '#ef4444') returning id into st_lost;

  open_stages := array[st_lead, st_qualified, st_proposal, st_negotiation];

  -- -------------------------------------------------------------------------
  -- Компанії (вигадані; домени .example — зарезервовані, нікому не належать)
  -- -------------------------------------------------------------------------
  insert into public.funnelo_companies (name, domain, industry, size, country, city, phone, owner_id, created_at, updated_at)
  select v.name, v.domain, v.industry, v.size, v.country, v.city,
         '+1 (555) ' || lpad((100 + floor(random() * 900))::text, 3, '0') || '-' || lpad(floor(random() * 10000)::text, 4, '0'),
         team[1 + floor(random() * 6)::int],
         now() - (370 + random() * 120) * interval '1 day',
         now() - random() * 60 * interval '1 day'
    from (values
      ('Atlas Construction', 'atlas-construction.example', 'Construction', '201-1000', 'United States', 'Denver'),
      ('Bluefin Seafood', 'bluefin-seafood.example', 'Food & Beverage', '51-200', 'Norway', 'Bergen'),
      ('Brightline Analytics', 'brightline.example', 'Software', '11-50', 'United Kingdom', 'London'),
      ('Cedar Software', 'cedarsoft.example', 'Software', '51-200', 'Canada', 'Toronto'),
      ('Cobalt Freight', 'cobaltfreight.example', 'Logistics', '1000+', 'Germany', 'Hamburg'),
      ('Driftwood Coffee', 'driftwood-coffee.example', 'Food & Beverage', '11-50', 'United States', 'Portland'),
      ('Ember Fitness', 'emberfit.example', 'Health & Fitness', '51-200', 'Australia', 'Melbourne'),
      ('Evergreen Dental Group', 'evergreen-dental.example', 'Healthcare', '201-1000', 'United States', 'Seattle'),
      ('Falcon Aerospace', 'falcon-aero.example', 'Aerospace', '1000+', 'France', 'Toulouse'),
      ('Granite Telecom', 'granitetel.example', 'Telecommunications', '1000+', 'Poland', 'Warsaw'),
      ('Harbor Pharma', 'harborpharma.example', 'Pharmaceuticals', '201-1000', 'Switzerland', 'Basel'),
      ('Helix Robotics', 'helixrobotics.example', 'Manufacturing', '51-200', 'Japan', 'Osaka'),
      ('Indigo Fashion', 'indigo-fashion.example', 'Retail', '201-1000', 'Italy', 'Milan'),
      ('Ironclad Security', 'ironclad.example', 'Cybersecurity', '51-200', 'Israel', 'Tel Aviv'),
      ('Jade Biotech', 'jadebio.example', 'Biotech', '11-50', 'Singapore', 'Singapore'),
      ('Juniper Health', 'juniperhealth.example', 'Healthcare', '1000+', 'United States', 'Boston'),
      ('Keystone Realty', 'keystone-realty.example', 'Real Estate', '51-200', 'United States', 'Chicago'),
      ('Lumen Solar', 'lumensolar.example', 'Energy', '201-1000', 'Spain', 'Valencia'),
      ('Maple & Co Retail', 'maple-retail.example', 'Retail', '1000+', 'Canada', 'Vancouver'),
      ('Nimbus Cloudworks', 'nimbuscloud.example', 'Software', '201-1000', 'Ireland', 'Dublin'),
      ('Orbit Media', 'orbitmedia.example', 'Media', '51-200', 'United Kingdom', 'Manchester'),
      ('Pinecrest Hotels', 'pinecrest-hotels.example', 'Hospitality', '1000+', 'Austria', 'Vienna'),
      ('Quartz Fintech', 'quartzfin.example', 'Financial Services', '51-200', 'Netherlands', 'Amsterdam'),
      ('Redwood Manufacturing', 'redwood-mfg.example', 'Manufacturing', '1000+', 'United States', 'Detroit'),
      ('Silverline Insurance', 'silverline-ins.example', 'Insurance', '1000+', 'Germany', 'Munich'),
      ('Tidewater Foods', 'tidewater-foods.example', 'Food & Beverage', '201-1000', 'United States', 'Charleston'),
      ('Umbra Games', 'umbragames.example', 'Gaming', '11-50', 'Ukraine', 'Kyiv'),
      ('Vertex Legal', 'vertexlegal.example', 'Legal', '11-50', 'United Kingdom', 'Edinburgh'),
      ('Willow Education', 'willow-edu.example', 'Education', '51-200', 'Sweden', 'Stockholm'),
      ('Zephyr Airlines', 'zephyrair.example', 'Aviation', '1000+', 'Portugal', 'Lisbon')
    ) as v (name, domain, industry, size, country, city);

  -- -------------------------------------------------------------------------
  -- Контакти: 2–3 на компанію, перший — особа, що ухвалює рішення
  -- -------------------------------------------------------------------------
  for comp in select id, domain, owner_id, created_at from public.funnelo_companies order by name loop
    n := 2 + (random() < 0.35)::int;
    for j in 1 .. n loop
      v_at := comp.created_at + random() * 30 * interval '1 day';
      insert into public.funnelo_contacts (first_name, last_name, email, phone, job_title, company_id, owner_id, created_at, updated_at)
      select f.fn, l.ln,
             lower(f.fn || '.' || l.ln || '@' || comp.domain),
             '+1 (555) ' || lpad((100 + floor(random() * 900))::text, 3, '0') || '-' || lpad(floor(random() * 10000)::text, 4, '0'),
             case when j = 1 then decision_titles[1 + floor(random() * array_length(decision_titles, 1))::int]
                  else other_titles[1 + floor(random() * array_length(other_titles, 1))::int] end,
             comp.id,
             case when random() < 0.7 then comp.owner_id else team[1 + floor(random() * 6)::int] end,
             v_at, v_at
        from (select first_names[1 + floor(random() * array_length(first_names, 1))::int] as fn) f,
             (select last_names[1 + floor(random() * array_length(last_names, 1))::int] as ln) l;
    end loop;
  end loop;

  -- -------------------------------------------------------------------------
  -- Угоди: ~100 за останній рік. Старші за 40 днів здебільшого закриті
  -- (won ~56%), свіжіші — розкидані по відкритих етапах. Останні 8 — гарантовано
  -- відкриті угоди демо-акаунтів у кожному етапі, щоб канбан не був порожнім.
  -- -------------------------------------------------------------------------
  for i in 1 .. 104 loop
    select c.id, c.name into comp from public.funnelo_companies c order by random() limit 1;
    select x.id into v_contact from public.funnelo_contacts x where x.company_id = comp.id order by random() limit 1;

    r := random();
    if i > 96 then
      v_owner := team[1 + (i % 2)];
    elsif r < 0.22 then
      v_owner := team[2];
    elsif r < 0.32 then
      v_owner := team[1];
    else
      v_owner := team[3 + floor(random() * 4)::int];
    end if;

    v_created := now() - (2 + random() * 355) * interval '1 day';
    v_value := round((1500 + power(random(), 2) * 118500) / 100) * 100;
    v_closed := null;
    v_reason := null;

    if i <= 96 and now() - v_created > interval '40 days' and random() < 0.78 then
      if random() < 0.56 then
        v_stage := st_won;
      else
        v_stage := st_lost;
        v_reason := lost_reasons[1 + floor(random() * array_length(lost_reasons, 1))::int];
      end if;
      v_closed := v_created + (10 + random() * 65) * interval '1 day';
      if v_closed > now() then
        v_closed := now() - random() * 3 * interval '1 day';
      end if;
      v_close_date := v_closed::date;
    else
      if i > 96 then
        v_stage := open_stages[1 + ((i - 97) / 2)];
        v_created := now() - (3 + random() * 30) * interval '1 day';
      else
        r := random();
        v_stage := case when r < 0.30 then st_lead
                        when r < 0.57 then st_qualified
                        when r < 0.82 then st_proposal
                        else st_negotiation end;
      end if;
      -- Частина відкритих угод — з простроченою датою закриття, як у житті.
      v_close_date := (now() + (random() * 85 - 12) * interval '1 day')::date;
    end if;

    insert into public.funnelo_deals (
      title, value, stage_id, company_id, contact_id, owner_id, expected_close_date,
      position, closed_at, lost_reason, created_at, updated_at
    )
    values (
      comp.name || ' · ' || products[1 + floor(random() * array_length(products, 1))::int],
      v_value, v_stage, comp.id, v_contact, v_owner, v_close_date,
      i * 1000, v_closed, v_reason, v_created,
      coalesce(v_closed, v_created + random() * (now() - v_created))
    );
  end loop;

  -- -------------------------------------------------------------------------
  -- Активності: історія по кожній угоді + одна наступна дія для відкритих
  -- -------------------------------------------------------------------------
  for deal in
    select d.id, d.contact_id, d.company_id, d.owner_id, d.created_at, d.closed_at, s.kind
      from public.funnelo_deals d join public.funnelo_pipeline_stages s on s.id = d.stage_id
  loop
    v_span := coalesce(deal.closed_at, now()) - deal.created_at;
    n := 1 + floor(random() * 3)::int;

    for j in 1 .. n loop
      v_type := (array['call', 'email', 'meeting', 'note'])[1 + floor(random() * 4)::int];
      v_subject := case v_type
        when 'call' then call_subjects[1 + floor(random() * array_length(call_subjects, 1))::int]
        when 'email' then email_subjects[1 + floor(random() * array_length(email_subjects, 1))::int]
        when 'meeting' then meeting_subjects[1 + floor(random() * array_length(meeting_subjects, 1))::int]
        else note_subjects[1 + floor(random() * array_length(note_subjects, 1))::int]
      end;
      v_at := deal.created_at + v_span * (j::double precision / (n + 1));

      insert into public.funnelo_activities (
        type, subject, due_at, completed_at, deal_id, contact_id, company_id, owner_id, created_at, updated_at
      )
      values (
        v_type, v_subject,
        case when v_type = 'note' then null else v_at end,
        case when v_type = 'note' then null else v_at end,
        deal.id, deal.contact_id, deal.company_id, deal.owner_id, v_at, v_at
      );
    end loop;

    if deal.kind = 'open' then
      v_type := (array['task', 'call', 'meeting', 'email'])[1 + floor(random() * 4)::int];
      v_subject := case v_type
        when 'call' then call_subjects[1 + floor(random() * array_length(call_subjects, 1))::int]
        when 'email' then 'Send follow-up email'
        when 'meeting' then meeting_subjects[1 + floor(random() * array_length(meeting_subjects, 1))::int]
        else task_subjects[1 + floor(random() * array_length(task_subjects, 1))::int]
      end;
      -- Від "прострочено на 4 дні" до "через 2 тижні".
      v_at := now() + (random() * 18 - 4) * interval '1 day';

      insert into public.funnelo_activities (
        type, subject, due_at, deal_id, contact_id, company_id, owner_id, created_at, updated_at
      )
      values (
        v_type, v_subject, v_at, deal.id, deal.contact_id, deal.company_id, deal.owner_id,
        greatest(deal.created_at, now() - random() * 3 * interval '1 day'),
        greatest(deal.created_at, now() - random() * 3 * interval '1 day')
      );
    end if;
  end loop;

  -- Гарантовані задачі "на сьогодні" для обох демо-акаунтів.
  for i in 1 .. 2 loop
    j := 0;
    for deal in
      select d.id, d.contact_id, d.company_id
        from public.funnelo_deals d join public.funnelo_pipeline_stages s on s.id = d.stage_id
       where d.owner_id = team[i] and s.kind = 'open'
       order by random()
       limit 3
    loop
      j := j + 1;
      insert into public.funnelo_activities (type, subject, due_at, deal_id, contact_id, company_id, owner_id)
      values (
        (array['call', 'task', 'meeting'])[j],
        (array['Follow-up call', 'Send updated pricing', 'Technical deep dive'])[j],
        date_trunc('day', now()) + (array[10, 13, 16])[j] * interval '1 hour',
        deal.id, deal.contact_id, deal.company_id, team[i]
      );
    end loop;
  end loop;

  -- -------------------------------------------------------------------------
  -- Журнал змін: кілька свіжих записів, щоб сторінка audit log не була порожньою
  -- -------------------------------------------------------------------------
  insert into public.funnelo_audit_log (table_name, record_id, record_label, action, actor_id, changes, created_at)
  select 'funnelo_deals', d.id, d.title, 'update', d.owner_id,
         jsonb_build_object('stage_id', jsonb_build_object(
           'old', case d.stage_id
                    when st_qualified then st_lead
                    when st_proposal then st_qualified
                    when st_negotiation then st_proposal
                    else st_negotiation
                  end,
           'new', d.stage_id
         )),
         now() - random() * 10 * interval '1 day'
    from public.funnelo_deals d
   where d.stage_id <> st_lead
     and (d.closed_at is null or d.closed_at > now() - interval '10 days')
   order by random()
   limit 16;

  insert into public.funnelo_audit_log (table_name, record_id, record_label, action, actor_id, changes, created_at)
  select 'funnelo_deals', d.id, d.title, 'insert', d.owner_id,
         to_jsonb(d) - array['created_at', 'updated_at', 'position'],
         d.created_at
    from public.funnelo_deals d
   where d.created_at > now() - interval '14 days';

  insert into public.funnelo_audit_log (table_name, record_id, record_label, action, actor_id, changes, created_at)
  select 'funnelo_contacts', c.id, c.full_name, 'update', c.owner_id,
         jsonb_build_object('phone', jsonb_build_object('old', null, 'new', c.phone)),
         now() - random() * 7 * interval '1 day'
    from public.funnelo_contacts c
   order by random()
   limit 5;
end;
$$;

commit;
