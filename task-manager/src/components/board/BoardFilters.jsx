"use client";

const selectClass =
  "min-w-0 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 sm:px-2.5 sm:py-1.5 sm:text-sm";

export default function BoardFilters({ profiles, createdBy, assignedTo, onCreatedByChange, onAssignedToChange }) {
  const hasFilter = createdBy !== "all" || assignedTo !== "all";

  return (
    // Sticky to the left edge of the board's own horizontal scroll
    // container (see Board.jsx's <main overflow-x-auto>), so the bar stays
    // in view instead of scrolling away with the columns behind it.
    <div className="sticky left-0 z-10 mb-4 flex w-fit flex-nowrap items-center gap-1.5 rounded-xl border border-slate-200 bg-white/95 px-2 py-1.5 shadow-sm backdrop-blur sm:gap-3 sm:px-3 sm:py-2">
      <div className="flex shrink-0 items-center gap-1">
        <label htmlFor="filter-created-by" className="hidden text-xs font-medium text-slate-500 sm:inline">
          Created by
        </label>
        <label htmlFor="filter-created-by" className="text-xs font-medium text-slate-500 sm:hidden">
          By
        </label>
        <select
          id="filter-created-by"
          value={createdBy}
          onChange={(e) => onCreatedByChange(e.target.value)}
          className={selectClass}
        >
          <option value="all">Everyone</option>
          {profiles?.map((p) => (
            <option key={p.id} value={p.id}>
              {p.email}
            </option>
          ))}
        </select>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <label htmlFor="filter-assigned-to" className="hidden text-xs font-medium text-slate-500 sm:inline">
          Assigned to
        </label>
        <label htmlFor="filter-assigned-to" className="text-xs font-medium text-slate-500 sm:hidden">
          To
        </label>
        <select
          id="filter-assigned-to"
          value={assignedTo}
          onChange={(e) => onAssignedToChange(e.target.value)}
          className={selectClass}
        >
          <option value="all">Everyone</option>
          <option value="unassigned">Unassigned</option>
          {profiles?.map((p) => (
            <option key={p.id} value={p.id}>
              {p.email}
            </option>
          ))}
        </select>
      </div>

      {hasFilter && (
        <button
          type="button"
          onClick={() => {
            onCreatedByChange("all");
            onAssignedToChange("all");
          }}
          className="shrink-0 whitespace-nowrap text-xs font-medium text-indigo-600 hover:text-indigo-500 hover:underline"
        >
          Clear
        </button>
      )}
    </div>
  );
}
