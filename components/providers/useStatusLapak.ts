"use client";

import { useMemo } from "react";
import { useSekarang } from "@/lib/hooks/useSekarang";
import { statusLapak, type StatusLapak } from "@/lib/pengaturan";
import type { PengaturanLapak } from "@/types";
import { useDashboardData } from "./DashboardDataProvider";

// Status buka/tutup lapak untuk `pengaturan` tertentu (tersimpan atau draft),
// memperhitungkan mode jeda tanam dan jam sekarang. `status` null sampai
// komponen termuat di browser (lihat useSekarang).
export function useStatusLapak(pengaturan: Pick<PengaturanLapak, "jadwal">): { status: StatusLapak | null; sekarang: Date | null } {
  const { jedaTanam } = useDashboardData();
  const sekarang = useSekarang();
  const status = useMemo(() => (sekarang ? statusLapak(pengaturan, jedaTanam, sekarang) : null), [pengaturan, jedaTanam, sekarang]);
  return { status, sekarang };
}
