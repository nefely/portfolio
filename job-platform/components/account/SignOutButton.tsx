import { signOut } from "@/lib/auth/actions";

// Звичайна <form> з server action: працює навіть до гідратації JS.
export function SignOutButton({ label }: { label: string }) {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-900"
      >
        {label}
      </button>
    </form>
  );
}
