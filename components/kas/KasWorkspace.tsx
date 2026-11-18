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
  const { pesanan, saldoAktif, omset } = useDashboardData();
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
            <Button variant="primary" onClick={() => open({ type: "tarik-saldo" })}>
              Tarik Saldo
            </Button>
          </>
        }
      />

      <StatCardGrid stats={stats} columns={3} />

      <TransaksiTable />
    </>
  );
}
