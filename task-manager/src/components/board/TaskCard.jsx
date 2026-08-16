"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

const PRIORITY_DOT = {
  high: "bg-rose-500",
  medium: "bg-amber-400",
  low: "bg-slate-300",
};

const PRIORITY_LABEL = {
  high: "High priority",
  medium: "Medium priority",
  low: "Low priority",
};

export default function TaskCard({ task, color, assignee, onOpen }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: "Task", task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    borderLeftColor: color,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onOpen}
      className={`group flex cursor-pointer items-start gap-2 rounded-xl border border-l-4 border-slate-100 bg-white px-3 py-2.5 shadow-sm transition hover:shadow-md ${
        isDragging ? "opacity-30" : ""
      }`}
    >
      <span
        {...attributes}
        {...listeners}
        className="mt-0.5 shrink-0 cursor-grab touch-none text-slate-200 transition group-hover:text-slate-400 active:cursor-grabbing"
        aria-label="Drag task"
      >
        <GripVertical size={15} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span
            title={PRIORITY_LABEL[task.priority] ?? PRIORITY_LABEL.medium}
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${PRIORITY_DOT[task.priority] ?? PRIORITY_DOT.medium}`}
          />
          <p className="truncate text-sm font-medium text-slate-800">{task.title}</p>
        </div>
        {task.description ? (
          <p className="mt-0.5 line-clamp-2 text-xs text-slate-400">{task.description}</p>
        ) : null}
      </div>

      {assignee && (
        <span
          title={`Assigned to ${assignee.email}`}
          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-semibold text-indigo-600"
        >
          {assignee.email[0].toUpperCase()}
        </span>
      )}
    </div>
  );
}

// A non-interactive visual clone rendered inside <DragOverlay>. It must NOT
// call useSortable — the real card (above) keeps that hook and its `id`;
// this is purely the floating preview that follows the pointer.
export function TaskCardGhost({ task, color }) {
  return (
    <div
      className="flex w-72 rotate-2 items-start gap-2 rounded-xl border border-l-4 border-slate-100 bg-white px-3 py-2.5 shadow-2xl"
      style={{ borderLeftColor: color }}
    >
      <GripVertical size={15} className="mt-0.5 shrink-0 text-slate-300" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800">{task.title}</p>
        {task.description ? (
          <p className="mt-0.5 line-clamp-2 text-xs text-slate-400">{task.description}</p>
        ) : null}
      </div>
    </div>
  );
}
