import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected: boolean;
}

// Pilihan berbentuk kapsul (jenis sumber, label tampilan, opsi pengiriman, Ya/Tidak).
export function Chip({ selected, className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={clsx(
        "rounded-full border px-4 py-2 text-sm transition-colors duration-feedback ease-enter",
        selected ? "border-brand-600 bg-[#DDF5E5] font-semibold text-brand-900" : "border-line bg-white font-medium text-ink-700 hover:bg-surface-muted",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
