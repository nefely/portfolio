"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

export default function AddColumnForm({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);

  function close() {
    setOpen(false);
    setName("");
  }

  async function submit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || pending) return;
    setPending(true);
    await onAdd(trimmed);
    setPending(false);
    close();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-12 w-72 shrink-0 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/70 text-sm font-medium text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600"
      >
        <Plus size={16} />
        Add column
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="flex h-fit w-72 shrink-0 flex-col gap-2 rounded-2xl border border-white/60 bg-white/80 p-3 shadow-sm"
    >
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && close()}
        placeholder="Column name…"
        className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none focus:ring-4 focus:ring-indigo-100"
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending || !name.trim()}
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
