-- Task Manager — demo seed data
--
-- Run this AFTER:
--   1. supabase/schema.sql has been run, and
--   2. you've signed up at least once in the app (so the on_auth_user_created
--      trigger has created your "To Do / In Progress / Done" columns).
--
-- It fills your existing columns with a handful of realistic sample tasks —
-- handy for portfolio screenshots/demos. Safe to re-run: it skips any task
-- whose title already exists in that column, so it won't create duplicates.

do $$
declare
  target_user_id uuid;
  todo_id uuid;
  inprogress_id uuid;
  done_id uuid;
begin
  -- Change this email if you signed up with a different address.
  select id into target_user_id from auth.users where email = 'nefely123@gmail.com';

  if target_user_id is null then
    raise exception 'No user found with that email — sign up in the app first, then re-run this seed.';
  end if;

  select id into todo_id
    from public.columns where user_id = target_user_id and name = 'To Do' limit 1;
  select id into inprogress_id
    from public.columns where user_id = target_user_id and name = 'In Progress' limit 1;
  select id into done_id
    from public.columns where user_id = target_user_id and name = 'Done' limit 1;

  if todo_id is not null then
    insert into public.tasks (user_id, column_id, title, description, position)
    select target_user_id, todo_id, v.title, v.description, v.position
    from (values
      ('Design the landing page', 'Sketch a hero section and pick a color palette.', 1000::double precision),
      ('Write the project README', 'Document setup steps and environment variables.', 2000),
      ('Set up a CI pipeline', 'Run lint and build checks on every push.', 3000)
    ) as v(title, description, position)
    where not exists (
      select 1 from public.tasks t where t.column_id = todo_id and t.title = v.title
    );
  end if;

  if inprogress_id is not null then
    insert into public.tasks (user_id, column_id, title, description, position)
    select target_user_id, inprogress_id, v.title, v.description, v.position
    from (values
      ('Implement drag-and-drop', 'Wire up dnd-kit for tasks and columns.', 1000::double precision),
      ('Connect Supabase auth', 'Email/password login with session refresh via proxy.js.', 2000)
    ) as v(title, description, position)
    where not exists (
      select 1 from public.tasks t where t.column_id = inprogress_id and t.title = v.title
    );
  end if;

  if done_id is not null then
    insert into public.tasks (user_id, column_id, title, description, position)
    select target_user_id, done_id, v.title, v.description, v.position
    from (values
      ('Initialize the Next.js project', 'App Router, Tailwind CSS v4, ESLint.', 1000::double precision),
      ('Design the database schema', 'columns + tasks tables with Row Level Security.', 2000)
    ) as v(title, description, position)
    where not exists (
      select 1 from public.tasks t where t.column_id = done_id and t.title = v.title
    );
  end if;
end $$;
