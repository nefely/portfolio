import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// The proxy (src/proxy.js) already redirects "/" before this ever renders,
// but keeping the same check here means the app still behaves correctly
// even if this route is ever hit directly (e.g. a matcher change).
export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  redirect(user ? "/board" : "/login");
}
