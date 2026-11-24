import type { Komoditas, Pesanan, StatCard } from "@/types";
import { PRE_ORDER_SAAT_INI } from "@/lib/data/komoditas";
import { BULAN_LAPORAN, JAM_JEMPUT_SORE } from "./constants";
import { formatRupiah } from "./format";
import { pesananEscrow } from "./kas";
import { hitungStatus, hitungTotal } from "./pesanan";
import { ringkasanBulan } from "./penjualan";
import { AMBANG_KRITIS, hitungKritis, hitungTampil } from "./stok";

// Pembentuk kartu statistik. Semuanya fungsi murni (data masuk → kartu keluar),
// jadi angka di layar selalu dihitung dari data hidup, mudah diuji, dan komponen
// tidak berisi logika hitung.

const toneStok = (kritis: number): StatCard["tone"] => (kritis > 0 ? "warning" : "success");

interface DataRingkasan {
  komoditas: Komoditas[];
  pesanan: Pesanan[];
  saldoAktif: number;
  omset: number;
  /** Waktu sekarang; bila belum ada (render awal), jumlah transaksi & tren bulanan dilewati. */
  sekarang?: Date | null;
}

// Teks kartu sengaja singkat (angka + satu kata) supaya muat satu baris di kartu Dashboard.
export function statRingkasan({ komoditas, pesanan, saldoAktif, omset, sekarang }: DataRingkasan): StatCard[] {
  const kritis = hitungKritis(komoditas);
  const bulan = sekarang ? ringkasanBulan(pesanan, sekarang) : null;
  const tren: StatCard["trend"] = bulan && bulan.perubahanPersen !== null ? { direction: bulan.perubahanPersen >= 0 ? "up" : "down", value: `${Math.abs(bulan.perubahanPersen)}%` } : undefined;
  return [
    {
      id: "penjualan",
      label: "Total Penjualan Bulan Ini",
      value: formatRupiah(omset),
      helper: bulan ? `${bulan.transaksi} transaksi` : undefined,
      trend: tren,
    },
    {
      id: "dikemas",
      label: "Pesanan Perlu Dikemas",
      value: `${hitungStatus(pesanan, "perlu-dikemas")} Pesanan`,
      helper: `Kurir jemput ${JAM_JEMPUT_SORE}`,
    },
    { id: "saldo", label: "Saldo Siap Dicairkan", value: formatRupiah(saldoAktif), helper: "Nol potongan" },
    {
      id: "komoditas",
      label: "Komoditas Aktif",
      value: `${hitungTampil(komoditas)} Varietas`,
      helper: kritis > 0 ? `${kritis} stok kritis` : "Semua stok aman",
      tone: toneStok(kritis),
    },
  ];
}

export function statKomoditas(komoditas: Komoditas[]): StatCard[] {
  const aktif = hitungTampil(komoditas);
  const kritis = hitungKritis(komoditas);
  return [
    { id: "aktif", label: "Komoditas Aktif", value: String(aktif), helper: `Siap diorder · ${komoditas.length - aktif} disembunyikan` },
    { id: "restok", label: "Perlu Restok Panen", value: String(kritis), helper: `Kritis (<${AMBANG_KRITIS} unit)`, tone: toneStok(kritis) },
    { id: "musim", label: "Musim Tanam / Pre-Order", value: String(PRE_ORDER_SAAT_INI.jumlah), helper: PRE_ORDER_SAAT_INI.estimasi },
  ];
}

export function statPesanan(pesanan: Pesanan[]): StatCard[] {
  const dikirim = pesanan.filter((p) => p.status === "diantar" || p.status === "tiba-di-pos");
  const jumlahWilayah = new Set(dikirim.map((p) => p.dropPoint)).size;
  return [
    { id: "antrean", label: "Antrean Kemas", value: `${hitungStatus(pesanan, "perlu-dikemas")} Paket`, helper: `Batas jemput ${JAM_JEMPUT_SORE}` },
    { id: "pickup", label: "Siap Pickup Kurir", value: `${hitungStatus(pesanan, "siap-jemput")} Pesanan`, helper: "Mas Slamet on-duty" },
    { id: "antaran", label: "Dalam Antaran", value: `${jumlahWilayah} Wilayah`, helper: `${dikirim.length} pesanan menuju drop-point` },
  ];
}

interface DataKas {
  pesanan: Pesanan[];
  saldoAktif: number;
  omset: number;
}

export function statKas({ pesanan, saldoAktif, omset }: DataKas): StatCard[] {
  const berjalan = pesananEscrow(pesanan);
  return [
    { id: "saldo-aktif", label: "Saldo Aktif Siap Tarik", value: formatRupiah(saldoAktif), helper: "Bisa ditarik kapan saja" },
    { id: "saldo-escrow", label: "Saldo Tertahan (Escrow)", value: formatRupiah(hitungTotal(berjalan)), helper: `${berjalan.length} pesanan berjalan` },
    { id: "omset", label: `Omset Bersih ${BULAN_LAPORAN}`, value: formatRupiah(omset), helper: "Bebas potongan" },
  ];
}
