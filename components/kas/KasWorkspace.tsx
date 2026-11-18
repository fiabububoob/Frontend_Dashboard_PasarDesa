"use client";

import { useMemo } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { StatCardGrid } from "@/components/ui/StatCardGrid";
import { TransaksiTable } from "@/components/kas/TransaksiTable";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { useDetail } from "@/components/detail/DetailProvider";
import { statKas } from "@/lib/stats";

// Seluruh halaman Kas. Saldo, escrow, dan omset dihitung dari data hidup: menyelesaikan
// pesanan menambah saldo (escrow lepas), pencairan mengurangi saldo, dan keduanya tercatat di riwayat mutasi.
// Form penarikan dana ada di panel samping (DetailTarget "tarik-saldo").
export function KasWorkspace() {
  const { pesanan, saldoAktif, omset, statusKas, galatKas, muatKas } = useDashboardData();
  const { open } = useDetail();

  const stats = useMemo(() => statKas({ pesanan, saldoAktif, omset }), [pesanan, saldoAktif, omset]);

  return (
    <>
      <PageHeader
        eyebrow="Kas & Saldo"
        title="Kas & Saldo"
        description="Pantau saldo, riwayat transaksi, dan tarik dana kapan saja."
        actions={
          <>
            <Button variant="secondary" className="border-brand-600 text-brand-700" onClick={() => open({ type: "laporan-kas" })}>
              Unduh Laporan
            </Button>
            <Button variant="primary" disabled={statusKas !== "siap"} onClick={() => open({ type: "tarik-saldo" })}>
              Tarik Saldo
            </Button>
          </>
        }
      />

      {statusKas === "gagal" && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warn-400/40 bg-[#FFF6DB] px-4 py-3 text-sm text-[#7A4B00]">
          <p>
            <span className="font-semibold">Data kas belum tersambung ke server.</span> Yang tampil adalah data contoh{galatKas ? ` (${galatKas})` : ""}. Penarikan saldo dinonaktifkan sementara.
          </p>
          <Button variant="secondary" size="sm" onClick={() => void muatKas()}>
            Coba lagi
          </Button>
        </div>
      )}

      <StatCardGrid stats={stats} columns={3} />

      <TransaksiTable />
    </>
  );
}
