"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Drawer } from "@/components/ui/Drawer";
import { useToast } from "@/components/ui/Toast";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { useDetail } from "./DetailProvider";
import { downloadCsv } from "@/lib/csv";
import { formatRupiah, formatTanggal, isoTanggal } from "@/lib/format";
import { useSekarang } from "@/lib/hooks/useSekarang";
import {
  LABEL_RENTANG,
  barisCsvLaporan,
  labelRentang,
  namaFileLaporan,
  pesananDalamRentang,
  rentangDari,
  rentangValid,
  ringkasLaporan,
  type PilihanRentang,
  type RentangTanggal,
} from "@/lib/penjualan";

const PILIHAN: PilihanRentang[] = ["hari-ini", "7-hari", "30-hari", "bulan-ini", "kustom"];
const TANGGAL_INPUT = "w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

// Panel "Cetak Laporan" di halaman Pesanan: pilih rentang waktu → ringkasan → unduh CSV atau cetak / simpan PDF.
// Yang dilaporkan: pesanan berstatus Selesai (penjualan terealisasi), dikelompokkan per tanggal pesanan dibuat (WIB).
export function LaporanPesananDrawer() {
  const { pesanan } = useDashboardData();
  const sekarang = useSekarang();
  const toast = useToast();
  const { close } = useDetail();

  const [pilihan, setPilihan] = useState<PilihanRentang>("7-hari");
  const [kustom, setKustom] = useState<RentangTanggal>({ dari: "", sampai: "" });

  const hariIni = sekarang ? isoTanggal(sekarang) : "";
  const rentang: RentangTanggal | null = !sekarang ? null : pilihan === "kustom" ? kustom : rentangDari(pilihan, sekarang);
  const valid = !!rentang && rentangValid(rentang);
  const daftar = useMemo(() => (rentang && valid ? pesananDalamRentang(pesanan, rentang) : []), [pesanan, rentang, valid]);
  const ringkas = ringkasLaporan(daftar);

  // Pindah ke "Kustom": isi awal dengan rentang yang sedang dipilih supaya tidak mulai dari kosong.
  function pilih(p: PilihanRentang) {
    if (p === "kustom" && rentang && kustom.dari === "" && kustom.sampai === "") setKustom(rentang);
    setPilihan(p);
  }

  function unduhCsv() {
    if (!rentang || !valid) return;
    downloadCsv(namaFileLaporan(rentang), barisCsvLaporan(daftar, rentang));
    toast({ type: "success", title: "Laporan diunduh", description: namaFileLaporan(rentang) });
  }

  const salahTanggal = pilihan === "kustom" && kustom.dari !== "" && kustom.sampai !== "" && kustom.dari > kustom.sampai;
  const bisaAksi = valid && daftar.length > 0;

  return (
    <Drawer
      title="Cetak Laporan Pesanan"
      subtitle="Pilih rentang waktu laporan"
      onClose={close}
      footer={(tutup) => (
        <>
          <Button variant="secondary" onClick={tutup}>
            Batal
          </Button>
          <div className="ml-auto flex gap-2">
            <Button variant="secondary" disabled={!bisaAksi} onClick={unduhCsv}>
              <Download className="h-4 w-4" />
              Unduh CSV
            </Button>
            <Button disabled={!bisaAksi} onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Cetak / Simpan PDF
            </Button>
          </div>
        </>
      )}
    >
      <div className="space-y-5 text-sm">
        <div>
          <p id="rentang-label" className="mb-2 text-xs font-medium text-ink-700">
            Rentang waktu
          </p>
          <div role="group" aria-labelledby="rentang-label" className="flex flex-wrap gap-2">
            {PILIHAN.map((p) => (
              <Chip key={p} selected={pilihan === p} className="px-3.5 py-1.5" onClick={() => pilih(p)}>
                {LABEL_RENTANG[p]}
              </Chip>
            ))}
          </div>
        </div>

        {pilihan === "kustom" && (
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-medium text-ink-700">
              Dari tanggal
              <input type="date" value={kustom.dari} max={kustom.sampai || hariIni} onChange={(e) => setKustom((k) => ({ ...k, dari: e.target.value }))} className={`mt-1.5 ${TANGGAL_INPUT}`} />
            </label>
            <label className="block text-xs font-medium text-ink-700">
              Sampai tanggal
              <input type="date" value={kustom.sampai} min={kustom.dari || undefined} max={hariIni} onChange={(e) => setKustom((k) => ({ ...k, sampai: e.target.value }))} className={`mt-1.5 ${TANGGAL_INPUT}`} />
            </label>
          </div>
        )}

        {salahTanggal && (
          <p role="alert" className="text-xs text-danger-600">
            Tanggal awal tidak boleh setelah tanggal akhir.
          </p>
        )}

        <dl className="space-y-1.5 rounded-xl border border-brand-200 bg-brand-50 p-4" aria-live="polite">
          {[
            ["Periode", valid && rentang ? labelRentang(rentang) : "-"],
            ["Jumlah pesanan", valid ? `${ringkas.jumlah} pesanan` : "-"],
            ["Total penjualan", valid ? formatRupiah(ringkas.total) : "-"],
            ["Rata-rata per pesanan", valid ? formatRupiah(ringkas.rataRata) : "-"],
          ].map(([label, nilai]) => (
            <div key={label} className="flex justify-between gap-3">
              <dt className="text-ink-700">{label}</dt>
              <dd className="font-semibold text-ink-900">{nilai}</dd>
            </div>
          ))}
        </dl>

        {valid && daftar.length === 0 && <p className="text-xs text-ink-500">Tidak ada pesanan selesai pada rentang ini, jadi laporan belum bisa dicetak atau diunduh.</p>}
        <p className="text-xs text-ink-500">
          Hanya pesanan berstatus Selesai yang dihitung. &quot;Cetak&quot; membuka dialog cetak; dari sana laporan juga bisa disimpan sebagai PDF.
        </p>
      </div>

      {/* Lembar cetak: tersembunyi di layar, hanya muncul saat dicetak (.print-area, lihat globals.css). */}
      {bisaAksi && rentang && typeof document !== "undefined" && createPortal(<LembarCetak daftar={daftar} rentang={rentang} />, document.body)}
    </Drawer>
  );
}

