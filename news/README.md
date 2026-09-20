# NewsHub

A news portfolio site — React 19 + TypeScript + Vite + Tailwind CSS 4 + React Router. Content is pulled live from real RSS feeds (via [rss2json.com](https://rss2json.com), which handles the CORS/XML-parsing so no backend is needed), one feed per category.

## Stack

- Vite 8 + React 19 (React Compiler enabled)
- React Router 8 (`createBrowserRouter`, data loaders)
- Tailwind CSS 4
- RSS feeds as the content source — see [`src/lib/feeds.ts`](src/lib/feeds.ts) for the source list and [`src/lib/rss.ts`](src/lib/rss.ts) for the fetching/parsing

## Setup

1. `npm install`
2. `npm run dev`

That's it — no database or API key required. rss2json's free, unauthenticated tier is used by default. If you hit its shared rate limit, get a free key at [rss2json.com](https://rss2json.com) and set `VITE_RSS2JSON_API_KEY` in a `.env.local` file.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — typecheck and build for production
- `npm run lint` — run ESLint
- `npm run preview` — preview the production build locally

## How articles work

RSS only gives a title and a short excerpt, not full article bodies, so article pages show the excerpt and a "Read full article on {source}" link out to the original site — nothing is scraped or republished. The excerpt/image/list data is passed to the article page via router state when you click a card; if you land on an article URL directly (e.g. a page refresh), there's nothing to re-fetch by, so the page falls back to a plain link to the original source instead.

Add or change feeds by editing the `FEEDS` array in [`src/lib/feeds.ts`](src/lib/feeds.ts) — each entry maps one RSS feed to one category.
