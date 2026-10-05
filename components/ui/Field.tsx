import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  /** Harus sama dengan `id` kolom isian di dalamnya. */
  htmlFor: string;
  children: ReactNode;
}

// Label + kolom isian untuk form kecil di modal.
export function Field({ label, htmlFor, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-ink-700">
        {label}
      </label>
      {children}
    </div>
  );
}
