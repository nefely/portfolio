"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Pencil, Send, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function TaskModal({ task, profiles, columns, userId, onClose, onSave, onDelete }) {
  const supabase = useMemo(() => createClient(), []);

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [assignedTo, setAssignedTo] = useState(task.assigned_to ?? "");
  const [columnId, setColumnId] = useState(task.column_id);
  const [priority, setPriority] = useState(task.priority ?? "medium");
  const [saving, setSaving] = useState(false);

  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingBody, setEditingBody] = useState("");

  const createdBy = profiles?.find((p) => p.id === task.user_id)?.email ?? "Unknown";
  const sortedColumns = [...(columns ?? [])].sort((a, b) => a.position - b.position);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("comments")
      .select("*")
      .eq("task_id", task.id)
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) console.error(error);
        setComments(data ?? []);
        setLoadingComments(false);
      });
    return () => {
      cancelled = true;
    };
  }, [supabase, task.id]);

  async function handlePostComment() {
    const trimmed = newComment.trim();
    if (!trimmed || postingComment) return;
    setPostingComment(true);
    const { data, error } = await supabase
      .from("comments")
      .insert({ task_id: task.id, user_id: userId, body: trimmed })
      .select()
      .single();
    setPostingComment(false);
    if (error || !data) {
      console.error(error);
      return;
    }
    setComments((prev) => [...prev, data]);
    setNewComment("");
  }

  function startEditComment(comment) {
    setEditingCommentId(comment.id);
    setEditingBody(comment.body);
  }

  function cancelEditComment() {
    setEditingCommentId(null);
    setEditingBody("");
  }

  async function saveEditComment(commentId) {
    const trimmed = editingBody.trim();
    if (!trimmed) return;
    const prevComments = comments;
    setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, body: trimmed } : c)));
    setEditingCommentId(null);
    const { error } = await supabase.from("comments").update({ body: trimmed }).eq("id", commentId);
    if (error) {
      console.error(error);
      setComments(prevComments);
    }
  }

  async function deleteComment(commentId) {
    const prevComments = comments;
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    const { error } = await supabase.from("comments").delete().eq("id", commentId);
    if (error) {
      console.error(error);
      setComments(prevComments);
    }
  }

  async function handleSave() {
    const trimmed = title.trim();
    if (!trimmed) return;
    setSaving(true);
    await onSave(task.id, {
      title: trimmed,
      description,
      assigned_to: assignedTo || null,
      column_id: columnId,
      priority,
    });
    setSaving(false);
    onClose();
  }

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-pop-in flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl"
      >
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-transparent px-1 py-1 text-lg font-semibold text-slate-900 outline-none focus:border-indigo-200 focus:ring-4 focus:ring-indigo-100"
          />
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <label className="mb-1 block text-xs font-medium tracking-wide text-slate-400 uppercase">
          Description
        </label>
        <textarea
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more details…"
          className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
        />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="task-status"
              className="mb-1 block text-xs font-medium tracking-wide text-slate-400 uppercase"
            >
              Status
            </label>
            <select
              id="task-status"
              value={columnId}
              onChange={(e) => setColumnId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
            >
              {sortedColumns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="task-priority"
              className="mb-1 block text-xs font-medium tracking-wide text-slate-400 uppercase"
            >
              Priority
            </label>
            <select
              id="task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium tracking-wide text-slate-400 uppercase">
              Created by
            </label>
            <p className="truncate rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">
              {createdBy}
            </p>
          </div>

          <div>
            <label
              htmlFor="assigned-to"
              className="mb-1 block text-xs font-medium tracking-wide text-slate-400 uppercase"
            >
              Assigned to
            </label>
            <select
              id="assigned-to"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
            >
              <option value="">Unassigned</option>
              {profiles?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.email}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-4">
          <label className="mb-2 block text-xs font-medium tracking-wide text-slate-400 uppercase">
            Comments
          </label>

          <div className="space-y-3">
            {loadingComments ? (
              <p className="text-xs text-slate-400">Loading comments…</p>
            ) : comments.length === 0 ? (
              <p className="text-xs text-slate-400">No comments yet.</p>
            ) : (
              comments.map((comment) => {
                const author = profiles?.find((p) => p.id === comment.user_id)?.email ?? "Unknown";
                const isOwn = comment.user_id === userId;
                const isEditing = editingCommentId === comment.id;
                return (
                  <div key={comment.id} className="rounded-lg bg-slate-50 px-3 py-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-xs font-semibold text-slate-600">{author}</span>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-[11px] text-slate-400">
                          {new Date(comment.created_at).toLocaleString()}
                        </span>
                        {isOwn && !isEditing && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => startEditComment(comment)}
                              className="rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                              aria-label="Edit comment"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteComment(comment.id)}
                              className="rounded p-0.5 text-slate-400 hover:bg-rose-100 hover:text-rose-600"
                              aria-label="Delete comment"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="mt-1 flex items-end gap-1.5">
                        <textarea
                          autoFocus
                          rows={2}
                          value={editingBody}
                          onChange={(e) => setEditingBody(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              saveEditComment(comment.id);
                            }
                            if (e.key === "Escape") cancelEditComment();
                          }}
                          className="w-full flex-1 resize-none rounded-lg border border-indigo-200 bg-white px-2 py-1 text-sm text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100"
                        />
                        <button
                          type="button"
                          onClick={() => saveEditComment(comment.id)}
                          disabled={!editingBody.trim()}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white disabled:opacity-50"
                          aria-label="Save comment"
                        >
                          <Check size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditComment}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200"
                          aria-label="Cancel editing"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <p className="mt-0.5 text-sm whitespace-pre-wrap text-slate-700">{comment.body}</p>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-3 flex items-end gap-2">
            <textarea
              rows={2}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handlePostComment();
                }
              }}
              placeholder="Write a comment…"
              className="w-full flex-1 resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
            />
            <button
              type="button"
              onClick={handlePostComment}
              disabled={!newComment.trim() || postingComment}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm transition hover:bg-indigo-500 disabled:opacity-50"
              aria-label="Post comment"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Delete this task?")) {
              onDelete(task.id);
              onClose();
            }
          }}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
        >
          <Trash2 size={15} />
          Delete
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}
