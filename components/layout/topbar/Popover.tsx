"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface PopoverProps {
  /** Tombol pemicu; `buka` dan `toggle` dipakai untuk aria-expanded & klik. */
  pemicu: (state: { buka: boolean; toggle: () => void }) => ReactNode;
  /** Isi panel; `tutup` dipanggil setelah pengguna memilih sesuatu. */
  children: (tutup: () => void) => ReactNode;
  /** Kelas lebar panel, mis. "w-80". */
  lebar: string;
  /** Dipanggil saat panel dibuka (mis. menandai notifikasi sudah dibaca). */
  onBuka?: () => void;
  /**
   * Tampilkan panel di luar elemen induk (di <body>, posisi fixed di bawah/atas pemicu).
   * Dipakai untuk menu di dalam tabel/daftar: tanpa ini panel bisa tertimpa baris di bawahnya
   * atau terpotong container yang bisa di-scroll.
   */
  portal?: boolean;
}

// Panel dropdown di kanan bawah pemicu. Menutup saat klik di luar atau menekan Esc.
// Karena klik di pemicu lain dihitung "di luar", membuka satu menu otomatis menutup yang lain.
export function Popover({ pemicu, children, lebar, onBuka, portal = false }: PopoverProps) {
  const [buka, setBuka] = useState(false);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const tutup = useCallback(() => setBuka(false), []);

  // Klik di luar pemicu DAN panel menutup panel (panel mode portal berada di luar `ref`).
  useEffect(() => {
    if (!buka) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!ref.current?.contains(target) && !panelRef.current?.contains(target)) tutup();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [buka, tutup]);

  useEffect(() => {
    if (!buka) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && tutup();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [buka, tutup]);

  // Mode portal: sejajarkan tepi kanan panel dengan pemicu; bila tidak muat di bawah, buka ke atas.
  const hitung = useCallback(() => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const tinggi = panelRef.current?.offsetHeight ?? 0;
    const muatDiBawah = r.bottom + 8 + tinggi <= window.innerHeight - 8;
    const muatDiAtas = r.top - 8 - tinggi >= 8;
    setPos({ top: muatDiBawah || !muatDiAtas ? r.bottom + 8 : r.top - 8 - tinggi, right: Math.max(8, window.innerWidth - r.right) });
  }, []);

  useLayoutEffect(() => {
    if (buka && portal) hitung();
  }, [buka, portal, hitung]);

  useEffect(() => {
    if (!buka || !portal) return;
    window.addEventListener("resize", hitung);
    window.addEventListener("scroll", hitung, true); // true: ikut scroll container mana pun
    return () => {
      window.removeEventListener("resize", hitung);
      window.removeEventListener("scroll", hitung, true);
    };
  }, [buka, portal, hitung]);

  function toggle() {
    if (!buka) onBuka?.();
    setBuka((v) => !v);
  }

  const panel = `${lebar} max-w-[calc(100vw-2rem)] animate-fade-in-fast rounded-xl border border-line bg-white p-2 shadow-lg`;

  return (
    <div ref={ref} className="relative">
      {pemicu({ buka, toggle })}
      {buka &&
        (portal ? (
          createPortal(
            <div ref={panelRef} className={`fixed z-40 ${panel}`} style={pos ? { top: pos.top, right: pos.right } : { top: 0, right: 0, visibility: "hidden" }}>
              {children(tutup)}
            </div>,
            document.body,
          )
        ) : (
          <div className={`absolute right-0 top-full z-30 mt-2 ${panel}`}>{children(tutup)}</div>
        ))}
    </div>
  );
}
