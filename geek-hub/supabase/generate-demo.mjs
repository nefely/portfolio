// Генерує supabase/demo-account.sql — демо-акаунт для відвідувачів портфоліо
// (бібліотека, списки, відгуки). Знімки тайтлів (`anime` jsonb) беремо з
// AniList, тож постери/назви справжні.
//
//   npm run demo:generate
//
// Мапінг картки дублює lib/anilist/mappers.ts → toAnimeCard (скрипт — чистий
// Node без збірки TS); при зміні AnimeCard оновити обидва місця.

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const DEMO_EMAIL = "demo@geekhub.test";
const DEMO_PASSWORD = "GeekHub-demo-2026";
const DEMO_USERNAME = "demo_otaku";

// [anilistId, status, progress (null = усі епізоди), score, favorite, днів тому]
const ENTRIES = [
  [154587, "completed", null, 10, true, 2], // Frieren
  [5114, "completed", null, 10, true, 40], // Fullmetal Alchemist: Brotherhood
  [9253, "completed", null, 9, true, 55], // Steins;Gate
  [1, "completed", null, 9, false, 90], // Cowboy Bebop
  [16498, "completed", null, 9, false, 70], // Attack on Titan
  [21827, "completed", null, 9, true, 30], // Violet Evergarden
  [20954, "completed", null, 9, false, 25], // A Silent Voice
  [130003, "completed", null, 8, false, 15], // Bocchi the Rock!
  [21507, "completed", null, 8, false, 60], // Mob Psycho 100
  [113415, "completed", null, 8, false, 20], // Jujutsu Kaisen
  [101348, "watching", 17, 9, false, 1], // Vinland Saga
  [140960, "watching", 8, 8, false, 3], // Spy x Family
  [171018, "watching", 5, null, false, 0], // Dandadan
  [11061, "on_hold", 58, 9, false, 45], // Hunter x Hunter (2011)
  [97986, "planned", 0, null, false, 4], // Made in Abyss
  [457, "planned", 0, null, false, 6], // Mushishi
  [30, "planned", 0, null, false, 12], // Neon Genesis Evangelion
  [127230, "dropped", 4, 6, false, 33], // Chainsaw Man
];

const LISTS = [
  {
    title: "All-time favorites",
    description: "The ones I recommend to everyone, no matter what they usually watch.",
    isPublic: true,
    ids: [154587, 5114, 9253, 21827, 1, 101348, 20954],
  },
  {
    title: "Starter pack for anime newcomers",
    description: "Short, accessible and unforgettable — perfect first anime.",
    isPublic: true,
    ids: [1, 140960, 21507, 130003, 20954, 16498],
  },
  {
    title: "Comfy rewatches",
    description: "For slow evenings.",
    isPublic: false,
    ids: [457, 130003, 154587, 140960],
  },
];

const REVIEWS = [
  [
    154587,
    10,
    false,
    "A quiet masterpiece about time, memory and what it means to know someone. Frieren takes the usual 'after the hero's journey' idea and turns it into something genuinely moving. Gorgeous animation and a soundtrack that sticks with you.",
  ],
  [
    5114,
    10,
    false,
    "Still the gold standard for shounen storytelling: tight plot, unforgettable villains and an ending that actually pays everything off. If you only watch one long series, make it this one.",
  ],
  [
    127230,
    6,
    true,
    "Great style and a wild first few episodes, but it lost me once the tone got bleaker. Makima is a fantastic villain though, and that ending to the first arc is brutal.",
  ],
];

const FORMAT_LABELS = {
  TV: "TV",
  TV_SHORT: "TV Short",
  MOVIE: "Movie",
  SPECIAL: "Special",
  OVA: "OVA",
  ONA: "ONA",
  MUSIC: "Music",
};
const STATUS_LABELS = {
  FINISHED: "Finished",
  RELEASING: "Airing",
  NOT_YET_RELEASED: "Upcoming",
  CANCELLED: "Cancelled",
  HIATUS: "On hiatus",
};

function toAnimeCard(media) {
  const title = media.title.english?.trim() || media.title.romaji?.trim() || "Untitled";
  return {
    id: media.id,
    title,
    image: media.coverImage?.large ?? null,
    color: media.coverImage?.color ?? null,
    score: media.averageScore ? media.averageScore / 10 : null,
    type: FORMAT_LABELS[media.format] ?? null,
    episodes: media.episodes,
    year: media.seasonYear ?? media.startDate?.year ?? null,
    status: STATUS_LABELS[media.status] ?? null,
  };
}

