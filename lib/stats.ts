import type { Komoditas, Pesanan, StatCard } from "@/types";
import { KAS_SUBSIDI } from "@/lib/data/kas";
import { RINGKASAN_PENJUALAN } from "@/lib/data/ringkasan";
import { PRE_ORDER_SAAT_INI } from "@/lib/data/komoditas";
import { BULAN_LAPORAN, JAM_JEMPUT_SORE } from "./constants";
import { formatRupiah } from "./format";
import { pesananEscrow } from "./kas";
import { hitungStatus, hitungTotal } from "./pesanan";
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
}

export function statRingkasan({ komoditas, pesanan, saldoAktif, omset }: DataRingkasan): StatCard[] {
  const kritis = hitungKritis(komoditas);
  return [
    {
      id: "penjualan",
      label: "Total Penjualan Bulan Ini",
      value: formatRupiah(omset),
      helper: `${RINGKASAN_PENJUALAN.transaksi} transaksi terverifikasi`,
      trend: { direction: "up", value: RINGKASAN_PENJUALAN.tren },
    },
    {
      id: "dikemas",
      label: "Pesanan Perlu Dikemas",
      value: `${hitungStatus(pesanan, "perlu-dikemas")} Keranjang Pesanan`,
      helper: `Kurir jemput ${JAM_JEMPUT_SORE}`,
    },
    { id: "saldo", label: "Saldo Kas Siap Dicairkan", value: formatRupiah(saldoAktif), helper: "Kas BUMDes Sukorejo (Nol Potongan)" },
    {
      id: "komoditas",
      label: "Total Komoditas Aktif",
      value: `${hitungTampil(komoditas)} Varietas Hasil Tani`,
      helper: kritis > 0 ? `${kritis} stok kritis (<${AMBANG_KRITIS} unit)` : "Semua stok panen aman",
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
  const dikirim = pesanan.filter((p) => p.status === "sedang-dikemas");
  const jumlahWilayah = new Set(dikirim.map((p) => p.dropPoint)).size;
  return [
    { id: "antrean", label: "Antrean Kemas", value: `${hitungStatus(pesanan, "perlu-dikemas")} Paket`, helper: `Batas jemput ${JAM_JEMPUT_SORE}` },
    { id: "pickup", label: "Siap Pickup Kurir", value: `${hitungStatus(pesanan, "siap-jemput")} Pesanan`, helper: "Mas Slamet on-duty" },
    { id: "antaran", label: "Dalam Antaran", value: `${jumlahWilayah} Wilayah`, helper: `${dikirim.length} pesanan menuju drop-point` },
    { id: "perputaran", label: "Perputaran Hari Ini", value: formatRupiah(hitungTotal(pesanan)), helper: `${pesanan.length} Transaksi total` },
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
    { id: "saldo-aktif", label: "Saldo Aktif Siap Tarik", value: formatRupiah(saldoAktif) },
    { id: "saldo-escrow", label: "Saldo Tertahan (Escrow)", value: formatRupiah(hitungTotal(berjalan)), helper: `${berjalan.length} pesanan berjalan` },
    { id: "omset", label: `Omset Bersih ${BULAN_LAPORAN}`, value: formatRupiah(omset), trend: { direction: "up", value: "Bebas potongan" } },
    { id: "subsidi", label: "Subsidi Ongkir BUMDes", value: formatRupiah(KAS_SUBSIDI), helper: "Reimburse 100% kas desa" },
  ];
}
