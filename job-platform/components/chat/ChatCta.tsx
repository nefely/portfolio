import { getLocale, getTranslations } from "next-intl/server";
import { primaryButtonClassName } from "@/components/shared/formStyles";
import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth/dal";
import type { ChatTarget } from "@/types/chat";
import { StartChatButton } from "./StartChatButton";

interface ChatCtaProps {
  target: ChatTarget;
  // Власник профілю/вакансії — щоб не пропонувати написати самому собі.
  targetUserId: string;
  title: string;
  subtitle: string;
  buttonLabel: string;
  // Куди повернутися після входу (шлях без локалі), напр. "/jobs/<id>".
  returnPath: string;
}

// Блок "Написати" під профілем кандидата / вакансією роботодавця з акаунтом.
export async function ChatCta({
  target,
  targetUserId,
  title,
  subtitle,
  buttonLabel,
  returnPath,
}: ChatCtaProps) {
  const viewer = await getCurrentUser();
  if (viewer?.id === targetUserId) return null;

  const t = await getTranslations("chat");
  const locale = await getLocale();

  return (
    <div className="mt-10 border-t border-gray-200 pt-8 dark:border-gray-800">
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      <p className="mt-1 text-gray-600 dark:text-gray-300">{subtitle}</p>
      <div className="mt-6">
        {viewer ? (
          <StartChatButton target={target} label={buttonLabel} />
        ) : (
          <Link
            href={{ pathname: "/login", query: { next: `/${locale}${returnPath}` } }}
            className={`${primaryButtonClassName} inline-block`}
          >
            {t("loginToMessage")}
          </Link>
        )}
      </div>
    </div>
  );
}
