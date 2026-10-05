"use client";

import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { StatusBadge } from "@/components/pesanan/StatusBadge";
import { TREN_PANEN, TREN_SERIES, KURIR_AKTIF } from "@/lib/data/ringkasan";
import { formatNumber, formatRupiah, formatTanggal } from "@/lib/format";
import { hitungStatus, perluDijemput } from "@/lib/pesanan";
import { PrintActions } from "./PrintActions";

export function RekapContent() {
  const { komoditas, pesanan, saldoAktif, omset } = useDashboardData();
  const hariIni = TREN_PANEN[TREN_PANEN.length - 1];
  const kritis = komoditas.filter((k) => k.statusStok === "kritis");
  const siap = hitungStatus(pesanan, "siap-jemput");
  const perluDikemas = hitungStatus(pesanan, "perlu-dikemas");
  const tanggal = formatTanggal(new Date(), "full");

  return (
    <div className="print-area space-y-5 text-sm">
      <div>
        <p className="text-xs text-ink-500">BUMDes Sukorejo · Poktan Krajan Makmur</p>
        <p className="font-display text-base font-bold text-ink-900">Rekap Hari Ini — {tanggal}</p>
      </div>

      <dl className="grid grid-cols-2 gap-3">
        {[
          ["Total Penjualan Bulan Ini", formatRupiah(omset)],
          ["Saldo Siap Dicairkan", formatRupiah(saldoAktif)],
          ["Pesanan Perlu Dikemas", `${perluDikemas} keranjang`],
          ["Paket Siap Dijemput", `${siap} paket`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-line p-3">
            <dt className="text-xs text-ink-500">{label}</dt>
            <dd className="mt-0.5 font-semibold text-ink-900">{value}</dd>
          </div>
        ))}
      </dl>

      <div>
        <p className="text-xs font-medium uppercase text-ink-400">Panen masuk hari ini</p>
        <ul className="mt-2 divide-y divide-line rounded-lg border border-line">
          {TREN_SERIES.map((s) => (
            <li key={s.key} className="flex justify-between px-3 py-2">
              <span className="text-ink-700">{s.key}</span>
              <span className="font-medium text-ink-900">
                {formatNumber(hariIni[s.key])} kg · {formatRupiah(hariIni[s.key] * s.hargaPerKg)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-xs font-medium uppercase text-ink-400">Antrean pesanan</p>
        <ul className="mt-2 divide-y divide-line rounded-lg border border-line">
          {pesanan.filter(perluDijemput).map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-2 px-3 py-2">
              <span>
                <span className="block font-medium text-ink-900">#{p.id}</span>
                <span className="block text-xs text-ink-500">
                  {p.pembeli} · {p.dropPoint}
                </span>
              </span>
              <StatusBadge status={p.status} />
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-xs font-medium uppercase text-ink-400">Stok kritis</p>
        {kritis.length === 0 ? (
          <p className="mt-2 text-ink-500">Semua stok aman.</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {kritis.map((k) => (
              <li key={k.id} className="text-danger-600">
                {k.nama}: tersisa {k.stok} {k.satuan}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-ink-500">
        Kurir bertugas: {KURIR_AKTIF.nama} · tiba {KURIR_AKTIF.estimasi}
      </p>

      <PrintActions />
    </div>
  );
}
