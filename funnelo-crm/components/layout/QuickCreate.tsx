"use client";

import { useState } from "react";
import { Building2, CalendarPlus, KanbanSquare, Plus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ActivityFormDialog } from "@/components/activities/ActivityFormDialog";
import { CompanyFormDialog } from "@/components/companies/CompanyFormDialog";
import { ContactFormDialog } from "@/components/contacts/ContactFormDialog";
import { DealFormDialog } from "@/components/deals/DealFormDialog";

type Kind = "deal" | "company" | "contact" | "activity";

/** Кнопка "New" у верхній панелі: створити будь-що з будь-якої сторінки. */
export function QuickCreate() {
  const [open, setOpen] = useState<Kind | null>(null);
  const dialogProps = (kind: Kind) => ({
    open: open === kind,
    onOpenChange: (next: boolean) => setOpen(next ? kind : null),
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="sm" />}>
          <Plus /> New
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={() => setOpen("deal")}>
            <KanbanSquare /> Deal
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen("company")}>
            <Building2 /> Company
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen("contact")}>
            <UserPlus /> Contact
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen("activity")}>
            <CalendarPlus /> Activity
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DealFormDialog {...dialogProps("deal")} />
      <CompanyFormDialog {...dialogProps("company")} />
      <ContactFormDialog {...dialogProps("contact")} />
      <ActivityFormDialog {...dialogProps("activity")} />
    </>
  );
}
