-- AI Radar demo account: confirmed right away (no email), with a few
-- favorites already saved — so reviewers can sign in and click around.
--
--   demo@demo.airadar.test  /  AIRadar-demo-2026
--
-- Run AFTER supabase/schema.sql, in the Supabase SQL Editor (it runs as
-- postgres, so RLS doesn't block inserting into auth.users). Safe to re-run:
-- an existing user / rows are skipped.
--
-- Why SQL instead of a normal sign-up: email confirmation is enabled on the
-- shared project and mail to a made-up address never arrives. Inserting into
-- auth.users + auth.identities is the standard way to create a confirmed user
-- without the service_role key — same approach as job-platform/supabase/demo-accounts.sql.
--
-- ⚠ auth.users is shared with job-platform / task-manager — these credentials
-- work there too (without any role/profile in those apps).

do $$
declare
  demo_email text := 'demo@demo.airadar.test';
  demo_password text := 'AIRadar-demo-2026';
  demo_uid uuid;
begin
  -- Empty strings instead of null in *_token / email_change — GoTrue fails on
  -- NULL in these columns at sign-in ("converting NULL to string is unsupported").
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  )
  select
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
    demo_email, extensions.crypt(demo_password, extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(),
    '', '', '', ''
  where not exists (select 1 from auth.users u where u.email = demo_email);

  select id into demo_uid from auth.users where email = demo_email;

  -- Without an identity, email/password sign-in doesn't work in current GoTrue.
  insert into auth.identities (
    id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  )
  values (
    gen_random_uuid(), demo_uid, demo_uid::text,
    jsonb_build_object('sub', demo_uid::text, 'email', demo_email, 'email_verified', true),
    'email', now(), now(), now()
  )
  on conflict (provider_id, provider) do nothing;

  -- A few favorites (all present in the FreeSerp index), newest first in the UI.
  insert into public.ai_radar_favorites (user_id, domain, created_at)
  select demo_uid, f.domain, now() - f.ago
  from (values
    ('bolt.new', interval '1 hour'),
    ('socixis.dev', interval '1 day'),
    ('plausible.io', interval '2 days'),
    ('webflow.com', interval '3 days'),
    ('semrush.com', interval '4 days'),
    ('typeform.com', interval '5 days')
  ) as f(domain, ago)
  on conflict (user_id, domain) do nothing;
end $$;
