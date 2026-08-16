"use client";

import { useMemo, useState } from "react";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Palette, Trash2 } from "lucide-react";
import TaskCard from "./TaskCard";
import AddTaskForm from "./AddTaskForm";
import ColorPicker from "./ColorPicker";

export default function Column({ column, tasks, onRename, onRecolor, onDelete, onAddTask, onOpenTask }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: { type: "Column", column },
  });

  const style = { transform: CSS.Transform.toString(transform), transition };

  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(column.name);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

  function commitName() {
    setEditingName(false);
    const trimmed = name.trim();
    if (trimmed && trimmed !== column.name) onRename(column.id, trimmed);
    else setName(column.name);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex h-full max-h-[calc(100vh-8.5rem)] w-72 shrink-0 flex-col rounded-2xl border border-white/60 bg-white/70 shadow-sm backdrop-blur transition ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <div
        className="flex items-center gap-1.5 rounded-t-2xl px-3 py-3"
        style={{ borderTop: `3px solid ${column.color}` }}
      >
        <span
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-slate-300 hover:text-slate-500 active:cursor-grabbing"
          aria-label="Drag column"
        >
          <GripVertical size={16} />
        </span>

        {editingName ? (
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitName();
              }
              if (e.key === "Escape") {
                setName(column.name);
                setEditingName(false);
              }
            }}
            className="min-w-0 flex-1 rounded-md border border-indigo-200 bg-white px-1.5 py-0.5 text-sm font-semibold text-slate-800 outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditingName(true)}
            className="min-w-0 flex-1 truncate text-left text-sm font-semibold text-slate-800"
            title="Click to rename"
          >
            {column.name}
          </button>
        )}

        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
          {tasks.length}
        </span>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowColorPicker((v) => !v)}
            style={{ color: column.color }}
            className="rounded-md p-1 hover:bg-slate-100"
            aria-label="Change color"
          >
            <Palette size={15} />
          </button>
          {showColorPicker && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowColorPicker(false)} />
              <div className="animate-pop-in absolute right-0 top-8 z-20 rounded-xl border border-slate-100 bg-white p-2 shadow-xl">
                <ColorPicker
                  value={column.color}
                  onChange={(color) => {
                    onRecolor(column.id, color);
                    setShowColorPicker(false);
                  }}
                />
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            if (window.confirm(`Delete column "${column.name}" along with all its tasks?`)) {
              onDelete(column.id);
            }
          }}
          className="shrink-0 rounded-md p-1 text-slate-300 hover:bg-rose-50 hover:text-rose-500"
          aria-label="Delete column"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="thin-scrollbar flex-1 space-y-2 overflow-y-auto px-3 pb-2">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} color={column.color} onOpen={() => onOpenTask(task)} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-200 px-3 py-6 text-center text-xs text-slate-400">
            No tasks
          </p>
        )}
      </div>

      <div className="p-3 pt-1">
        <AddTaskForm onAdd={(title) => onAddTask(column.id, title)} />
      </div>
    </div>
  );
}
