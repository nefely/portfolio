"use client";

import { useQuery } from "@tanstack/react-query";
import { stagesOptions, teamOptions } from "@/lib/query/options";
import type { Profile, Stage } from "@/types/crm";

// select-функції визначені поза хуками: стабільне посилання → TanStack
// мемоізує результат і не будує Map заново на кожен рендер.
const toTeamMap = (team: Profile[]) => new Map(team.map((member) => [member.user_id, member]));
const toStageMap = (stages: Stage[]) => new Map(stages.map((stage) => [stage.id, stage]));
const onlyOpen = (stages: Stage[]) => stages.filter((stage) => stage.kind === "open");

export function useTeam() {
  return useQuery(teamOptions());
}

export function useTeamMap() {
  return useQuery({ ...teamOptions(), select: toTeamMap }).data;
}

export function useStages() {
  return useQuery(stagesOptions());
}

export function useStageMap() {
  return useQuery({ ...stagesOptions(), select: toStageMap }).data;
}

export function useOpenStages() {
  return useQuery({ ...stagesOptions(), select: onlyOpen });
}
