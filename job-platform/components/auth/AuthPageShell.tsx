import type { ReactNode } from "react";

interface AuthPageShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthPageShell({ title, subtitle, children, footer }: AuthPageShellProps) {
  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-300">{subtitle}</p>
      <div className="mt-8 rounded-2xl border border-gray-200 p-6 sm:p-8 dark:border-gray-800 dark:bg-gray-950/70">
        {children}
      </div>
      {footer && (
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">{footer}</p>
      )}
    </div>
  );
}
