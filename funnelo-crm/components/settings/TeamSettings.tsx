"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/crm/PageHeader";
import { PersonAvatar } from "@/components/crm/PersonAvatar";
import { SimpleSelect } from "@/components/crm/SimpleSelect";
import { TableShell, Td, Th } from "@/components/crm/DataTable";
import { useMe } from "@/components/providers/MeProvider";
import { useCrmMutation } from "@/hooks/useCrmMutation";
import { useTeam } from "@/hooks/useTeam";
import { updateMemberAccess } from "@/lib/data/team";
import { formatDate } from "@/lib/format";
import type { Role } from "@/types/crm";

export function TeamSettings() {
  const me = useMe();
  const { data: team, isPending } = useTeam();

  const update = useCrmMutation({
    mutationFn: (
      db,
      { userId, patch }: { userId: string; patch: Partial<{ role: Role; is_active: boolean }> },
    ) => updateMemberAccess(db, userId, patch),
    entity: "team",
    success: (member) => `${member.full_name} updated`,
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Team"
        description="Everyone who signs in to Funnelo joins as a user. Promote admins or turn off access here."
      />

      <TableShell>
        <thead>
          <tr>
            <Th>Member</Th>
            <Th className="hidden md:table-cell">Title</Th>
            <Th className="hidden sm:table-cell">Joined</Th>
            <Th>Role</Th>
            <Th className="text-right">Access</Th>
          </tr>
        </thead>
        <tbody>
          {isPending
            ? Array.from({ length: 5 }, (_, index) => (
                <tr key={index}>
                  <Td colSpan={5}>
                    <Skeleton className="h-6" />
                  </Td>
                </tr>
              ))
            : team?.map((member) => {
                const self = member.user_id === me.user_id;
                const busy = update.isPending && update.variables?.userId === member.user_id;
                return (
                  <tr key={member.user_id} className={member.is_active ? undefined : "opacity-60"}>
                    <Td>
                      <div className="flex items-center gap-3">
                        <PersonAvatar person={member} size="md" />
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {member.full_name}
                            {self && (
                              <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                                (you)
                              </span>
                            )}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    </Td>
                    <Td className="hidden text-muted-foreground md:table-cell">
                      {member.title ?? "—"}
                    </Td>
                    <Td className="hidden whitespace-nowrap text-muted-foreground sm:table-cell">
                      {formatDate(member.created_at)}
                    </Td>
                    <Td>
                      {/* Собі роль змінити не можна (так само забороняє тригер у БД) —
                          інакше можна лишити команду без жодного admin. */}
                      <SimpleSelect
                        value={member.role}
                        onChange={(role) =>
                          update.mutate({ userId: member.user_id, patch: { role: role as Role } })
                        }
                        options={[
                          { value: "admin", label: "Admin" },
                          { value: "user", label: "User" },
                        ]}
                        placeholder="Role"
                        size="sm"
                        className="w-24"
                        disabled={self || busy}
                      />
                    </Td>
                    <Td className="text-right">
                      <Switch
                        checked={member.is_active}
                        disabled={self || busy}
                        onCheckedChange={(active) =>
                          update.mutate({ userId: member.user_id, patch: { is_active: active } })
                        }
                        aria-label={
                          member.is_active
                            ? `Disable ${member.full_name}`
                            : `Enable ${member.full_name}`
                        }
                      />
                    </Td>
                  </tr>
                );
              })}
        </tbody>
      </TableShell>
    </div>
  );
}
