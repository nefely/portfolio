# GeekHub

Anime tracker: browse the whole AniList catalog, track what you watch, build shareable lists and review titles.

**Stack:** Next.js 16 (App Router, React 19, React Compiler) · TypeScript · Tailwind CSS v4 · shadcn/ui (Base UI) · TanStack Query v5 · Supabase (Auth + Postgres + RLS) · Motion · AniList GraphQL API · Vitest

## Features

- **Catalog**: search plus filters for genres, themes, setting and demographic tags, format, airing status, year and season and minimum score, with 7 sort orders. Filters live in the URL, so results are shareable and the back button works. Infinite scroll.
- **Anime page**: synopsis, stats, trailer, characters and voice actors, related titles, streaming links, recommendations.
- **Library**: watching / completed / planned / on hold / dropped, episode progress, score, favorites, stats.
- **Custom lists**: public or private. Public lists get a share link with an OG preview.
- **Reviews**: one per user per anime, with a score and a spoiler flag.
- **Profile settings**: username, display name, bio.

## Demo account

You don't need to register. Use **Try the demo account** on the sign-in page, or sign in with:

- **Email:** `demo@geekhub.test`
- **Password:** `GeekHub-demo-2026`

The demo account already has a library of 18 titles, three custom lists (two public, one private) and a few reviews. Visitors can change anything; running [`supabase/demo-account.sql`](supabase/demo-account.sql) again resets it. The file is generated with real AniList data by `npm run demo:generate`.

## Getting started

```bash
npm install
cp .env.example .env.local   # Supabase keys (shared portfolio project)
npm run dev
```

Before the first run, paste [`supabase/schema.sql`](supabase/schema.sql) into the Supabase SQL Editor. It is safe to re-run. All tables use the `geek_hub_` prefix because the Supabase project is shared with the other portfolio apps. To create the demo account, run [`supabase/demo-account.sql`](supabase/demo-account.sql) afterwards.

| Script                            |                   |
| --------------------------------- | ----------------- |
| `npm run dev` / `build` / `start` | Next.js           |
| `npm run typecheck`               | `tsc --noEmit`    |
| `npm run lint` / `format`         | ESLint / Prettier |
| `npm test`                        | Vitest unit tests |

## Architecture

```
app/                  routes (RSC by default, client islands where needed)
  api/anime/          cached AniList proxy for client-side infinite scroll
components/           UI by feature: anime, catalog, library, lists, reviews…
hooks/                TanStack Query hooks (queries + optimistic mutations)
lib/
  anime/filters.ts    URL ⇄ filters ⇄ AniList variables (single source of truth)
  anilist/            server-only GraphQL client, queries, mappers, dynamic search query builder
  library/            Supabase data access, shared by server and browser
  query/              query keys + queryOptions (the cache contract)
supabase/schema.sql   tables, triggers, RLS policies
```

**Data split.** The anime catalog comes from the [AniList GraphQL API](https://docs.anilist.co) and is never copied into our database. `anime_id` in Supabase is the AniList id. Supabase stores only user data. Library entries and list items keep a small `anime` jsonb snapshot (title, poster, episodes…), so the library and list pages render without calling AniList.

## Performance & caching

The cache has three layers, so each unique AniList request runs roughly once per TTL for all visitors, not once per visitor:

1. **Next.js Data Cache.** GraphQL is POST, so every AniList `fetch` opts in explicitly with `cache: "force-cache"` plus a `revalidate`: 10 min for search and trending, 6 h for title pages, 7 days for genres and tags. Only 200 responses are stored, so errors are never cached.
2. **ISR.** The home page and every anime page are static and regenerate in the background. `/anime/[id]` uses an empty `generateStaticParams`, so each title is cached the first time someone opens it.
3. **TanStack Query.** This is the browser cache. The server prefetches data and hydrates it under the same query keys the client uses, so the client doesn't fetch the same data again after hydration. `staleTime` is tuned per query and `refetchOnWindowFocus` is off.

Avoiding re-renders:

- **React Compiler** (`reactCompiler: true`) memoizes components and callbacks automatically. Explicit `memo` is added only where it pays off on top of that: grid cards, review cards, genre chip groups. TanStack structural sharing keeps object identity stable for unchanged items, so `memo` skips cards that are already rendered when a new page loads.
- **Per-card subscriptions.** `useEntry(animeId)` uses `select`, so changing one title's status re-renders one badge, not the whole grid.
- **Filters update the URL** through the native History API. Next.js syncs `useSearchParams` but doesn't fetch a new RSC payload, so the server doesn't re-render on every filter click.
- **Debounced search** keeps local input state. Typing re-renders only the input. Previous results stay on screen (dimmed) while the next query loads (`keepPreviousData`), and stale requests are aborted via `signal`.
- `useDeferredValue` keeps typing in the library filter responsive with large libraries.
- **Optimistic mutations** with rollback, plus a mutation `scope` so rapid "+1 episode" clicks are applied in order.
- **Session is read on the client**, not in the root layout, so public pages stay static.

Payload and network:

- **Fewer requests with GraphQL.** All four home shelves come from one aliased query, and a title page (details, characters, recommendations) is one query instead of three.
- Each query asks only for the fields it renders. The search query is assembled from only the filters that are set, so equal filters always produce the same request body and cache key.
- Responses are mapped on the server to slim `AnimeCard` objects, and the poster's dominant color is used as a placeholder while the image loads.
- The YouTube trailer is a thumbnail until the user clicks it, which avoids about 1 MB of iframe JS up front.
- Reviews are fetched only when that section scrolls near the viewport.
- `LazyMotion` + `m.*` components load only the `domAnimation` feature set.
- `next/image` uses explicit `sizes`, `priority` only for above-the-fold posters, and the AniList banner (or a tiny blurred poster) for the hero background.
- The AniList client retries 429/5xx with exponential backoff and honors `Retry-After`. If AniList fails, the page degrades to a per-section fallback instead of a crash.
