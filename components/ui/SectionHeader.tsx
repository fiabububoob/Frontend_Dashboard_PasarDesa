import type { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  /** Huruf penanda urutan bagian (A, B, C…). */
  huruf: string;
  judul: string;
  deskripsi: string;
  icon: LucideIcon;
}

// Judul bagian pada form panjang (Pengaturan): lencana huruf, judul, ikon, lalu deskripsi.
export function SectionHeader({ huruf, judul, deskripsi, icon: Icon }: SectionHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-base font-semibold text-ink-900">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">{huruf}</span>
          {judul}
        </p>
        <Icon className="h-5 w-5 text-ink-400" />
      </div>
      <p className="mt-1 pl-8 text-xs text-ink-500">{deskripsi}</p>
    </>
  );
}
