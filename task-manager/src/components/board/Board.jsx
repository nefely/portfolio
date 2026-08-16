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
import { Filter } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { positionBetween } from "@/lib/positioning";
import { useToast } from "@/components/ui/Toast";
import BoardFilters from "./BoardFilters";
import Column from "./Column";
import AddColumnForm from "./AddColumnForm";
import TaskModal from "./TaskModal";
import { TaskCardGhost } from "./TaskCard";

const COLUMN_PALETTE = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"];

export default function Board({ initialColumns, initialTasks, profiles, userId }) {
  const supabase = useMemo(() => createClient(), []);
  const showToast = useToast();

  const [columns, setColumns] = useState(initialColumns);
  const [tasks, setTasks] = useState(initialTasks);
  const [activeTask, setActiveTask] = useState(null);
  const [activeColumn, setActiveColumn] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [filterCreatedBy, setFilterCreatedBy] = useState("all");
  const [filterAssignedTo, setFilterAssignedTo] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const hasActiveFilters = filterCreatedBy !== "all" || filterAssignedTo !== "all";

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const columnIds = useMemo(() => columns.map((c) => c.id), [columns]);

  const sortedColumns = useMemo(
    () => [...columns].sort((a, b) => a.position - b.position),
    [columns]
  );

  // Filtering only changes what's displayed — drag-and-drop math above still
  // reads from the full `tasks` state, so moving cards around stays correct
  // even while a filter hides some of them.
  const visibleTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filterCreatedBy !== "all" && t.user_id !== filterCreatedBy) return false;
      if (filterAssignedTo === "unassigned" && t.assigned_to) return false;
      if (
        filterAssignedTo !== "all" &&
        filterAssignedTo !== "unassigned" &&
        t.assigned_to !== filterAssignedTo
      )
        return false;
      return true;
    });
  }, [tasks, filterCreatedBy, filterAssignedTo]);

  const tasksByColumn = useMemo(() => {
    const map = {};
    for (const col of columns) map[col.id] = [];
    for (const task of [...visibleTasks].sort((a, b) => a.position - b.position)) {
      if (map[task.column_id]) map[task.column_id].push(task);
    }
    return map;
  }, [columns, visibleTasks]);

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

      const prevColumns = columns;
      setColumns((prev) =>
        prev.map((c) => (c.id === active.id ? { ...c, position: newPosition } : c))
      );

      const { error } = await supabase
        .from("columns")
        .update({ position: newPosition })
        .eq("id", active.id);
      if (error) {
        setColumns(prevColumns);
        reportError(error, "Couldn't save the new column order.");
      }
      return;
    }

    if (active.data.current?.type !== "Task") return;

    const activeId = active.id;
    const overId = over.id;

    // Compute the new position from the current render's `tasks` state
    // directly, rather than inside the setTasks updater — that updater isn't
    // guaranteed to run synchronously, so a value assigned inside it (and
    // read right after, like the old `persist` variable used to be) can
    // still be unset by the time we get here, silently skipping the save.
    const activeIndex = tasks.findIndex((t) => t.id === activeId);
    if (activeIndex === -1) return;
    const activeItem = tasks[activeIndex];
    const containerId = activeItem.column_id;

    const siblings = tasks
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

    const prevTasks = tasks;
    setTasks((prev) =>
      prev.map((t) => (t.id === activeId ? { ...t, column_id: containerId, position: newPosition } : t))
    );

    const { error } = await supabase
      .from("tasks")
      .update({ column_id: containerId, position: newPosition })
      .eq("id", activeItem.id);
    if (error) {
      setTasks(prevTasks);
      reportError(error, "Couldn't save the task's new position.");
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
    const prevColumns = columns;
    setColumns((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
    const { error } = await supabase.from("columns").update({ name }).eq("id", id);
    if (error) {
      setColumns(prevColumns);
      reportError(error, "Couldn't rename the column.");
    }
  }

  async function recolorColumn(id, color) {
    const prevColumns = columns;
    setColumns((prev) => prev.map((c) => (c.id === id ? { ...c, color } : c)));
    const { error } = await supabase.from("columns").update({ color }).eq("id", id);
    if (error) {
      setColumns(prevColumns);
      reportError(error, "Couldn't change the column color.");
    }
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
    const prevTasks = tasks;

    // Changing status from the modal (rather than dragging) still needs a
    // position within the target column — append it to the end, same as a
    // freshly-added task would get.
    let finalPatch = patch;
    const current = tasks.find((t) => t.id === id);
    if (patch.column_id && current && patch.column_id !== current.column_id) {
      const columnTasks = tasks.filter((t) => t.column_id === patch.column_id);
      const lastPosition = columnTasks.length ? Math.max(...columnTasks.map((t) => t.position)) : 0;
      finalPatch = { ...patch, position: lastPosition + 1000 };
    }

    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...finalPatch } : t)));
    const { error } = await supabase.from("tasks").update(finalPatch).eq("id", id);
    if (error) {
      setTasks(prevTasks);
      reportError(error, "Couldn't save the task.");
    }
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
    <>
      <div className="border-b border-slate-200/70 bg-white/70 px-4 py-2 backdrop-blur sm:px-6">
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium transition ${
            showFilters || hasActiveFilters
              ? "bg-indigo-50 text-indigo-600"
              : "text-slate-500 hover:bg-slate-100"
          }`}
          aria-expanded={showFilters}
        >
          <Filter size={14} />
          Filters
          {hasActiveFilters && (
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" aria-hidden="true" />
          )}
        </button>

        {showFilters && (
          <BoardFilters
            profiles={profiles}
            createdBy={filterCreatedBy}
            assignedTo={filterAssignedTo}
            onCreatedByChange={setFilterCreatedBy}
            onAssignedToChange={setFilterAssignedTo}
          />
        )}
      </div>

      <main className="flex-1 overflow-x-auto px-4 py-6 sm:px-6">
      <DndContext
        // dnd-kit auto-generates its a11y announcer ids (DndDescribedBy-N)
        // from a module-level counter, which increments differently on the
        // server vs. during client hydration and trips React's hydration
        // check. Passing a fixed id makes it deterministic instead.
        id="task-board"
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
                profiles={profiles}
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
          profiles={profiles}
          columns={columns}
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
    </>
  );
}
