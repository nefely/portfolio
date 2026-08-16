"use client";

const selectClass =
  "rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700 outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100";

export default function BoardFilters({ profiles, createdBy, assignedTo, onCreatedByChange, onAssignedToChange }) {
  const hasFilter = createdBy !== "all" || assignedTo !== "all";

  return (
    <div className="mb-4 flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-1.5">
        <label htmlFor="filter-created-by" className="text-xs font-medium text-slate-500">
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

      <div className="flex items-center gap-1.5">
        <label htmlFor="filter-assigned-to" className="text-xs font-medium text-slate-500">
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
          className="text-xs font-medium text-indigo-600 hover:text-indigo-500 hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
