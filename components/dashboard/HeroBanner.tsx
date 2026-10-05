"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useDetail } from "@/components/detail/DetailProvider";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { useStatusLapak } from "@/components/providers/useStatusLapak";
import { formatJam, formatTanggal } from "@/lib/format";

export function HeroBanner() {
  const { open } = useDetail();
  const { pengaturan } = useDashboardData();
  const { status, sekarang } = useStatusLapak(pengaturan);

  // Tanggal & jam baru tersedia setelah mount (lihat useSekarang) supaya tidak ada mismatch hydration.
  const waktu = sekarang ? `${formatTanggal(sekarang, "full")} · ${formatJam(sekarang)} WIB` : "";
  const tutup = status !== null && !status.buka;
  const teksStatus = tutup ? (status.kode === "jeda" ? "Lapak tutup sementara" : "Lapak sedang tutup") : "Lapak buka";

  return (
    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div>
        <p className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-ink-500">
          <span className={`h-1.5 w-1.5 rounded-full ${tutup ? "bg-danger-600" : "bg-brand-500"}`} />
          {teksStatus}
          {waktu && <span className="text-ink-400">· {waktu}</span>}
        </p>
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink-900 sm:text-2xl">Selamat datang, {pengaturan.namaLapak}!</h2>
        <p className="mt-1 text-sm text-ink-500">Ringkasan aktivitas lapak dan panen hari ini.</p>
      </div>
      <Button variant="secondary" onClick={() => open({ type: "rekap" })}>
        <Printer className="h-4 w-4" />
        Cetak Rekap Hari Ini
      </Button>
    </div>
  );
}
