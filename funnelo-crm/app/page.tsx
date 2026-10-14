import { redirect } from "next/navigation";

// Гостей на /login відправляє proxy.ts, тож сюди доходять лише залогінені.
export default function Home() {
  redirect("/dashboard");
}
