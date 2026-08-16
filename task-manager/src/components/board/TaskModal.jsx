"use client";

import { useEffect, useState } from "react";
import { Trash2, X } from "lucide-react";

export default function TaskModal({ task, profiles, columns, onClose, onSave, onDelete }) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [assignedTo, setAssignedTo] = useState(task.assigned_to ?? "");
  const [columnId, setColumnId] = useState(task.column_id);
  const [priority, setPriority] = useState(task.priority ?? "medium");
  const [saving, setSaving] = useState(false);

  const createdBy = profiles?.find((p) => p.id === task.user_id)?.email ?? "Unknown";
  const sortedColumns = [...(columns ?? [])].sort((a, b) => a.position - b.position);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

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
        className="animate-pop-in w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
      >
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

        <div className="mt-5 flex items-center justify-between">
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
