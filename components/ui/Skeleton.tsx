import { clsx } from "clsx";

// Placeholder saat halaman memuat (lihat app/(dashboard)/loading.tsx).
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={clsx("animate-pulse rounded-lg bg-surface-sunken", className)} />;
}
