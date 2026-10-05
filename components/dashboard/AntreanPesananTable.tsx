"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { StatusBadge } from "@/components/pesanan/StatusBadge";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { useDetail } from "@/components/detail/DetailProvider";
import { useActionStatus } from "@/lib/hooks/useActionStatus";
import { simulateRequest } from "@/lib/fake-api";
import { JAM_JEMPUT_SORE, LATENSI } from "@/lib/constants";
import { stagger } from "@/lib/motion";
import { hitungStatus } from "@/lib/pesanan";
import type { Pesanan } from "@/types";

// Satu baris punya state tombolnya sendiri (idle → loading → selesai), jadi
// dipisah sebagai komponen supaya hook-nya tidak tercampur antar baris.
// Status kemas diambil dari data hidup (DashboardDataProvider), jadi paket yang
// disiapkan di sini juga ikut berubah di modal, rekap, dan kartu statistik.
function AntreanRow({ pesanan, index, onDone }: { pesanan: Pesanan; index: number; onDone: (id: string) => void }) {
  const toast = useToast();
  const { siapkanPaket } = useDashboardData();
  const { open } = useDetail();
  const { status, run } = useActionStatus(900);
  const sudahSiap = pesanan.status !== "perlu-dikemas";

  async function handleSiapkan() {
    const ok = await run(() => simulateRequest(LATENSI.normal));
    if (ok) {
      siapkanPaket(pesanan.id);
      onDone(pesanan.id);
      toast({ type: "success", title: "Paket siap di rak", description: `#${pesanan.id} menunggu kurir desa.` });
    } else {
      toast({ type: "error", title: "Gagal menyiapkan paket", description: "Coba lagi sebentar lagi." });
    }
  }

  return (
    <tr className="animate-fade-in" style={stagger(index)}>
      <td className="py-3 pr-3">
        <button type="button" onClick={() => open({ type: "pesanan", id: pesanan.id })} className="text-left">
          <span className="block whitespace-nowrap font-medium text-ink-900 hover:text-brand-700 hover:underline">#{pesanan.id}</span>
          <span className="block text-xs text-ink-500">{pesanan.pembeli}</span>
        </button>
      </td>
      <td className="py-3 pr-3 text-ink-700">{pesanan.items.map((item) => item.komoditas).join(" + ")}</td>
      <td className="py-3 pr-3 text-ink-700">{pesanan.dropPoint}</td>
      <td className="py-3 pr-3">
        <StatusBadge status={pesanan.status} />
      </td>
      <td className="py-3 text-right">
        {sudahSiap ? (
          <span className="inline-flex animate-pop items-center gap-1 text-xs font-medium text-brand-600">
            <Check className="h-3.5 w-3.5" aria-hidden />
            Siap di Rak
          </span>
        ) : (
          <Button status={status} loadingLabel="Menyiapkan…" errorLabel="Coba lagi" onClick={handleSiapkan} size="sm">
            Siapkan Paket
          </Button>
        )}
      </td>
    </tr>
  );
}

const MAKS_BARIS = 6;

export function AntreanPesananTable() {
  const { pesanan } = useDashboardData();
  // Baris yang baru disiapkan tetap tampil ("Siap di Rak") selama halaman ini
  // terbuka, supaya hasil aksinya terlihat sebelum baris hilang dari antrean.
  const [baruSiap, setBaruSiap] = useState<string[]>([]);
  const perluDikemas = pesanan.filter((p) => p.status === "perlu-dikemas");
  const baris = pesanan.filter((p) => p.status === "perlu-dikemas" || baruSiap.includes(p.id)).slice(0, MAKS_BARIS);
  const siapDijemput = hitungStatus(pesanan, "siap-jemput");

  return (
    <Card className="flex flex-1 flex-col p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-base font-semibold text-ink-900">
            <span className="h-2 w-2 rounded-full bg-brand-500" />
            Antrean Pesanan Mendesak
          </p>
          <p className="mt-1 text-xs text-ink-500">Siapkan sebelum kurir desa datang pukul {JAM_JEMPUT_SORE} untuk kloter sore.</p>
        </div>
        <Link href="/pesanan" className="shrink-0 text-sm font-medium text-brand-600 hover:underline">
          Lihat Semua Pesanan →
        </Link>
      </div>

      <div className="mt-4 flex-1 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase text-ink-400">
              <th className="pb-3 font-medium">ID Pesanan &amp; Pemesan</th>
              <th className="pb-3 font-medium">Komoditas &amp; Kuantitas</th>
              <th className="pb-3 font-medium">Tujuan Drop-Point</th>
              <th className="pb-3 font-medium">Status Kemas</th>
              <th className="pb-3 text-right font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {baris.map((p, index) => (
              <AntreanRow key={p.id} pesanan={p} index={index} onDone={(id) => setBaruSiap((l) => [...l, id])} />
            ))}
          </tbody>
        </table>
        {baris.length === 0 && (
          <p className="py-8 text-center text-sm text-ink-500">Semua paket sudah siap. Tidak ada antrean mendesak.</p>
        )}
      </div>
      {/* Footer selalu menempel di dasar kartu, jadi kartu tetap rapi walau antreannya sedikit */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-line pt-4 text-xs text-ink-500">
        <span>
          {perluDikemas.length} paket perlu dikemas
          {perluDikemas.length > MAKS_BARIS ? ` · menampilkan ${MAKS_BARIS} teratas` : ""} · {siapDijemput} paket siap dijemput kurir
        </span>
        <span className="text-ink-400">Kloter sore dijemput pukul {JAM_JEMPUT_SORE}</span>
      </div>
    </Card>
  );
}
