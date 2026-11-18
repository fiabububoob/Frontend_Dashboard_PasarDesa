import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  /** Harus sama dengan `id` kolom isian di dalamnya. */
  htmlFor: string;
  /** Tampilkan tanda bintang merah wajib diisi. */
  required?: boolean;
  /** Teks bantu kecil di bawah kolom isian. */
  hint?: string;
  children: ReactNode;
}

// Label + kolom isian untuk form di modal/drawer.
export function Field({ label, htmlFor, required, hint, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-ink-900">
        {label}
        {required && (
          <span className="text-danger-600" aria-hidden>
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-ink-500">{hint}</p>}
    </div>
  );
}
