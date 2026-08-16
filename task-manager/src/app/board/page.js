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

  const [{ data: columns, error: columnsError }, { data: tasks, error: tasksError }] =
    await Promise.all([
      supabase.from("columns").select("*").eq("user_id", user.id).order("position"),
      supabase.from("tasks").select("*").eq("user_id", user.id).order("position"),
    ]);

  if (columnsError) console.error(columnsError);
  if (tasksError) console.error(tasksError);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar email={user.email} />
      <Board initialColumns={columns ?? []} initialTasks={tasks ?? []} userId={user.id} />
    </div>
  );
}
