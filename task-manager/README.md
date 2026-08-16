# Task Manager

A Trello-style Kanban task manager: email/password authentication, user-defined status columns, and drag-and-drop for both tasks and columns. Built with Next.js (App Router) + Tailwind CSS on the frontend and Supabase (Postgres + Auth + Row Level Security) as the backend.

## Features

- 📧 Email/password sign up & login (Supabase Auth)
- 🗂️ A personal board per user, seeded automatically with three starter columns (To Do / In Progress / Done)
- ➕ Any number of status columns: add, rename, recolor, delete
- 🖱️ Drag-and-drop for tasks — between columns and within a column — and for columns themselves ([@dnd-kit](https://dndkit.com/))
- ✏️ Task cards with a description, editable/deletable via a modal
- 🔒 Row Level Security in Postgres — every user can only ever see and edit their own data
- 🎨 A bright, colorful UI built with Tailwind CSS

## Tech stack

| Layer         | Technology                                    |
| ------------- | ---------------------------------------------- |
| Frontend      | Next.js 16 (App Router), React 19               |
| Styling       | Tailwind CSS v4                                 |
| Drag & drop   | @dnd-kit/core, @dnd-kit/sortable                 |
| Backend       | Supabase (Postgres, Auth, Row Level Security)    |
| Icons         | lucide-react                                     |

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your Supabase project's details (Dashboard → Project Settings → API):

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
```

> `.env.local` is already filled in with this Supabase project's real keys for local development — the file is git-ignored (see `.gitignore`) and will never be committed.

### 3. Create the database schema

Open the Supabase Dashboard → **SQL Editor** → **New query**, paste in the contents of [`supabase/schema.sql`](./supabase/schema.sql), and hit **Run**.

This creates:

- the `columns` and `tasks` tables, both with Row Level Security (every row is owned by a `user_id`);
- a trigger that automatically gives every new user three starter columns on signup.

**This is the one step I can't do for you** — I only have your project's API keys (anon/service_role), not a direct database connection or a Management API token, so I can't run schema-creating SQL myself. Everything else in the app is ready to go once this file has been run.

### 4. (Optional) Seed some demo tasks

Once you've signed up in the app at least once (so your starter columns exist), you can run [`supabase/seed.sql`](./supabase/seed.sql) in the SQL Editor to fill your board with a handful of sample tasks — useful for portfolio screenshots. It looks up your account by email (edit the address at the top of the file if needed) and is safe to re-run.

### 5. Configure Auth URLs (for the email confirmation link)

In the Supabase Dashboard → **Authentication → URL Configuration**:

- **Site URL**: `http://localhost:3000` (swap for your production domain once deployed)
- **Redirect URLs**: add `http://localhost:3000/**` (and your production domain)

This project has "Confirm email" enabled by default, so after signing up a user has to click the link in their inbox before they can log in. For a smoother demo, you can turn that off under **Authentication → Sign In / Providers → Email**.

### 6. Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
  proxy.js                 # Refreshes the Supabase session and protects /board (Next 16 renamed middleware → proxy)
  lib/
    supabase/
      client.js             # Supabase client for the browser (Client Components)
      server.js              # Supabase client for Server Components / Server Actions
      proxy.js               # Session-refresh logic called by src/proxy.js
    auth/actions.js          # Server Actions: login / signup / logout
    positioning.js           # Fractional-indexing helper for drag-and-drop
  app/
    login/, signup/          # Auth pages
    auth/confirm/route.js    # Handles the email-confirmation link
    board/page.js             # Protected board page (Server Component, fetches data)
  components/
    board/                   # Board, Column, TaskCard, modals, add-forms
    AuthForm.jsx, Navbar.jsx, SessionListener.jsx
supabase/
  schema.sql                 # Tables, RLS policies, starter-columns trigger
```

## How the drag-and-drop works

Every card and column has a numeric `position` (double precision). When something is dragged, its new position is computed as the average of its two neighbours (`src/lib/positioning.js`) — a classic "fractional indexing" trick that lets you insert an item between two others by writing **only that one row**, instead of re-numbering the whole column/board on every move.

## Security

- Data access is controlled entirely by **Row Level Security** in Postgres (`auth.uid() = user_id`) — the frontend only ever talks to Supabase with the `anon` key.
- The `service_role` key (which bypasses RLS completely) is never used anywhere in the app and never reaches the browser — it only sits in `.env.local` for reference, in case you want a local admin script later.

## Possible next steps

- Real-time sync across tabs/devices via Supabase Realtime
- Task labels/priorities, due dates, search and filtering
- Multiple boards per user
- Google/GitHub OAuth login
