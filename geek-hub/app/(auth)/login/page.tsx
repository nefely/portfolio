import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    // AuthForm читає ?next= через useSearchParams — без Suspense вся сторінка
    // стала б клієнтським рендером.
    <Suspense>
      <AuthForm mode="login" />
    </Suspense>
  );
}
