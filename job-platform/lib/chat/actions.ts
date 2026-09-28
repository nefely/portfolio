"use server";

import { requireProfile } from "@/lib/auth/dal";
import { isUuid } from "@/lib/isUuid";
import { createClient } from "@/lib/supabase/server";
import { normalizeMessageBody, validateMessageBody } from "@/lib/validation/message";
import type { ChatActionError, ChatMessage, ChatTarget } from "@/types/chat";
import { MESSAGE_COLUMNS, mapMessageRow } from "./mapMessageRow";

type Supabase = Awaited<ReturnType<typeof createClient>>;

const UNIQUE_VIOLATION = "23505";

function isChatTarget(value: unknown): value is ChatTarget {
  if (typeof value !== "object" || value === null) return false;
  const target = value as Record<string, unknown>;
  if (target.kind === "candidate") return typeof target.slug === "string";
  if (target.kind === "job") return typeof target.id === "string" && isUuid(target.id);
  return false;
}

// Власник профілю кандидата чи компанії, що розмістила вакансію. Seed-рядки
// каталогу (user_id = null) і партнерські вакансії акаунта не мають.
async function resolveTargetUserId(
  supabase: Supabase,
  target: ChatTarget,
): Promise<{ error: "failed" } | { userId: string | null }> {
  if (target.kind === "candidate") {
    const { data, error } = await supabase
      .from("job_platform_candidates")
      .select("user_id")
      .eq("slug", target.slug)
      .maybeSingle();
    if (error) return { error: "failed" as const };
    return { userId: (data?.user_id as string | null) ?? null };
  }

  const { data, error } = await supabase
    .from("job_platform_jobs")
    .select("job_platform_employers(user_id)")
    .eq("id", target.id)
    .maybeSingle();
  if (error) return { error: "failed" as const };
  const employer = data?.job_platform_employers as unknown as { user_id: string | null } | null;
  return { userId: employer?.user_id ?? null };
}

export type StartConversationResult =
  { ok: true; id: string } | { ok: false; error: ChatActionError };

// Повертає наявну розмову з цією людиною або створює нову.
export async function startConversation(target: ChatTarget): Promise<StartConversationResult> {
  const { user } = await requireProfile("/account/messages");
  if (!isChatTarget(target)) return { ok: false, error: "invalid" };

  const supabase = await createClient();
  const resolved = await resolveTargetUserId(supabase, target);
  if ("error" in resolved) return { ok: false, error: resolved.error };
  if (!resolved.userId) return { ok: false, error: "notFound" };
  if (resolved.userId === user.id) return { ok: false, error: "self" };

  // Фіксований порядок пари — див. job_platform_conversations_pair_order.
  const [userA, userB] = [user.id, resolved.userId].sort();

  const findExisting = () =>
    supabase
      .from("job_platform_conversations")
      .select("id")
      .eq("user_a", userA)
      .eq("user_b", userB)
      .maybeSingle();

  const existing = await findExisting();
  if (existing.error) return { ok: false, error: "failed" };
  if (existing.data) return { ok: true, id: existing.data.id };

  const created = await supabase
    .from("job_platform_conversations")
    .insert({ user_a: userA, user_b: userB })
    .select("id")
    .single();

  if (!created.error) return { ok: true, id: created.data.id };

  // Обидва написали одне одному одночасно — розмову вже створив інший запит.
  if (created.error.code === UNIQUE_VIOLATION) {
    const retry = await findExisting();
    if (retry.data) return { ok: true, id: retry.data.id };
  }
  return { ok: false, error: "failed" };
}

export type SendMessageResult =
  | { ok: true; message: ChatMessage }
  | { ok: false; error: ChatActionError | "messageEmpty" | "messageTooLong" };

export async function sendMessage(
  conversationId: string,
  body: string,
): Promise<SendMessageResult> {
  const { user } = await requireProfile("/account/messages");
  if (typeof conversationId !== "string" || !isUuid(conversationId) || typeof body !== "string") {
    return { ok: false, error: "invalid" };
  }

  const bodyError = validateMessageBody(body);
  if (bodyError) return { ok: false, error: bodyError };

  // RLS пропустить insert лише учаснику розмови (див. schema.sql).
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job_platform_messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      body: normalizeMessageBody(body),
    })
    .select(MESSAGE_COLUMNS)
    .single();

  if (error) return { ok: false, error: "failed" };
  return { ok: true, message: mapMessageRow(data) };
}

export async function markConversationRead(conversationId: string): Promise<{ ok: boolean }> {
  await requireProfile("/account/messages");
  if (typeof conversationId !== "string" || !isUuid(conversationId)) return { ok: false };

  const supabase = await createClient();
  const { error } = await supabase.rpc("job_platform_mark_conversation_read", {
    conversation: conversationId,
  });
  return { ok: !error };
}
