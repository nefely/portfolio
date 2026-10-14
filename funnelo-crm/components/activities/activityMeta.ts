import { CalendarDays, CheckSquare, Mail, Phone, StickyNote, type LucideIcon } from "lucide-react";
import type { ActivityType } from "@/types/crm";

export const ACTIVITY_META: Record<
  ActivityType,
  { label: string; icon: LucideIcon; tone: string }
> = {
  call: { label: "Call", icon: Phone, tone: "text-sky-600 bg-sky-500/10 dark:text-sky-400" },
  email: {
    label: "Email",
    icon: Mail,
    tone: "text-violet-600 bg-violet-500/10 dark:text-violet-400",
  },
  meeting: {
    label: "Meeting",
    icon: CalendarDays,
    tone: "text-amber-600 bg-amber-500/10 dark:text-amber-400",
  },
  task: {
    label: "Task",
    icon: CheckSquare,
    tone: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400",
  },
  note: {
    label: "Note",
    icon: StickyNote,
    tone: "text-slate-600 bg-slate-500/10 dark:text-slate-300",
  },
};
