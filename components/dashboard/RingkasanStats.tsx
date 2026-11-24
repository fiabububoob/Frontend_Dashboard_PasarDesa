"use client";

import { useMemo } from "react";
import { StatCardGrid } from "@/components/ui/StatCardGrid";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { useSekarang } from "@/lib/hooks/useSekarang";
import { statRingkasan } from "@/lib/stats";

// Angka dihitung dari data hidup (lib/stats.ts), jadi ikut berubah saat paket
// disiapkan, stok ditambah, pesanan selesai, atau dana dicairkan.
export function RingkasanStats() {
  const { komoditas, pesanan, saldoAktif, omset } = useDashboardData();
  const sekarang = useSekarang();
  const stats = useMemo(() => statRingkasan({ komoditas, pesanan, saldoAktif, omset, sekarang }), [komoditas, pesanan, saldoAktif, omset, sekarang]);
  return <StatCardGrid stats={stats} compact />;
}
