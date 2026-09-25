"use client";

import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { signInWithGoogle } from "@/lib/auth/actions";
import { secondaryButtonClassName } from "@/components/shared/formStyles";
import type { AccountRole } from "@/types/account";

interface GoogleButtonProps {
  /** Для реєстрації — роль, обрана вище; для входу не передається. */
  role?: AccountRole | null;
  next?: string;
}

// Окрема <form>, а не кнопка всередині форми email/пароля: інакше валідація
// email/пароля блокувала б вхід через Google.
export function GoogleButton({ role, next }: GoogleButtonProps) {
  return (
    <form action={signInWithGoogle}>
      {role && <input type="hidden" name="role" value={role} />}
      {next && <input type="hidden" name="next" value={next} />}
      <GoogleSubmit />
    </form>
  );
}

function GoogleSubmit() {
  const t = useTranslations("auth");
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${secondaryButtonClassName} flex w-full items-center justify-center gap-3`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.8Z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3.01c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.11A12 12 0 0 0 12 24Z"
        />
        <path
          fill="#FBBC05"
          d="M5.29 14.28A7.2 7.2 0 0 1 4.91 12c0-.79.14-1.56.38-2.28V6.61H1.28a12 12 0 0 0 0 10.78l4.01-3.11Z"
        />
        <path
          fill="#EA4335"
          d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.94 11.94 0 0 0 12 0 12 12 0 0 0 1.28 6.61l4.01 3.11C6.23 6.88 8.88 4.77 12 4.77Z"
        />
      </svg>
      {t("googleButton")}
    </button>
  );
}
