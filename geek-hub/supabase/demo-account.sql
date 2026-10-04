-- Демо-акаунт GeekHub для відвідувачів портфоліо — щоб оцінити проєкт без
-- реєстрації. ЗГЕНЕРОВАНО supabase/generate-demo.mjs (npm run demo:generate),
-- не редагувати вручну.
--
--   Email:    demo@geekhub.test
--   Password: GeekHub-demo-2026
--
-- Запускати ПІСЛЯ supabase/schema.sql, у Supabase SQL Editor (виконується від
-- імені postgres, тож RLS не заважає вставці в auth.users).
--
-- Скрипт СКИДАЄ демо-дані: бібліотеку, списки й відгуки демо-користувача
-- видаляє й створює заново. Відвідувачі можуть усе змінювати — щоб повернути
-- вітрину до початкового стану, просто перезапустити файл.
--
-- Навіщо SQL, а не звичайна реєстрація: підтвердження email увімкнене, а
-- листи на вигадані адреси не доходять. Вставка в auth.users +
-- auth.identities — стандартний спосіб створити підтвердженого користувача
-- без service_role ключа (так само, як job-platform/supabase/demo-accounts.sql).
--
-- ⚠ auth.users спільна з іншими портфоліо-проєктами — цими ж даними можна
-- увійти й туди (там у демо-користувача просто не буде даних).

do $$
declare
  demo_email text := 'demo@geekhub.test';
  demo_uid uuid;
  new_list_id uuid;
