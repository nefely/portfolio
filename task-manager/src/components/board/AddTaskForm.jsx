"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

export default function AddTaskForm({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [pending, setPending] = useState(false);

  function close() {
    setOpen(false);
    setTitle("");
  }

  async function submit(e) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || pending) return;
    setPending(true);
    await onAdd(trimmed);
    setPending(false);
    setTitle("");
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-1.5 rounded-xl px-2 py-2 text-sm font-medium text-slate-400 transition hover:bg-white/60 hover:text-slate-600"
      >
        <Plus size={16} />
        Add task
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <textarea
        autoFocus
        rows={2}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit(e);
          }
          if (e.key === "Escape") close();
        }}
        placeholder="Task title…"
        className="w-full resize-none rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none focus:ring-4 focus:ring-indigo-100"
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending || !title.trim()}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:opacity-50"
        >
          Add
        </button>
        <button
          type="button"
          onClick={close}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Cancel"
        >
          <X size={16} />
        </button>
      </div>
    </form>
  );
}
