import type { Pesanan } from "@/types";
import { ZONA_WAKTU, formatNumber, formatTanggal, isoTanggal } from "./format";

// ---------------------------------------------------------------------------
// Penjualan per hari, komoditas terlaris, dan laporan pesanan.
//
// Semua fungsi murni (data masuk → hasil keluar). Yang dihitung hanya pesanan
// berstatus "selesai" (penjualan yang sudah terealisasi), dikelompokkan per
// tanggal WIB dari `dibuatPada`. Pesanan tanpa `dibuatPada` dilewati.
// ---------------------------------------------------------------------------

const MS_HARI = 86_400_000;

export type PeriodeChart = 7 | 30;

export interface TitikPenjualan {
  /** Tanggal WIB "YYYY-MM-DD". */
  tanggal: string;
  nilai: number;
}

export interface DataPenjualanHarian {
  /** Periode ini: `hari` titik, dari yang terlama sampai hari ini. */
  sekarang: TitikPenjualan[];
  /** Periode sebelumnya dengan panjang sama, sejajar per indeks dengan `sekarang`. */
  sebelumnya: TitikPenjualan[];
  total: number;
  totalSebelumnya: number;
  /** Perubahan total vs periode sebelumnya dalam persen (dibulatkan); null bila periode sebelumnya 0. */
  perubahanPersen: number | null;
}

export const pesananSelesai = (pesanan: Pesanan[]): Pesanan[] => pesanan.filter((p) => p.status === "selesai" && !!p.dibuatPada);

const kunciHari = (p: Pesanan): string => isoTanggal(new Date(p.dibuatPada as string));

/** Daftar tanggal WIB berurutan (lama → baru) sebanyak `jumlah` hari berakhir di `akhir`. */
export function daftarHari(akhir: Date, jumlah: number): string[] {
  return Array.from({ length: jumlah }, (_, i) => isoTanggal(new Date(akhir.getTime() - (jumlah - 1 - i) * MS_HARI)));
}

function jumlahPerHari(pesanan: Pesanan[]): Map<string, number> {
  const peta = new Map<string, number>();
  for (const p of pesananSelesai(pesanan)) peta.set(kunciHari(p), (peta.get(kunciHari(p)) ?? 0) + p.total);
  return peta;
}

export function penjualanHarian(pesanan: Pesanan[], hari: PeriodeChart, sekarang: Date): DataPenjualanHarian {
  const peta = jumlahPerHari(pesanan);
  const titik = (tgl: string): TitikPenjualan => ({ tanggal: tgl, nilai: peta.get(tgl) ?? 0 });
  const saatIni = daftarHari(sekarang, hari).map(titik);
  const sebelumnya = daftarHari(new Date(sekarang.getTime() - hari * MS_HARI), hari).map(titik);
  const jumlah = (l: TitikPenjualan[]) => l.reduce((s, t) => s + t.nilai, 0);
  const total = jumlah(saatIni);
  const totalSebelumnya = jumlah(sebelumnya);
  return {
    sekarang: saatIni,
    sebelumnya,
    total,
    totalSebelumnya,
    perubahanPersen: totalSebelumnya > 0 ? Math.round(((total - totalSebelumnya) / totalSebelumnya) * 100) : null,
  };
}

export interface RingkasanBulan {
  /** Jumlah pesanan selesai bulan ini (WIB). */
  transaksi: number;
  /** Perubahan total penjualan vs bulan lalu (%); null bila bulan lalu 0. */
  perubahanPersen: number | null;
}

export function ringkasanBulan(pesanan: Pesanan[], sekarang: Date): RingkasanBulan {
  const bulanIni = isoTanggal(sekarang).slice(0, 7);
  const [t, b] = bulanIni.split("-").map(Number);
  const bulanLalu = b === 1 ? `${t - 1}-12` : `${t}-${String(b - 1).padStart(2, "0")}`;
  let transaksi = 0;
  let totalIni = 0;
  let totalLalu = 0;
  for (const p of pesananSelesai(pesanan)) {
    const bln = kunciHari(p).slice(0, 7);
    if (bln === bulanIni) {
      transaksi += 1;
      totalIni += p.total;
    } else if (bln === bulanLalu) totalLalu += p.total;
  }
  return { transaksi, perubahanPersen: totalLalu > 0 ? Math.round(((totalIni - totalLalu) / totalLalu) * 100) : null };
}

export interface KomoditasTerlaris {
  nama: string;
  nilai: number;
  /** Porsi terhadap total penjualan periode (0–100, dibulatkan). */
  persen: number;
}

export interface RingkasanTerlaris {
  top: KomoditasTerlaris[];
  /** Porsi komoditas di luar `top` (0–100). */
  persenLain: number;
  total: number;
}

