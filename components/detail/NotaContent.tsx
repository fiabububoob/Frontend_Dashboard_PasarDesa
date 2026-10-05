"use client";

import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { STATUS_LABEL } from "@/lib/pesanan";
import { PrintActions } from "./PrintActions";

// Nota pembelian + label tempel untuk drop-point. Hanya area .print-area yang
// tercetak (lihat @media print di globals.css); label diberi halaman sendiri
// supaya bisa dipotong/ditempel terpisah dari nota.
export function NotaContent({ id }: { id: string }) {
  const { pesanan } = useDashboardData();
  const p = pesanan.find((x) => x.id === id);
  if (!p) return <p className="text-sm text-ink-500">Pesanan tidak ditemukan.</p>;

  const subtotal = p.items.reduce((sum, i) => sum + i.subtotal, 0);
  const tanggal = formatTanggal(new Date());

  return (
    <div className="space-y-4 text-sm">
      <div className="print-area space-y-6">
        <section className="print-keep space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-base font-bold text-ink-900">NOTA PEMBELIAN</p>
              <p className="text-xs text-ink-500">BUMDes Sukorejo · Poktan Krajan Makmur</p>
            </div>
            <div className="text-right text-xs text-ink-500">
              <p className="font-medium text-ink-900">#{p.id}</p>
              <p>
                {tanggal} · {p.waktu}
              </p>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-3 rounded-lg border border-line p-3 text-xs">
            <div>
              <dt className="text-ink-500">Pembeli</dt>
              <dd className="font-medium text-ink-900">{p.pembeli}</dd>
              <dd className="text-ink-500">{p.alamat}</dd>
            </div>
            <div>
              <dt className="text-ink-500">Drop-point</dt>
              <dd className="font-medium text-ink-900">{p.dropPoint}</dd>
              <dd className="text-ink-500">Bayar: {p.metodeBayar === "QRIS" ? "QRIS (lunas)" : "COD (bayar di tempat)"}</dd>
            </div>
          </dl>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-line text-ink-500">
                <th className="py-1.5 font-medium">Komoditas</th>
                <th className="py-1.5 font-medium">Jumlah</th>
                <th className="py-1.5 text-right font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {p.items.map((i) => (
                <tr key={i.komoditas}>
                  <td className="py-1.5 text-ink-900">{i.komoditas}</td>
                  <td className="py-1.5 text-ink-700">{i.jumlah}</td>
                  <td className="py-1.5 text-right text-ink-900">{formatRupiah(i.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-ink-500">
              <span>Subtotal</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between text-ink-500">
              <span>Ongkir kurir desa − subsidi BUMDes</span>
              <span>{formatRupiah(0)}</span>
            </div>
            <div className="flex justify-between border-t border-line pt-1.5 text-sm font-semibold text-ink-900">
              <span>{p.metodeBayar === "QRIS" ? "Total (Lunas)" : "Total Bayar di Tempat"}</span>
              <span>{formatRupiah(p.total)}</span>
            </div>
          </div>
        </section>

        <section className="print-break print-keep">
          <p className="mb-2 text-xs font-medium uppercase text-ink-400">Label Drop-Point</p>
          <div className="rounded-xl border-2 border-dashed border-ink-400 p-4">
            <p className="text-xs text-ink-500">TUJUAN</p>
            <p className="font-display text-xl font-bold text-ink-900">{p.dropPoint}</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-ink-500">Penerima</p>
                <p className="text-base font-semibold text-ink-900">{p.pembeli}</p>
                <p className="text-ink-500">{p.alamat}</p>
              </div>
              <div>
                <p className="text-ink-500">No. Pesanan</p>
                <p className="font-semibold text-ink-900">#{p.id}</p>
                <p className="text-ink-500">
                  {p.items.length} jenis · {p.metodeBayar === "QRIS" ? "LUNAS" : `COD ${formatRupiah(p.total)}`}
                </p>
              </div>
            </div>
            {p.catatan && <p className="mt-3 rounded-lg bg-surface-muted p-2 text-xs italic text-ink-700">Catatan: &ldquo;{p.catatan}&rdquo;</p>}
            <p className="mt-3 text-[11px] text-ink-400">Status: {STATUS_LABEL[p.status]}</p>
          </div>
        </section>
      </div>

      <PrintActions />
    </div>
  );
}
