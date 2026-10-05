// Gaya kolom isian bawaan browser (select, input time) agar seragam dengan <Input>.
export function fieldClass({ compact = false, fullWidth = true }: { compact?: boolean; fullWidth?: boolean } = {}): string {
  return [
    "rounded-lg border border-line bg-white text-sm text-ink-900",
    "focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500",
    "disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-ink-400",
    compact ? "px-2 py-1.5" : "px-3 py-2.5",
    fullWidth ? "w-full" : "",
  ]
    .filter(Boolean)
    .join(" ");
}