async function fetchCards(ids) {
  const query = `query ($ids: [Int]) {
    Page(perPage: 50) {
      media(id_in: $ids, type: ANIME) {
        id title { romaji english } coverImage { large color } format episodes
        seasonYear startDate { year } status averageScore
      }
    }
  }`;
  const response = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables: { ids } }),
  });
  const body = await response.json();
  if (!response.ok || body.errors) throw new Error(JSON.stringify(body.errors ?? response.status));
  const cards = new Map(body.data.Page.media.map((media) => [media.id, toAnimeCard(media)]));
  const missing = ids.filter((id) => !cards.has(id));
  if (missing.length) throw new Error(`AniList has no anime with ids: ${missing.join(", ")}`);
  return cards;
}

const sql = (value) => (value === null ? "null" : `'${String(value).replaceAll("'", "''")}'`);
const json = (value) => `${sql(JSON.stringify(value))}::jsonb`;

const allIds = [
  ...new Set([
    ...ENTRIES.map(([id]) => id),
    ...LISTS.flatMap((list) => list.ids),
    ...REVIEWS.map(([id]) => id),
  ]),
];
const cards = await fetchCards(allIds);

const entryRows = ENTRIES.map(([id, status, progress, score, favorite, daysAgo]) => {
  const card = cards.get(id);
  const watched = progress ?? card.episodes ?? 0;
  return `    (demo_uid, ${id}, ${sql(status)}, ${watched}, ${score ?? "null"}, ${favorite}, ${json(card)}, now() - interval '${daysAgo} days')`;
}).join(",\n");

const listBlocks = LISTS.map((list, index) => {
  const items = list.ids
    .map(
      (id, position) =>
        `      (new_list_id, ${id}, ${json(cards.get(id))}, now() - interval '${index * 3 + position} hours')`,
    )
    .join(",\n");
  return `  insert into public.geek_hub_lists (user_id, title, description, is_public)
  values (demo_uid, ${sql(list.title)}, ${sql(list.description)}, ${list.isPublic})
  returning id into new_list_id;

  insert into public.geek_hub_list_items (list_id, anime_id, anime, added_at)
  values
${items};`;
}).join("\n\n");

const reviewRows = REVIEWS.map(
  ([id, score, spoilers, body], index) =>
    `    (demo_uid, ${id}, ${score}, ${sql(body)}, ${spoilers}, now() - interval '${index * 4 + 1} days', now() - interval '${index * 4 + 1} days')`,
).join(",\n");

const output = `-- Демо-акаунт GeekHub для відвідувачів портфоліо — щоб оцінити проєкт без
-- реєстрації. ЗГЕНЕРОВАНО supabase/generate-demo.mjs (npm run demo:generate),
-- не редагувати вручну.
--
--   Email:    ${DEMO_EMAIL}
--   Password: ${DEMO_PASSWORD}
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
  demo_email text := ${sql(DEMO_EMAIL)};
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
    demo_email, extensions.crypt(${sql(DEMO_PASSWORD)}, extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(),
    '', '', '', ''
  where not exists (select 1 from auth.users u where u.email = demo_email);

  select id into demo_uid from auth.users where email = demo_email;

  -- Пароль скидаємо щоразу — якщо хтось його змінив, вітрина знову відкрита.
  update auth.users
     set encrypted_password = extensions.crypt(${sql(DEMO_PASSWORD)}, extensions.gen_salt('bf'))
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
    demo_uid, ${sql(DEMO_USERNAME)}, 'Demo Otaku',
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
${entryRows};

  -- ---------------------------------------------------------------------------
  -- Списки
  -- ---------------------------------------------------------------------------
${listBlocks}

  -- ---------------------------------------------------------------------------
  -- Відгуки
  -- ---------------------------------------------------------------------------
  insert into public.geek_hub_reviews (user_id, anime_id, score, body, has_spoilers, created_at, updated_at)
  values
${reviewRows};
end $$;
`;

const target = fileURLToPath(new URL("./demo-account.sql", import.meta.url));
writeFileSync(target, output);
console.log(
  `Wrote ${target}: ${ENTRIES.length} entries, ${LISTS.length} lists, ${REVIEWS.length} reviews.`,
);
