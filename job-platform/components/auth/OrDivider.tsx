export function OrDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-xs text-gray-500 uppercase dark:text-gray-400">
      <span className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
      {label}
      <span className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
    </div>
  );
}