// Nilai per komoditas = jumlah subtotal item pada pesanan selesai dalam `hari` hari terakhir.
export function komoditasTerlaris(pesanan: Pesanan[], hari: PeriodeChart, sekarang: Date, n = 5): RingkasanTerlaris {
  const dalam = new Set(daftarHari(sekarang, hari));
  const peta = new Map<string, number>();
  for (const p of pesananSelesai(pesanan)) {
    if (!dalam.has(kunciHari(p))) continue;
    for (const i of p.items) peta.set(i.komoditas, (peta.get(i.komoditas) ?? 0) + i.subtotal);
  }
  const total = Array.from(peta.values()).reduce((a, b) => a + b, 0);
  const urut = Array.from(peta, ([nama, nilai]) => ({ nama, nilai })).sort((a, b) => b.nilai - a.nilai || a.nama.localeCompare(b.nama));
  const top = urut.slice(0, n).map((k) => ({ ...k, persen: total > 0 ? Math.round((k.nilai / total) * 100) : 0 }));
  return { top, persenLain: total > 0 ? Math.max(0, 100 - top.reduce((s, k) => s + k.persen, 0)) : 0, total };
}

// ---------------------------------------------------------------------------
// Laporan Pesanan (tombol "Cetak Laporan" di halaman Pesanan)
// ---------------------------------------------------------------------------
export type PilihanRentang = "hari-ini" | "7-hari" | "30-hari" | "bulan-ini" | "kustom";

export const LABEL_RENTANG: Record<PilihanRentang, string> = {
  "hari-ini": "Hari Ini",
  "7-hari": "7 Hari",
  "30-hari": "30 Hari",
  "bulan-ini": "Bulan Ini",
  kustom: "Kustom",
};

export interface RentangTanggal {
  /** "YYYY-MM-DD" (WIB), inklusif. */
  dari: string;
  sampai: string;
}

export function rentangDari(pilihan: Exclude<PilihanRentang, "kustom">, sekarang: Date): RentangTanggal {
  const hariIni = isoTanggal(sekarang);
  switch (pilihan) {
    case "hari-ini":
      return { dari: hariIni, sampai: hariIni };
    case "7-hari":
      return { dari: daftarHari(sekarang, 7)[0], sampai: hariIni };
    case "30-hari":
      return { dari: daftarHari(sekarang, 30)[0], sampai: hariIni };
    case "bulan-ini":
      return { dari: `${hariIni.slice(0, 8)}01`, sampai: hariIni };
  }
}

/** Rentang valid bila kedua tanggal terisi dan `dari` tidak setelah `sampai` ("YYYY-MM-DD" bisa dibandingkan sebagai teks). */
export const rentangValid = (r: RentangTanggal): boolean => /^\d{4}-\d{2}-\d{2}$/.test(r.dari) && /^\d{4}-\d{2}-\d{2}$/.test(r.sampai) && r.dari <= r.sampai;

/** Pesanan selesai yang dibuat dalam rentang (inklusif), terbaru lebih dulu. */
export function pesananDalamRentang(pesanan: Pesanan[], r: RentangTanggal): Pesanan[] {
  return pesananSelesai(pesanan)
    .filter((p) => kunciHari(p) >= r.dari && kunciHari(p) <= r.sampai)
    .sort((a, b) => Date.parse(b.dibuatPada as string) - Date.parse(a.dibuatPada as string));
}

export interface RingkasanLaporan {
  jumlah: number;
  total: number;
  rataRata: number;
}

export function ringkasLaporan(daftar: Pesanan[]): RingkasanLaporan {
  const total = daftar.reduce((s, p) => s + p.total, 0);
  return { jumlah: daftar.length, total, rataRata: daftar.length > 0 ? Math.round(total / daftar.length) : 0 };
}

// "10 Nov 2026 – 23 Nov 2026" (satu hari: "23 Nov 2026").
export function labelRentang(r: RentangTanggal): string {
  const f = (iso: string) => new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: ZONA_WAKTU }).format(new Date(`${iso}T12:00:00+07:00`));
  return r.dari === r.sampai ? f(r.dari) : `${f(r.dari)} – ${f(r.sampai)}`;
}

const jamWib = (iso: string) => new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: ZONA_WAKTU }).format(new Date(iso)).replace(".", ":");

// Baris CSV: ringkasan di atas, lalu satu baris per pesanan. Angka rupiah ditulis polos agar bisa dijumlah di Excel.
export function barisCsvLaporan(daftar: Pesanan[], r: RentangTanggal): (string | number)[][] {
  const ring = ringkasLaporan(daftar);
  return [
    ["Laporan Pesanan Selesai PasarDesa"],
    ["Periode", labelRentang(r)],
    ["Jumlah pesanan", ring.jumlah],
    ["Total penjualan (Rp)", ring.total],
    ["Rata-rata per pesanan (Rp)", ring.rataRata],
    [],
    ["Kode Pesanan", "Tanggal", "Jam (WIB)", "Pembeli", "Komoditas", "Pembayaran", "Total (Rp)"],
    ...daftar.map((p) => [
      p.id,
      formatTanggal(new Date(p.dibuatPada as string)),
      jamWib(p.dibuatPada as string),
      p.pembeli,
      p.items.map((i) => `${i.komoditas} (${i.jumlah})`).join("; "),
      p.metodeBayar,
      p.total,
    ]),
  ];
}

export const namaFileLaporan = (r: RentangTanggal): string => `laporan-pesanan-${r.dari}${r.dari === r.sampai ? "" : `_sd_${r.sampai}`}.csv`;

export const formatJumlahPesanan = (n: number): string => `${formatNumber(n)} pesanan`;
