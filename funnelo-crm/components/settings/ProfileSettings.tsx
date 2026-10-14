"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DetailCard } from "@/components/crm/DetailBits";
import { FormField, formText } from "@/components/crm/FormField";
import { PageHeader } from "@/components/crm/PageHeader";
import { PersonAvatar } from "@/components/crm/PersonAvatar";
import { useMe } from "@/components/providers/MeProvider";
import { useCrmMutation } from "@/hooks/useCrmMutation";
import { updateMyProfile } from "@/lib/data/team";
import { cn } from "@/lib/utils";

const COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#0ea5e9",
  "#ec4899",
  "#14b8a6",
];

export function ProfileSettings() {
  const me = useMe();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [color, setColor] = useState(me.avatar_color);
  const [name, setName] = useState(me.full_name);
  const [error, setError] = useState<string | null>(null);

  const save = useCrmMutation({
    mutationFn: (db, patch: { full_name: string; title: string | null; avatar_color: string }) =>
      updateMyProfile(db, me.user_id, patch),
    entity: "team",
    success: "Profile saved",
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const fullName = formText(form, "full_name");
    if (!fullName) return setError("Your name is required.");
    setError(null);
    save.mutate(
      { full_name: fullName, title: formText(form, "title"), avatar_color: color },
      // Профіль у шапці приходить із серверного layout — перечитуємо його.
      { onSuccess: () => router.refresh() },
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Settings" description="Your profile and preferences." />

      <DetailCard title="Profile">
        <form onSubmit={handleSubmit} noValidate className="grid gap-4 py-1">
          <div className="flex items-center gap-4">
            <PersonAvatar
              person={{ user_id: me.user_id, full_name: name || "?", avatar_color: color }}
              size="lg"
            />
            <div className="space-y-1">
              <p className="text-sm font-medium">Avatar color</p>
              <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Avatar color">
                {COLORS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    role="radio"
                    aria-checked={color === item}
                    aria-label={item}
                    onClick={() => setColor(item)}
                    className={cn(
                      "size-6 rounded-full ring-offset-2 ring-offset-card transition-shadow",
                      color === item && "ring-2 ring-foreground/60",
                    )}
                    style={{ backgroundColor: item }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Full name" htmlFor="full_name" error={error ?? undefined} required>
              <Input
                id="full_name"
                name="full_name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={80}
              />
            </FormField>
            <FormField label="Job title" htmlFor="title">
              <Input id="title" name="title" defaultValue={me.title ?? ""} maxLength={80} />
            </FormField>
          </div>

          <FormField label="Email" htmlFor="email" hint="Used to sign in. Can't be changed here.">
            <Input id="email" value={me.email} disabled />
          </FormField>

          <div className="flex items-center justify-between gap-3 border-t pt-4">
            <span className="text-xs text-muted-foreground">
              Role: <span className="font-medium text-foreground capitalize">{me.role}</span>
            </span>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save profile"}
            </Button>
          </div>
        </form>
      </DetailCard>

      <DetailCard title="Appearance">
        <div className="grid grid-cols-3 gap-2 py-1">
          {[
            { value: "light", label: "Light", icon: Sun },
            { value: "dark", label: "Dark", icon: Moon },
            { value: "system", label: "System", icon: Monitor },
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-lg border py-3 text-sm transition-colors",
                // theme невідомий до гідратації — підсвітка з'явиться після неї.
                theme === value ? "border-primary bg-primary/5" : "hover:bg-muted",
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>
      </DetailCard>
    </div>
  );
}
