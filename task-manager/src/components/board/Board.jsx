"use client";

import { useCallback, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { createClient } from "@/lib/supabase/client";
import { positionBetween } from "@/lib/positioning";
import { useToast } from "@/components/ui/Toast";
import Column from "./Column";
import AddColumnForm from "./AddColumnForm";
import TaskModal from "./TaskModal";
import { TaskCardGhost } from "./TaskCard";

const COLUMN_PALETTE = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"];

export default function Board({ initialColumns, initialTasks, userId }) {
  const supabase = useMemo(() => createClient(), []);
  const showToast = useToast();

  const [columns, setColumns] = useState(initialColumns);
  const [tasks, setTasks] = useState(initialTasks);
  const [activeTask, setActiveTask] = useState(null);
  const [activeColumn, setActiveColumn] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const columnIds = useMemo(() => columns.map((c) => c.id), [columns]);

  const sortedColumns = useMemo(
    () => [...columns].sort((a, b) => a.position - b.position),
    [columns]
  );

  const tasksByColumn = useMemo(() => {
    const map = {};
    for (const col of columns) map[col.id] = [];
    for (const task of [...tasks].sort((a, b) => a.position - b.position)) {
      if (map[task.column_id]) map[task.column_id].push(task);
    }
    return map;
  }, [columns, tasks]);

  const findContainerId = useCallback(
    (id) => {
      if (columns.some((c) => c.id === id)) return id;
      return tasks.find((t) => t.id === id)?.column_id ?? null;
    },
    [columns, tasks]
  );

  const reportError = useCallback(
    (error, fallback) => {
      console.error(error);
      showToast(fallback, "error");
    },
    [showToast]
  );

  // ---------------------------------------------------------------------
  // Drag and drop
  // ---------------------------------------------------------------------

  function handleDragStart(event) {
    const { active } = event;
    if (active.data.current?.type === "Column") {
      setActiveColumn(active.data.current.column);
    } else if (active.data.current?.type === "Task") {
      setActiveTask(active.data.current.task);
    }
  }

  function handleDragOver(event) {
    const { active, over } = event;
    if (!over || active.data.current?.type !== "Task") return;

    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    const activeContainer = findContainerId(activeId);
    const overContainer = findContainerId(overId);
    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    // Live-move the card into the column it's currently hovering, so the
    // board visually reflects the drop target while dragging. The exact
    // position within that column is only settled in onDragEnd.
    setTasks((prev) => {
      const activeIndex = prev.findIndex((t) => t.id === activeId);
      if (activeIndex === -1) return prev;
      const updated = [...prev];
      updated[activeIndex] = { ...updated[activeIndex], column_id: overContainer };
      return updated;
    });
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    setActiveTask(null);
    setActiveColumn(null);
    if (!over) return;

    if (active.data.current?.type === "Column") {
      if (active.id === over.id) return;
      const oldIndex = sortedColumns.findIndex((c) => c.id === active.id);
      const newIndex = sortedColumns.findIndex((c) => c.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(sortedColumns, oldIndex, newIndex);
      const before = reordered[newIndex - 1];
      const after = reordered[newIndex + 1];
      const newPosition = positionBetween(before?.position, after?.position);

      setColumns((prev) =>
        prev.map((c) => (c.id === active.id ? { ...c, position: newPosition } : c))
      );

      const { error } = await supabase
        .from("columns")
        .update({ position: newPosition })
        .eq("id", active.id);
      if (error) reportError(error, "Couldn't save the new column order.");
      return;
    }

    if (active.data.current?.type !== "Task") return;

    const activeId = active.id;
    const overId = over.id;
    let persist = null;

    setTasks((prev) => {
      const activeIndex = prev.findIndex((t) => t.id === activeId);
      if (activeIndex === -1) return prev;
      const activeItem = prev[activeIndex];
      const containerId = activeItem.column_id;

      const siblings = prev
        .filter((t) => t.column_id === containerId && t.id !== activeId)
        .sort((a, b) => a.position - b.position);

      let overIndex;
      if (over.data.current?.type === "Task") {
        overIndex = siblings.findIndex((t) => t.id === overId);
        if (overIndex === -1) overIndex = siblings.length;
      } else {
        overIndex = siblings.length;
      }

      const before = siblings[overIndex - 1];
      const after = siblings[overIndex];
      const newPosition = positionBetween(before?.position, after?.position);

      persist = { id: activeItem.id, column_id: containerId, position: newPosition };

      const updated = [...prev];
      updated[activeIndex] = { ...activeItem, position: newPosition };
      return updated;
    });

    if (persist) {
      const { error } = await supabase
        .from("tasks")
        .update({ column_id: persist.column_id, position: persist.position })
        .eq("id", persist.id);
      if (error) reportError(error, "Couldn't save the task's new position.");
    }
  }

  // ---------------------------------------------------------------------
  // CRUD
  // ---------------------------------------------------------------------

  async function addColumn(name) {
    const lastPosition = columns.length ? Math.max(...columns.map((c) => c.position)) : 0;
    const color = COLUMN_PALETTE[columns.length % COLUMN_PALETTE.length];

    const { data, error } = await supabase
      .from("columns")
      .insert({ user_id: userId, name, color, position: lastPosition + 1000 })
      .select()
      .single();

    if (error || !data) {
      reportError(error, "Couldn't create the column.");
      return;
    }
    setColumns((prev) => [...prev, data]);
  }

  async function renameColumn(id, name) {
    setColumns((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
    const { error } = await supabase.from("columns").update({ name }).eq("id", id);
    if (error) reportError(error, "Couldn't rename the column.");
  }

  async function recolorColumn(id, color) {
    setColumns((prev) => prev.map((c) => (c.id === id ? { ...c, color } : c)));
    const { error } = await supabase.from("columns").update({ color }).eq("id", id);
    if (error) reportError(error, "Couldn't change the column color.");
  }

  async function deleteColumn(id) {
    const prevColumns = columns;
    const prevTasks = tasks;
    setColumns((prev) => prev.filter((c) => c.id !== id));
    setTasks((prev) => prev.filter((t) => t.column_id !== id));

    const { error } = await supabase.from("columns").delete().eq("id", id);
    if (error) {
      setColumns(prevColumns);
      setTasks(prevTasks);
      reportError(error, "Couldn't delete the column.");
    }
  }

  async function addTask(columnId, title) {
    const columnTasks = tasks.filter((t) => t.column_id === columnId);
    const lastPosition = columnTasks.length ? Math.max(...columnTasks.map((t) => t.position)) : 0;

    const { data, error } = await supabase
      .from("tasks")
      .insert({ user_id: userId, column_id: columnId, title, position: lastPosition + 1000 })
      .select()
      .single();

    if (error || !data) {
      reportError(error, "Couldn't create the task.");
      return;
    }
    setTasks((prev) => [...prev, data]);
  }

  async function updateTask(id, patch) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    const { error } = await supabase.from("tasks").update(patch).eq("id", id);
    if (error) reportError(error, "Couldn't save the task.");
  }

  async function deleteTask(id) {
    const prevTasks = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      setTasks(prevTasks);
      reportError(error, "Couldn't delete the task.");
    }
  }

  return (
    <main className="flex-1 overflow-x-auto px-4 py-6 sm:px-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
          <div className="flex h-full items-start gap-4">
            {sortedColumns.map((column) => (
              <Column
                key={column.id}
                column={column}
                tasks={tasksByColumn[column.id] ?? []}
                onRename={renameColumn}
                onRecolor={recolorColumn}
                onDelete={deleteColumn}
                onAddTask={addTask}
                onOpenTask={setEditingTask}
              />
            ))}
            <AddColumnForm onAdd={addColumn} />
          </div>
        </SortableContext>

        <DragOverlay>
          {activeTask ? (
            <TaskCardGhost
              task={activeTask}
              color={columns.find((c) => c.id === activeTask.column_id)?.color ?? "#94a3b8"}
            />
          ) : null}
          {activeColumn ? (
            <div
              className="w-72 rounded-2xl border border-white/60 bg-white/90 px-4 py-3 shadow-2xl"
              style={{ borderTop: `3px solid ${activeColumn.color}` }}
            >
              <p className="text-sm font-semibold text-slate-800">{activeColumn.name}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {editingTask && (
        <TaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={updateTask}
          onDelete={deleteTask}
        />
      )}

      {columns.length === 0 && (
        <p className="mt-10 text-center text-sm text-slate-400">
          You don&apos;t have any columns yet — add one to start planning tasks.
        </p>
      )}
    </main>
  );
}
