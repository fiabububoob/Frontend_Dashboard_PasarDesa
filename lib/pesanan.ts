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

export type PeranPesanan = "sistem" | "penjual" | "pembeli";

export interface LangkahStatus {
  ke: StatusPesanan;
  /** Siapa yang boleh memicu perpindahan ini (keputusan D4). */
  oleh: PeranPesanan;
}

// Langkah berikutnya untuk sebuah pesanan, atau null bila sudah di ujung alur (selesai/dibatalkan).
// Ambil mandiri melewati tahap "diantar": penjual langsung mengonfirmasi paket sudah ada di pos.
export function langkahBerikutnya(p: Pick<Pesanan, "status" | "opsiPengiriman">): LangkahStatus | null {
  switch (p.status) {
    case "menunggu-pembayaran":
      return { ke: "perlu-dikemas", oleh: "sistem" }; // pembayaran terverifikasi (webhook)
    case "perlu-dikemas":
      return { ke: "siap-jemput", oleh: "penjual" };
    case "siap-jemput":
      return p.opsiPengiriman === "ambil-mandiri" ? { ke: "tiba-di-pos", oleh: "penjual" } : { ke: "diantar", oleh: "penjual" };
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
  COD: "COD (bayar di tempat)",
  SALDO: "Saldo PasarDesa", // keputusan D5: satu nama untuk saldo pembeli
};

export const LABEL_OPSI_PENGIRIMAN: Record<OpsiPengiriman, string> = {
  "kurir-desa": "Kurir Desa",
  "ambil-mandiri": "Ambil mandiri di pos",
};

// Sudah dibayar secara digital (QRIS/Saldo). COD dibayar saat pengambilan, jadi tidak pernah "lunas" di muka.
export const sudahLunas = (p: Pick<Pesanan, "metodeBayar" | "status">): boolean =>
  p.metodeBayar !== "COD" && p.status !== "menunggu-pembayaran" && p.status !== "dibatalkan";

// Teks singkat untuk badge: "QRIS Lunas", "Saldo Lunas", "COD Kasir", "Menunggu Bayar".
export function labelPembayaran(p: Pick<Pesanan, "metodeBayar" | "status">): string {
  if (p.metodeBayar === "COD") return "COD Kasir";
  if (p.status === "menunggu-pembayaran") return "Menunggu Bayar";
  return `${p.metodeBayar === "SALDO" ? "Saldo" : "QRIS"} ${p.status === "dibatalkan" ? "Dibatalkan" : "Lunas"}`;
}

// ---------------------------------------------------------------------------
// Penyaring & penghitung
// ---------------------------------------------------------------------------
// Pesanan yang masih harus dikemas / menunggu kurir. Pesanan ambil mandiri tidak memakai kurir,
// jadi tidak masuk daftar jemput, rekap kurir, dan surat jalan.
export const perluDijemput = (p: Pesanan): boolean => (p.status === "perlu-dikemas" || p.status === "siap-jemput") && p.opsiPengiriman === "kurir-desa";

export const hitungStatus = (pesanan: Pesanan[], status: StatusPesanan) => pesanan.filter((p) => p.status === status).length;

export const hitungTotal = (pesanan: Pesanan[]) => pesanan.reduce((sum, p) => sum + p.total, 0);

export const pesananDiTab = (pesanan: Pesanan[], tab: TabPesanan): Pesanan[] => (tab.status === null ? pesanan : pesanan.filter((p) => tab.status!.includes(p.status)));