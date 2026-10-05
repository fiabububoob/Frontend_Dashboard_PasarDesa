"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useClickOutside } from "@/lib/hooks/useClickOutside";

interface PopoverProps {
  /** Tombol pemicu; `buka` dan `toggle` dipakai untuk aria-expanded & klik. */
  pemicu: (state: { buka: boolean; toggle: () => void }) => ReactNode;
  /** Isi panel; `tutup` dipanggil setelah pengguna memilih sesuatu. */
  children: (tutup: () => void) => ReactNode;
  /** Kelas lebar panel, mis. "w-80". */
  lebar: string;
  /** Dipanggil saat panel dibuka (mis. menandai notifikasi sudah dibaca). */
  onBuka?: () => void;
}

// Panel dropdown di kanan bawah pemicu. Menutup saat klik di luar atau menekan Esc.
// Karena klik di pemicu lain dihitung "di luar", membuka satu menu otomatis menutup yang lain.
export function Popover({ pemicu, children, lebar, onBuka }: PopoverProps) {
  const [buka, setBuka] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const tutup = useCallback(() => setBuka(false), []);

  useClickOutside(ref, tutup, buka);

  useEffect(() => {
    if (!buka) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && tutup();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [buka, tutup]);

  function toggle() {
    if (!buka) onBuka?.();
    setBuka((v) => !v);
  }

  return (
    <div ref={ref} className="relative">
      {pemicu({ buka, toggle })}
      {buka && (
        <div className={`absolute right-0 top-full mt-2 ${lebar} max-w-[calc(100vw-2rem)] animate-fade-in-fast rounded-xl border border-line bg-white p-2 shadow-lg`}>{children(tutup)}</div>
      )}
    </div>
  );
}
