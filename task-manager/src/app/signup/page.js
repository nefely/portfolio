import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import { signup } from "@/lib/auth/actions";

export const metadata = { title: "Sign up — Task Manager" };

export default function SignupPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/80 p-8 shadow-xl shadow-indigo-100 backdrop-blur">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-fuchsia-500 to-indigo-500 text-2xl shadow-lg shadow-fuchsia-200">
            ✨
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create an account</h1>
          <p className="mt-1 text-sm text-slate-500">
            Get your first task board in a few seconds.
          </p>
        </div>

        <AuthForm action={signup} mode="signup" />

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
