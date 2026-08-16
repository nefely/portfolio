"use client";

const selectClass =
  "min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700 outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 sm:flex-none";

export default function BoardFilters({ profiles, createdBy, assignedTo, onCreatedByChange, onAssignedToChange }) {
  const hasFilter = createdBy !== "all" || assignedTo !== "all";

  return (
    // Sticky to the left edge of the board's own horizontal scroll
    // container (see Board.jsx's <main overflow-x-auto>), so the bar stays
    // in view instead of scrolling away with the columns behind it. Fixed
    // to one column's width on mobile so the two filters wrap onto their
    // own rows instead of overflowing the screen.
    <div className="sticky left-0 z-10 mb-4 flex w-72 flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur sm:w-fit sm:flex-nowrap sm:gap-3">
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
