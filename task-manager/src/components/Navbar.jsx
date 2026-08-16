import { logout } from "@/lib/auth/actions";

export default function Navbar({ email }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-white/70 backdrop-blur">
      <div className="mx-auto flex items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-500 text-lg shadow-md shadow-indigo-200">
            🗂️
          </span>
          <span className="text-lg font-bold text-slate-900">Task Manager</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-500 sm:inline">{email}</span>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
