"use client";

import { useEffect, useState } from "react";
import { UKURAN_HALAMAN } from "@/lib/constants";

// Paginasi sisi-klien. `resetKey` berubah (mis. filter/pencarian diganti) →
// kembali ke halaman 1. Halaman dijepit ke rentang valid bila jumlah data menyusut.
export function usePaginasi<T>(items: T[], resetKey: string, ukuran: number = UKURAN_HALAMAN) {
  const [halamanDiminta, setHalaman] = useState(1);
  useEffect(() => setHalaman(1), [resetKey]);

  const totalHalaman = Math.max(Math.ceil(items.length / ukuran), 1);
  const halaman = Math.min(halamanDiminta, totalHalaman);
  const itemHalaman = items.slice((halaman - 1) * ukuran, halaman * ukuran);

  return { halaman, totalHalaman, itemHalaman, setHalaman };
}
