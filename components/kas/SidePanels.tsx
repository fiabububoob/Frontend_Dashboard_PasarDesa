"use client";

import { MapPin, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useDetail } from "@/components/detail/DetailProvider";
import { formatRupiah } from "@/lib/format";

export function PerformaPanenCard() {
  const { open } = useDetail();
  const target = 82;
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex h-32 items-end bg-gradient-to-br from-brand-700 to-brand-500 p-4">
        <p className="rounded bg-white/15 px-2 py-1 text-xs font-medium text-white">Gudang Induk Krajan Makmur</p>
      </div>
      <div className="p-5">
        <p className="text-xs font-medium uppercase text-ink-400">Performa Panen Bulan Ini</p>
        <p className="mt-1 text-base font-semibold text-ink-900">Padi Ciherang &amp; Cabai Rawit</p>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-ink-500">Target Realisasi Penjualan</span>
            <span className="font-medium text-brand-600">{target}% Tercapai</span>
          </div>
          <div className="mt-1.5 h-2 w-full rounded-full bg-surface-sunken">
            <div className="h-2 origin-left animate-grow-x rounded-full bg-brand-600" style={{ width: `${target}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-xs text-ink-500">
            <span>Terkirim: 2.450 kg</span>
            <span>Total Nilai: {formatRupiah(14850000)}</span>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-lg bg-surface-muted p-3 text-xs text-ink-700">
          <MapPin className="h-4 w-4 shrink-0 text-ink-400" />
          <div>
            <p className="font-medium">Kasir Loket BUMDes Balai Desa</p>
            <p className="text-ink-500">Jl. Raya Sukorejo No. 12 (Ruang Bendahara)</p>
          </div>
        </div>

        <Button variant="secondary" size="sm" className="mt-4 w-full" onClick={() => open({ type: "laporan" })}>
          Lihat Laporan Panen
        </Button>
      </div>
    </Card>
  );
}

export function JaminanKasCard() {
  return (
    <Card className="p-5">
      <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
        <ShieldCheck className="h-4 w-4 text-brand-600" />
        Jaminan Transaksi BUMDes Sukorejo
      </p>
      <p className="mt-2 text-xs text-ink-500">
        Setiap mutasi dana diawasi Lembaga Keuangan Desa dan dilindungi dana cadangan BUMDes.
      </p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink-500">
        <span>🔒 Sistem Enkripsi Perbankan</span>
        <span>SK Desa No. 14/BUMD/2022</span>
      </div>
    </Card>
  );
}
