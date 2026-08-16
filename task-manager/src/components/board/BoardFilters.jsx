"use client";

const selectClass =
  "min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700 outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 sm:flex-none";

export default function BoardFilters({ profiles, createdBy, assignedTo, onCreatedByChange, onAssignedToChange }) {
  const hasFilter = createdBy !== "all" || assignedTo !== "all";

  return (
    // No card/border of its own — it's just the expanded contents of the
    // toolbar above the board, so on mobile it naturally spans the full
    // width of the screen instead of floating as a separate box.
    <div className="mt-2 flex w-full flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-3">
      <div className="flex w-full items-center gap-1.5 sm:w-auto">
        <label htmlFor="filter-created-by" className="shrink-0 text-xs font-medium text-slate-500">
          Created by
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

      <div className="flex w-full items-center gap-1.5 sm:w-auto">
        <label htmlFor="filter-assigned-to" className="shrink-0 text-xs font-medium text-slate-500">
          Assigned to
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
          Clear filters
        </button>
      )}
    </div>
  );
}
