import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Board from "@/components/board/Board";

// This page reads the freshly-refreshed auth cookie on every request, so it
// must never be statically cached.
export const dynamic = "force-dynamic";
export const metadata = { title: "Board — Task Manager" };

export default async function BoardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // This is a shared board — everyone signed in sees the same columns and
  // tasks, so none of these are scoped to the current user.
  const [
    { data: columns, error: columnsError },
    { data: tasks, error: tasksError },
    { data: profiles, error: profilesError },
  ] = await Promise.all([
    supabase.from("columns").select("*").order("position"),
    supabase.from("tasks").select("*").order("position"),
    supabase.from("profiles").select("id, email").order("email"),
  ]);

  if (columnsError) console.error(columnsError);
  if (tasksError) console.error(tasksError);
  if (profilesError) console.error(profilesError);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar email={user.email} />
      <Board
        initialColumns={columns ?? []}
        initialTasks={tasks ?? []}
        profiles={profiles ?? []}
        userId={user.id}
      />
    </div>
  );
}
