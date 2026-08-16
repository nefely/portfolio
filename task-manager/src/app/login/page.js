import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import { login } from "@/lib/auth/actions";

export const metadata = { title: "Log in — Task Manager" };

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const linkError = typeof params?.error === "string" ? params.error : null;

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/80 p-8 shadow-xl shadow-indigo-100 backdrop-blur">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-violet-500 text-2xl shadow-lg shadow-indigo-200">
            🗂️
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">
            Log in to see your task board.
          </p>
        </div>

        {linkError && (
          <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
            {linkError}
          </p>
        )}

        <AuthForm action={login} mode="login" />

        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
