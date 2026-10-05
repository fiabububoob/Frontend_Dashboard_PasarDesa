"use client";

import { useMemo } from "react";
import { Download, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { StatCardGrid } from "@/components/ui/StatCardGrid";
import { WithdrawForm } from "@/components/kas/WithdrawForm";
import { PerformaPanenCard, JaminanKasCard } from "@/components/kas/SidePanels";
import { TransaksiTable } from "@/components/kas/TransaksiTable";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { useDetail } from "@/components/detail/DetailProvider";
import { statKas } from "@/lib/stats";

// Tunggu animasi scroll halus selesai sebelum memfokuskan kolom.
const JEDA_FOKUS_SETELAH_SCROLL_MS = 350;

// Seluruh halaman Kas. Saldo, escrow, omset, dan subsidi dihitung dari data
// hidup: menyelesaikan pesanan menambah saldo (escrow lepas), pencairan
// mengurangi saldo, dan keduanya tercatat di riwayat mutasi.
export function KasWorkspace() {
  const { pesanan, saldoAktif, omset } = useDashboardData();
  const { open } = useDetail();

  const stats = useMemo(() => statKas({ pesanan, saldoAktif, omset }), [pesanan, saldoAktif, omset]);

  // "Tarik Saldo" di header: arahkan ke formulir dan fokuskan kolom nominal.
  function keFormulir() {
    document.getElementById("form-tarik")?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => document.getElementById("nominal-tarik")?.focus({ preventScroll: true }), JEDA_FOKUS_SETELAH_SCROLL_MS);
  }

  return (
    <>
      <PageHeader
        title="Kas & Saldo"
        description="Pantau saldo, riwayat transaksi, dan tarik dana kapan saja."
        actions={
          <>
            <Button variant="secondary" onClick={() => open({ type: "laporan-kas" })}>
              <Download className="h-4 w-4" />
              Download Laporan (.PDF)
            </Button>
            <Button variant="primary" onClick={keFormulir}>
              <ArrowUpRight className="h-4 w-4" />
              Tarik Saldo ke Rekening / Kas BUMDes
            </Button>
          </>
        }
      />

      <StatCardGrid stats={stats} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0">
          <WithdrawForm />
        </div>
        <div className="space-y-6">
          <PerformaPanenCard />
          <JaminanKasCard />
        </div>
      </div>

      <TransaksiTable />
    </>
  );
}
