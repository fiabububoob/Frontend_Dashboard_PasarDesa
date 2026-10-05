"use client";

import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { KAS_SUBSIDI } from "@/lib/data/kas";
import { BULAN_LAPORAN, PERIODE_LAPORAN } from "@/lib/constants";
import { hitungEscrow } from "@/lib/kas";
import { PrintActions } from "./PrintActions";

// "Download Laporan (.PDF)": pratinjau laporan kas yang dicetak lewat dialog
// cetak browser — pilih "Simpan sebagai PDF" sebagai printer untuk mendapatkan file PDF.
export function LaporanKasContent() {
  const { transaksi, saldoAktif, omset, pesanan, rekening } = useDashboardData();

  const masuk = transaksi.filter((t) => t.nominal > 0).reduce((s, t) => s + t.nominal, 0);
  const keluar = transaksi.filter((t) => t.nominal < 0).reduce((s, t) => s + t.nominal, 0);
  const escrow = hitungEscrow(pesanan);
  const tanggal = formatTanggal(new Date(), "full");

  return (
    <div className="space-y-4 text-sm">
      <div className="print-area space-y-4">
        <div>
          <p className="font-display text-base font-bold text-ink-900">LAPORAN KAS POKTAN — {PERIODE_LAPORAN.toUpperCase()}</p>
          <p className="text-xs text-ink-500">
            Buku Kas Digital No. REG-041/SKR/2023 · Dicetak {tanggal}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
          {[
            ["Saldo aktif siap tarik", formatRupiah(saldoAktif)],
            ["Saldo tertahan (escrow)", formatRupiah(escrow)],
            [`Omset bersih ${BULAN_LAPORAN}`, formatRupiah(omset)],
            ["Subsidi ongkir BUMDes", formatRupiah(KAS_SUBSIDI)],
            ["Total dana masuk (riwayat)", formatRupiah(masuk)],
            ["Total dana keluar (riwayat)", formatRupiah(keluar)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-line p-3">
              <dt className="text-ink-500">{label}</dt>
              <dd className="mt-0.5 text-sm font-semibold text-ink-900">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="text-xs text-ink-500">
          Rekening pencairan: {rekening.bank} · {rekening.nomor} a.n. {rekening.atasNama}
        </p>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-line text-ink-500">
              <th className="py-1.5 font-medium">Tanggal</th>
              <th className="py-1.5 font-medium">Deskripsi</th>
              <th className="py-1.5 text-right font-medium">Nominal</th>
              <th className="py-1.5 text-right font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {transaksi.map((t) => (
              <tr key={t.id} className="print-keep">
                <td className="py-1.5 pr-2 text-ink-700">
                  {t.tanggal}
                  <span className="block text-ink-400">{t.waktu}</span>
                </td>
                <td className="py-1.5 pr-2">
                  <span className="block font-medium text-ink-900">{t.deskripsi}</span>
                  <span className="text-ink-400">{t.referensi}</span>
                </td>
                <td className={`py-1.5 text-right font-medium ${t.nominal < 0 ? "text-danger-600" : "text-brand-600"}`}>
                  {t.nominal < 0 ? "-" : "+"}
                  {formatRupiah(Math.abs(t.nominal))}
                </td>
                <td className="py-1.5 text-right text-ink-700">{t.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PrintActions cetakLabel="Cetak / Simpan sebagai PDF" />
    </div>
  );
}
