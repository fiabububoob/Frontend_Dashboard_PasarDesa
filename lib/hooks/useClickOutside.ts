"use client";

import { useEffect, type RefObject } from "react";

// Memanggil `onOutside` saat pengguna menekan mouse di luar elemen `ref`.
// Dipakai dropdown/popup (menu profil, notifikasi, pencarian, filter batch).
export function useClickOutside(ref: RefObject<HTMLElement>, onOutside: () => void, aktif = true) {
  useEffect(() => {
    if (!aktif) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onOutside();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onOutside, aktif]);
}
