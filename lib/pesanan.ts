import type { MetodeBayar, OpsiPengiriman, Pesanan, StatusPesanan, TabPesanan } from "@/types";
import { PELEPASAN_OTOMATIS_JAM } from "./constants";

// ---------------------------------------------------------------------------
// Aturan status pesanan — fungsi murni, mudah diuji.
// ---------------------------------------------------------------------------
export const STATUS_LABEL: Record<StatusPesanan, string> = {
  "menunggu-pembayaran": "Menunggu Pembayaran",
  "perlu-dikemas": "Perlu Dikemas",
  "siap-jemput": "Siap Jemput",
  diantar: "Dalam Antaran",
  "tiba-di-pos": "Tiba di Pos",
  komplain: "Komplain",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

// Label status yang mengikuti cara pesanan sampai ke pembeli: untuk ambil mandiri, "Tiba di Pos" berarti "Siap Diambil".
export function labelStatus(p: Pick<Pesanan, "status" | "opsiPengiriman">): string {
  return p.status === "tiba-di-pos" && p.opsiPengiriman === "ambil-mandiri" ? "Siap Diambil di Pos" : STATUS_LABEL[p.status];
}

export type PeranPesanan = "sistem" | "penjual" | "pembeli";

export interface LangkahStatus {
  ke: StatusPesanan;
  /** Siapa yang boleh memicu perpindahan ini (keputusan D4). */
  oleh: PeranPesanan;
}

// Langkah berikutnya untuk sebuah pesanan, atau null bila sudah di ujung alur (selesai/dibatalkan).
// Ambil mandiri tidak memakai kurir: begitu dikemas, penjual langsung menandai paket siap diambil di pos
// (status "tiba-di-pos"), tanpa tahap siap-jemput/diantar. "siap-jemput" tersisa hanya untuk data lama.
export function langkahBerikutnya(p: Pick<Pesanan, "status" | "opsiPengiriman">): LangkahStatus | null {
  const mandiri = p.opsiPengiriman === "ambil-mandiri";
  switch (p.status) {
    case "menunggu-pembayaran":
      return { ke: "perlu-dikemas", oleh: "sistem" }; // pembayaran terverifikasi (webhook)
    case "perlu-dikemas":
      return mandiri ? { ke: "tiba-di-pos", oleh: "penjual" } : { ke: "siap-jemput", oleh: "penjual" };
    case "siap-jemput":
      return mandiri ? { ke: "tiba-di-pos", oleh: "penjual" } : { ke: "diantar", oleh: "penjual" };
    case "diantar":
      return { ke: "tiba-di-pos", oleh: "penjual" };
    case "tiba-di-pos":
      return { ke: "selesai", oleh: "pembeli" }; // "Pesanan Diterima" → dana dilepas ke kas penjual
    default:
      return null;
  }
}

/** Status ketika dana pembeli sudah dibayar tetapi belum dilepas ke penjual (escrow). */
export const STATUS_ESCROW: StatusPesanan[] = ["perlu-dikemas", "siap-jemput", "diantar", "tiba-di-pos", "komplain"];

const STATUS_BUTUH_KURIR: StatusPesanan[] = ["siap-jemput", "diantar", "tiba-di-pos", "komplain", "selesai"];

// Kurir ditugaskan BUMDes begitu paket siap; pesanan ambil mandiri tidak memakai kurir.
export const butuhKurir = (p: Pick<Pesanan, "opsiPengiriman">, status: StatusPesanan): boolean =>
  p.opsiPengiriman === "kurir-desa" && STATUS_BUTUH_KURIR.includes(status);

// Menerapkan perpindahan status; mencatat waktu tiba di pos untuk hitungan pelepasan otomatis.
export function terapkanStatus(p: Pesanan, status: StatusPesanan, sekarang: Date): Pesanan {
  return { ...p, status, tibaDiPosPada: status === "tiba-di-pos" ? sekarang.toISOString() : p.tibaDiPosPada };
}

// ---------------------------------------------------------------------------
// Pelepasan dana otomatis (keputusan D7)
// ---------------------------------------------------------------------------
const MS_PER_JAM = 3_600_000;

export function jatuhTempoPelepasan(p: Pick<Pesanan, "status" | "tibaDiPosPada">): Date | undefined {
  if (p.status !== "tiba-di-pos" || !p.tibaDiPosPada) return undefined;
  return new Date(Date.parse(p.tibaDiPosPada) + PELEPASAN_OTOMATIS_JAM * MS_PER_JAM);
}

// Pesanan yang sudah melewati batas waktu dan harus diselesaikan otomatis.
export function pesananJatuhTempo(daftar: Pesanan[], sekarang: Date): Pesanan[] {
  return daftar.filter((p) => {
    const batas = jatuhTempoPelepasan(p);
    return batas !== undefined && batas.getTime() <= sekarang.getTime();
  });
}

// "sekitar 22 jam lagi" / "kurang dari 1 jam lagi"; undefined bila tidak berlaku.
export function sisaWaktuPelepasan(p: Pick<Pesanan, "status" | "tibaDiPosPada">, sekarang: Date): string | undefined {
  const batas = jatuhTempoPelepasan(p);
  if (!batas) return undefined;
  const sisaJam = Math.ceil((batas.getTime() - sekarang.getTime()) / MS_PER_JAM);
  if (sisaJam <= 0) return "segera";
  return sisaJam === 1 ? "kurang dari 1 jam lagi" : `sekitar ${sisaJam} jam lagi`;
}

// ---------------------------------------------------------------------------
// Pembayaran & pengiriman (label)
// ---------------------------------------------------------------------------
export const LABEL_METODE_BAYAR: Record<MetodeBayar, string> = {
  QRIS: "QRIS",
  MIDTRANS: "Midtrans (QRIS / VA / e-wallet)",
  COD: "COD (bayar di tempat)",
  SALDO: "Saldo PasarDesa", // keputusan D5: satu nama untuk saldo pembeli
};

export const LABEL_OPSI_PENGIRIMAN: Record<OpsiPengiriman, string> = {
  "kurir-desa": "Kurir Desa",
  "ambil-mandiri": "Ambil mandiri di pos",
};

type DataBayar = Pick<Pesanan, "metodeBayar" | "status" | "statusPembayaran" | "jenisPembayaran" | "kanalPembayaran">;

// Nama jenis pembayaran Midtrans yang ramah dibaca ("VA BCA", "QRIS", "GoPay", ...).
export function labelJenisBayar(jenis?: string, kanal?: string): string {
  const bank = (kanal ?? "").toUpperCase();
  switch (jenis) {
    case "bank_transfer":
      return bank ? `VA ${bank}` : "Virtual Account";
    case "echannel":
      return "VA Mandiri";
    case "qris":
      return "QRIS";
    case "gopay":
      return "GoPay";
    case "shopeepay":
      return "ShopeePay";
    case "credit_card":
      return "Kartu Kredit";
    case "cstore":
      return "Minimarket";
    default:
      return jenis || "Midtrans";
  }
}

// Sudah dibayar secara digital. Bila status gateway diketahui, itulah yang menentukan (bukan status pesanan).
// COD dibayar saat pengambilan, jadi tidak pernah "lunas" di muka.
export const sudahLunas = (p: Pick<Pesanan, "metodeBayar" | "status" | "statusPembayaran">): boolean => {
  if (p.statusPembayaran) return p.statusPembayaran === "lunas" && p.status !== "dibatalkan";
  return p.metodeBayar !== "COD" && p.status !== "menunggu-pembayaran" && p.status !== "dibatalkan";
};

// Teks singkat untuk badge: "QRIS Lunas", "VA BCA Lunas", "Saldo Lunas", "COD Kasir", "Menunggu Bayar", "Perlu Refund".
export function labelPembayaran(p: DataBayar): string {
  if (p.metodeBayar === "COD") return "COD Kasir";
  switch (p.statusPembayaran) {
    case "menunggu":
      return "Menunggu Bayar";
    case "gagal":
      return "Pembayaran Gagal";
    case "kedaluwarsa":
      return "Kedaluwarsa";
    case "dikembalikan":
      return "Dikembalikan";
    case "lunas":
      // Dana sudah masuk tetapi pesanan batal: uang pembeli harus dikembalikan.
      if (p.status === "dibatalkan") return "Perlu Refund";
      break;
  }
  if (p.status === "menunggu-pembayaran") return "Menunggu Bayar";
  const nama = p.metodeBayar === "SALDO" ? "Saldo" : p.jenisPembayaran ? labelJenisBayar(p.jenisPembayaran, p.kanalPembayaran) : p.metodeBayar === "MIDTRANS" ? "Midtrans" : "QRIS";
  return `${nama} ${p.status === "dibatalkan" ? "Dibatalkan" : "Lunas"}`;
}

// ---------------------------------------------------------------------------
// Penyaring & penghitung
// ---------------------------------------------------------------------------
// Pesanan yang masih harus dikemas / menunggu kurir. Pesanan ambil mandiri tidak memakai kurir,
// jadi tidak masuk daftar jemput, rekap kurir, dan surat jalan.
// Langkah penjual untuk menandai paket siap, sesuai opsi pengiriman (dipakai tombol "Siapkan" di Ringkasan).
export const statusPaketSiap = (p: Pick<Pesanan, "opsiPengiriman">): StatusPesanan => (p.opsiPengiriman === "ambil-mandiri" ? "tiba-di-pos" : "siap-jemput");

export const perluDijemput = (p: Pesanan): boolean => (p.status === "perlu-dikemas" || p.status === "siap-jemput") && p.opsiPengiriman === "kurir-desa";

export const hitungStatus = (pesanan: Pesanan[], status: StatusPesanan) => pesanan.filter((p) => p.status === status).length;

export const hitungTotal = (pesanan: Pesanan[]) => pesanan.reduce((sum, p) => sum + p.total, 0);

export const pesananDiTab = (pesanan: Pesanan[], tab: TabPesanan): Pesanan[] => (tab.status === null ? pesanan : pesanan.filter((p) => tab.status!.includes(p.status)));