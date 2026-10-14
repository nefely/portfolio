import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PersonRef } from "@/types/crm";

const SIZES = {
  xs: "size-5 text-[9px]",
  sm: "size-6 text-[10px]",
  md: "size-8 text-xs",
  lg: "size-10 text-sm",
} as const;

// Без <img>: аватар — ініціали на кольорі з профілю (funnelo_profiles.avatar_color).
export function PersonAvatar({
  person,
  size = "sm",
  className,
}: {
  person: PersonRef | undefined | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <span
      title={person?.full_name ?? "Unassigned"}
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-full font-semibold text-white select-none",
        SIZES[size],
        !person && "bg-muted text-muted-foreground",
        className,
      )}
      style={person ? { backgroundColor: person.avatar_color } : undefined}
    >
      {person ? initials(person.full_name) : "?"}
    </span>
  );
}

export function PersonLabel({
  person,
  size = "sm",
}: {
  person: PersonRef | undefined | null;
  size?: "xs" | "sm";
}) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <PersonAvatar person={person} size={size} />
      <span className="truncate">{person?.full_name ?? "Unassigned"}</span>
    </span>
  );
}