begin
  -- Порожні рядки замість null у *_token/email_change — GoTrue падає на NULL
  -- у цих колонках при вході ("converting NULL to string is unsupported").
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  )
  select
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
    demo_email, extensions.crypt('GeekHub-demo-2026', extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(),
    '', '', '', ''
  where not exists (select 1 from auth.users u where u.email = demo_email);

  select id into demo_uid from auth.users where email = demo_email;

  -- Пароль скидаємо щоразу — якщо хтось його змінив, вітрина знову відкрита.
  update auth.users
     set encrypted_password = extensions.crypt('GeekHub-demo-2026', extensions.gen_salt('bf'))
   where id = demo_uid;

  -- Без identity вхід за email/паролем не працює в поточних версіях GoTrue.
  insert into auth.identities (
    id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  )
  values (
    gen_random_uuid(), demo_uid, demo_uid::text,
    jsonb_build_object('sub', demo_uid::text, 'email', demo_email, 'email_verified', true),
    'email', now(), now(), now()
  )
  on conflict (provider_id, provider) do nothing;

  insert into public.geek_hub_profiles (user_id, username, display_name, bio)
  values (
    demo_uid, 'demo_otaku', 'Demo Otaku',
    'Demo account for GeekHub. Feel free to click around — data resets regularly.'
  )
  on conflict (user_id) do update
    set username = excluded.username, display_name = excluded.display_name, bio = excluded.bio;

  -- Скидання попередніх демо-даних (каскадом прибирає й елементи списків).
  delete from public.geek_hub_entries where user_id = demo_uid;
  delete from public.geek_hub_lists where user_id = demo_uid;
  delete from public.geek_hub_reviews where user_id = demo_uid;

  -- ---------------------------------------------------------------------------
  -- Бібліотека
  -- ---------------------------------------------------------------------------
  insert into public.geek_hub_entries (user_id, anime_id, status, progress, score, is_favorite, anime, updated_at)
  values
    (demo_uid, 154587, 'completed', 28, 10, true, '{"id":154587,"title":"Frieren: Beyond Journey’s End","image":"https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx154587-qQTzQnEJJ3oB.jpg","color":"#bbf1a1","score":9.1,"type":"TV","episodes":28,"year":2023,"status":"Finished"}'::jsonb, now() - interval '2 days'),
    (demo_uid, 5114, 'completed', 64, 10, true, '{"id":5114,"title":"Fullmetal Alchemist: Brotherhood","image":"https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx5114-nSWCgQlmOMtj.jpg","color":"#e4c993","score":9,"type":"TV","episodes":64,"year":2009,"status":"Finished"}'::jsonb, now() - interval '40 days'),
    (demo_uid, 9253, 'completed', 24, 9, true, '{"id":9253,"title":"Steins;Gate","image":"https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx9253-tIUXF2gfU8Sg.jpg","color":"#ffd6ae","score":8.9,"type":"TV","episodes":24,"year":2011,"status":"Finished"}'::jsonb, now() - interval '55 days'),
    (demo_uid, 1, 'completed', 26, 9, false, '{"id":1,"title":"Cowboy Bebop","image":"https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx1-GCsPm7waJ4kS.png","color":"#f16b50","score":8.6,"type":"TV","episodes":26,"year":1998,"status":"Finished"}'::jsonb, now() - interval '90 days'),
    (demo_uid, 16498, 'completed', 25, 9, false, '{"id":16498,"title":"Attack on Titan","image":"https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx16498-buvcRTBx4NSm.jpg","color":"#f1a143","score":8.5,"type":"TV","episodes":25,"year":2013,"status":"Finished"}'::jsonb, now() - interval '70 days'),
    (demo_uid, 21827, 'completed', 13, 9, true, '{"id":21827,"title":"Violet Evergarden","image":"https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx21827-ubzq619ZA2E9.png","color":"#3586e4","score":8.5,"type":"TV","episodes":13,"year":2018,"status":"Finished"}'::jsonb, now() - interval '30 days'),
    (demo_uid, 20954, 'completed', 1, 9, false, '{"id":20954,"title":"A Silent Voice","image":"https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx20954-sYRfE5jQRtSB.jpg","color":"#5dbbe4","score":8.8,"type":"Movie","episodes":1,"year":2016,"status":"Finished"}'::jsonb, now() - interval '25 days'),
    (demo_uid, 130003, 'completed', 12, 8, false, '{"id":130003,"title":"BOCCHI THE ROCK!","image":"https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx130003-HTDmeL4RGeJ4.png","color":"#e4bb50","score":8.7,"type":"TV","episodes":12,"year":2022,"status":"Finished"}'::jsonb, now() - interval '15 days'),
    (demo_uid, 21507, 'completed', 12, 8, false, '{"id":21507,"title":"Mob Psycho 100","image":"https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx21507-6YUSbh2m0N1p.jpg","color":"#d65d1a","score":8.4,"type":"TV","episodes":12,"year":2016,"status":"Finished"}'::jsonb, now() - interval '60 days'),
    (demo_uid, 113415, 'completed', 24, 8, false, '{"id":113415,"title":"JUJUTSU KAISEN","image":"https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx113415-LHBAeoZDIsnF.jpg","color":"#e45d5d","score":8.4,"type":"TV","episodes":24,"year":2020,"status":"Finished"}'::jsonb, now() - interval '20 days'),
    (demo_uid, 101348, 'watching', 17, 9, false, '{"id":101348,"title":"Vinland Saga","image":"https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx101348-2fhDFPCuMNiz.jpg","color":"#f16b5d","score":8.7,"type":"TV","episodes":24,"year":2019,"status":"Finished"}'::jsonb, now() - interval '1 days'),
    (demo_uid, 140960, 'watching', 8, 8, false, '{"id":140960,"title":"SPY x FAMILY","image":"https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx140960-Kb6R5nYQfjmP.jpg","color":"#c9f1f1","score":8.3,"type":"TV","episodes":12,"year":2022,"status":"Finished"}'::jsonb, now() - interval '3 days'),
    (demo_uid, 171018, 'watching', 5, null, false, '{"id":171018,"title":"DAN DA DAN","image":"https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx171018-60q1B6GK2Ghb.jpg","color":"#e47850","score":8.3,"type":"TV","episodes":12,"year":2024,"status":"Finished"}'::jsonb, now() - interval '0 days'),
    (demo_uid, 11061, 'on_hold', 58, 9, false, '{"id":11061,"title":"Hunter x Hunter (2011)","image":"https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx11061-y5gsT1hoHuHw.png","color":"#f1d65d","score":8.9,"type":"TV","episodes":148,"year":2011,"status":"Finished"}'::jsonb, now() - interval '45 days'),
    (demo_uid, 97986, 'planned', 0, null, false, '{"id":97986,"title":"Made in Abyss","image":"https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx97986-TQ7dCgbS3y5s.jpg","color":"#e4c9ae","score":8.4,"type":"TV","episodes":13,"year":2017,"status":"Finished"}'::jsonb, now() - interval '4 days'),
    (demo_uid, 457, 'planned', 0, null, false, '{"id":457,"title":"MUSHI-SHI","image":"https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx457-l6cTtNgI9Bi6.png","color":"#d6bb78","score":8.4,"type":"TV","episodes":26,"year":2005,"status":"Finished"}'::jsonb, now() - interval '6 days'),
    (demo_uid, 30, 'planned', 0, null, false, '{"id":30,"title":"Neon Genesis Evangelion","image":"https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx30-AI1zr74Dh4ye.jpg","color":"#f17843","score":8.3,"type":"TV","episodes":26,"year":1995,"status":"Finished"}'::jsonb, now() - interval '12 days'),
    (demo_uid, 127230, 'dropped', 4, 6, false, '{"id":127230,"title":"Chainsaw Man","image":"https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx127230-DdP4vAdssLoz.png","color":"#6b1a1a","score":8.3,"type":"TV","episodes":12,"year":2022,"status":"Finished"}'::jsonb, now() - interval '33 days');

  -- ---------------------------------------------------------------------------
  -- Списки
  -- ---------------------------------------------------------------------------
  insert into public.geek_hub_lists (user_id, title, description, is_public)
  values (demo_uid, 'All-time favorites', 'The ones I recommend to everyone, no matter what they usually watch.', true)
  returning id into new_list_id;

  insert into public.geek_hub_list_items (list_id, anime_id, anime, added_at)
  values
      (new_list_id, 154587, '{"id":154587,"title":"Frieren: Beyond Journey’s End","image":"https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx154587-qQTzQnEJJ3oB.jpg","color":"#bbf1a1","score":9.1,"type":"TV","episodes":28,"year":2023,"status":"Finished"}'::jsonb, now() - interval '0 hours'),
      (new_list_id, 5114, '{"id":5114,"title":"Fullmetal Alchemist: Brotherhood","image":"https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx5114-nSWCgQlmOMtj.jpg","color":"#e4c993","score":9,"type":"TV","episodes":64,"year":2009,"status":"Finished"}'::jsonb, now() - interval '1 hours'),
      (new_list_id, 9253, '{"id":9253,"title":"Steins;Gate","image":"https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx9253-tIUXF2gfU8Sg.jpg","color":"#ffd6ae","score":8.9,"type":"TV","episodes":24,"year":2011,"status":"Finished"}'::jsonb, now() - interval '2 hours'),
      (new_list_id, 21827, '{"id":21827,"title":"Violet Evergarden","image":"https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx21827-ubzq619ZA2E9.png","color":"#3586e4","score":8.5,"type":"TV","episodes":13,"year":2018,"status":"Finished"}'::jsonb, now() - interval '3 hours'),
      (new_list_id, 1, '{"id":1,"title":"Cowboy Bebop","image":"https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx1-GCsPm7waJ4kS.png","color":"#f16b50","score":8.6,"type":"TV","episodes":26,"year":1998,"status":"Finished"}'::jsonb, now() - interval '4 hours'),
      (new_list_id, 101348, '{"id":101348,"title":"Vinland Saga","image":"https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx101348-2fhDFPCuMNiz.jpg","color":"#f16b5d","score":8.7,"type":"TV","episodes":24,"year":2019,"status":"Finished"}'::jsonb, now() - interval '5 hours'),
      (new_list_id, 20954, '{"id":20954,"title":"A Silent Voice","image":"https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx20954-sYRfE5jQRtSB.jpg","color":"#5dbbe4","score":8.8,"type":"Movie","episodes":1,"year":2016,"status":"Finished"}'::jsonb, now() - interval '6 hours');

  insert into public.geek_hub_lists (user_id, title, description, is_public)
  values (demo_uid, 'Starter pack for anime newcomers', 'Short, accessible and unforgettable — perfect first anime.', true)
  returning id into new_list_id;

  insert into public.geek_hub_list_items (list_id, anime_id, anime, added_at)
  values
      (new_list_id, 1, '{"id":1,"title":"Cowboy Bebop","image":"https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx1-GCsPm7waJ4kS.png","color":"#f16b50","score":8.6,"type":"TV","episodes":26,"year":1998,"status":"Finished"}'::jsonb, now() - interval '3 hours'),
      (new_list_id, 140960, '{"id":140960,"title":"SPY x FAMILY","image":"https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx140960-Kb6R5nYQfjmP.jpg","color":"#c9f1f1","score":8.3,"type":"TV","episodes":12,"year":2022,"status":"Finished"}'::jsonb, now() - interval '4 hours'),
      (new_list_id, 21507, '{"id":21507,"title":"Mob Psycho 100","image":"https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx21507-6YUSbh2m0N1p.jpg","color":"#d65d1a","score":8.4,"type":"TV","episodes":12,"year":2016,"status":"Finished"}'::jsonb, now() - interval '5 hours'),
      (new_list_id, 130003, '{"id":130003,"title":"BOCCHI THE ROCK!","image":"https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx130003-HTDmeL4RGeJ4.png","color":"#e4bb50","score":8.7,"type":"TV","episodes":12,"year":2022,"status":"Finished"}'::jsonb, now() - interval '6 hours'),
      (new_list_id, 20954, '{"id":20954,"title":"A Silent Voice","image":"https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx20954-sYRfE5jQRtSB.jpg","color":"#5dbbe4","score":8.8,"type":"Movie","episodes":1,"year":2016,"status":"Finished"}'::jsonb, now() - interval '7 hours'),
      (new_list_id, 16498, '{"id":16498,"title":"Attack on Titan","image":"https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx16498-buvcRTBx4NSm.jpg","color":"#f1a143","score":8.5,"type":"TV","episodes":25,"year":2013,"status":"Finished"}'::jsonb, now() - interval '8 hours');

  insert into public.geek_hub_lists (user_id, title, description, is_public)
  values (demo_uid, 'Comfy rewatches', 'For slow evenings.', false)
  returning id into new_list_id;

  insert into public.geek_hub_list_items (list_id, anime_id, anime, added_at)
  values
      (new_list_id, 457, '{"id":457,"title":"MUSHI-SHI","image":"https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx457-l6cTtNgI9Bi6.png","color":"#d6bb78","score":8.4,"type":"TV","episodes":26,"year":2005,"status":"Finished"}'::jsonb, now() - interval '6 hours'),
      (new_list_id, 130003, '{"id":130003,"title":"BOCCHI THE ROCK!","image":"https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx130003-HTDmeL4RGeJ4.png","color":"#e4bb50","score":8.7,"type":"TV","episodes":12,"year":2022,"status":"Finished"}'::jsonb, now() - interval '7 hours'),
      (new_list_id, 154587, '{"id":154587,"title":"Frieren: Beyond Journey’s End","image":"https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx154587-qQTzQnEJJ3oB.jpg","color":"#bbf1a1","score":9.1,"type":"TV","episodes":28,"year":2023,"status":"Finished"}'::jsonb, now() - interval '8 hours'),
      (new_list_id, 140960, '{"id":140960,"title":"SPY x FAMILY","image":"https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx140960-Kb6R5nYQfjmP.jpg","color":"#c9f1f1","score":8.3,"type":"TV","episodes":12,"year":2022,"status":"Finished"}'::jsonb, now() - interval '9 hours');

  -- ---------------------------------------------------------------------------
  -- Відгуки
  -- ---------------------------------------------------------------------------
  insert into public.geek_hub_reviews (user_id, anime_id, score, body, has_spoilers, created_at, updated_at)
  values
    (demo_uid, 154587, 10, 'A quiet masterpiece about time, memory and what it means to know someone. Frieren takes the usual ''after the hero''s journey'' idea and turns it into something genuinely moving. Gorgeous animation and a soundtrack that sticks with you.', false, now() - interval '1 days', now() - interval '1 days'),
    (demo_uid, 5114, 10, 'Still the gold standard for shounen storytelling: tight plot, unforgettable villains and an ending that actually pays everything off. If you only watch one long series, make it this one.', false, now() - interval '5 days', now() - interval '5 days'),
    (demo_uid, 127230, 6, 'Great style and a wild first few episodes, but it lost me once the tone got bleaker. Makima is a fantastic villain though, and that ending to the first arc is brutal.', true, now() - interval '9 days', now() - interval '9 days');
end $$;
