import type { ReactNode } from "react";

interface FormFieldProps {
  id: string;
  label: string;
  /** Напр. "(необов'язково)" — дрібніше, поруч із label. */
  labelHint?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

// Label + поле + підказка/помилка з правильними id для aria-describedby.
// Саме поле передається children'ом і саме ставить
// aria-describedby={fieldDescribedBy(id, error, hint)}.
export function FormField({ id, label, labelHint, hint, error, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {labelHint && (
          <span className="font-normal text-gray-500 dark:text-gray-400"> ({labelHint})</span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-gray-500 dark:text-gray-400">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

export function fieldDescribedBy(id: string, error?: string, hint?: string): string | undefined {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}