function LembarCetak({ daftar, rentang }: { daftar: ReturnType<typeof pesananDalamRentang>; rentang: RentangTanggal }) {
  const ringkas = ringkasLaporan(daftar);
  return (
    <div className="print-area hidden space-y-4 bg-white p-6 text-sm text-ink-900 print:block">
      <div>
        <p className="text-xs text-ink-500">BUMDes Sukorejo · PasarDesa</p>
        <p className="font-display text-lg font-bold">Laporan Pesanan Selesai</p>
        <p className="text-xs text-ink-500">
          Periode {labelRentang(rentang)} · dicetak {formatTanggal(new Date(), "long")}
        </p>
      </div>

      <dl className="grid grid-cols-3 gap-3 text-xs">
        {[
          ["Jumlah pesanan", `${ringkas.jumlah} pesanan`],
          ["Total penjualan", formatRupiah(ringkas.total)],
          ["Rata-rata per pesanan", formatRupiah(ringkas.rataRata)],
        ].map(([label, nilai]) => (
          <div key={label} className="rounded-lg border border-line p-3">
            <dt className="text-ink-500">{label}</dt>
            <dd className="mt-0.5 font-semibold">{nilai}</dd>
          </div>
        ))}
      </dl>

      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-ink-400 text-ink-500">
            <th className="py-1.5 pr-2 font-medium">Tanggal</th>
            <th className="py-1.5 pr-2 font-medium">Kode Pesanan</th>
            <th className="py-1.5 pr-2 font-medium">Pembeli</th>
            <th className="py-1.5 pr-2 font-medium">Komoditas</th>
            <th className="py-1.5 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {daftar.map((p) => (
            <tr key={p.id} className="print-keep align-top">
              <td className="whitespace-nowrap py-1.5 pr-2">{formatTanggal(new Date(p.dibuatPada as string))}</td>
              <td className="py-1.5 pr-2 font-medium">#{p.id}</td>
              <td className="py-1.5 pr-2">{p.pembeli}</td>
              <td className="py-1.5 pr-2">{p.items.map((i) => i.komoditas).join(", ")}</td>
              <td className="whitespace-nowrap py-1.5 text-right">{formatRupiah(p.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
