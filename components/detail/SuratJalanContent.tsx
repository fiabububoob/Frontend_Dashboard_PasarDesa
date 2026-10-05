"use client";

import { Inbox } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { KURIR_DEFAULT } from "@/lib/data/pesanan";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { perluDijemput } from "@/lib/pesanan";
import { PrintActions } from "./PrintActions";

// Surat jalan kurir: semua paket yang belum dijemput, dikelompokkan per
// drop-point supaya kurir bisa mengantar per tujuan. Tercetak lewat .print-area.
export function SuratJalanContent() {
  const { pesanan } = useDashboardData();
  const aktif = pesanan.filter(perluDijemput);
  const tanggal = formatTanggal(new Date(), "full");

  if (aktif.length === 0) {
    return <EmptyState icon={Inbox} title="Tidak ada paket untuk dijemput" description="Semua pesanan sudah dijemput kurir atau selesai." />;
  }

  const perTujuan = new Map<string, typeof aktif>();
  aktif.forEach((p) => perTujuan.set(p.dropPoint, [...(perTujuan.get(p.dropPoint) ?? []), p]));
  const cod = aktif.filter((p) => p.metodeBayar === "COD").reduce((sum, p) => sum + p.total, 0);

  return (
    <div className="space-y-4 text-sm">
      <div className="print-area space-y-4">
        <div>
          <p className="font-display text-base font-bold text-ink-900">SURAT JALAN KURIR DESA</p>
          <p className="text-xs text-ink-500">
            BUMDes Sukorejo · {tanggal} · Kloter sore {KURIR_DEFAULT.jadwal}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-3 rounded-lg border border-line p-3 text-xs sm:grid-cols-4">
          {[
            ["Kurir", KURIR_DEFAULT.nama],
            ["Armada", KURIR_DEFAULT.armada],
            ["Total paket", `${aktif.length} paket · ${perTujuan.size} drop-point`],
            ["COD ditagih", formatRupiah(cod)],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-ink-500">{label}</dt>
              <dd className="font-medium text-ink-900">{value}</dd>
            </div>
          ))}
        </dl>

        {Array.from(perTujuan.entries()).map(([tujuan, list]) => (
          <section key={tujuan} className="print-keep">
            <p className="mb-1.5 text-xs font-semibold uppercase text-ink-700">
              {tujuan} <span className="font-normal text-ink-400">({list.length} paket)</span>
            </p>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-line text-ink-500">
                  <th className="py-1.5 font-medium">No. Pesanan / Penerima</th>
                  <th className="py-1.5 font-medium">Isi paket</th>
                  <th className="py-1.5 text-right font-medium">Bayar</th>
                  <th className="w-10 py-1.5 text-center font-medium">✓</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {list.map((p) => (
                  <tr key={p.id}>
                    <td className="py-1.5 pr-2">
                      <span className="block font-medium text-ink-900">#{p.id}</span>
                      <span className="text-ink-500">{p.pembeli}</span>
                    </td>
                    <td className="py-1.5 pr-2 text-ink-700">{p.items.map((i) => i.komoditas).join(", ")}</td>
                    <td className="py-1.5 text-right text-ink-900">{p.metodeBayar === "QRIS" ? "Lunas" : formatRupiah(p.total)}</td>
                    <td className="py-1.5 text-center">
                      <span className="inline-block h-4 w-4 rounded border border-ink-400" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}

        <div className="print-keep grid grid-cols-3 gap-4 pt-6 text-center text-xs text-ink-500">
          {["Petugas Lumbung", "Kurir Desa", "Penerima Drop-Point"].map((peran) => (
            <div key={peran}>
              <div className="h-12 border-b border-ink-400" />
              <p className="mt-1">{peran}</p>
            </div>
          ))}
        </div>
      </div>

      <PrintActions cetakLabel="Cetak Surat Jalan" />
    </div>
  );
}
