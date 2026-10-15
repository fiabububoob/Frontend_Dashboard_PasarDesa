import type { AlasanKomplain, Komplain, PenyelesaianKomplain, Pesanan } from "@/types";

// Aturan komplain/retur/refund — fungsi murni, mudah diuji.

export const LABEL_ALASAN: Record<AlasanKomplain, string> = {
  "tidak-segar": "Barang tidak segar / rusak",
  "tidak-sesuai-timbangan": "Timbangan tidak sesuai",
  "kemasan-rusak": "Kemasan rusak",
  "tidak-sesuai-pesanan": "Tidak sesuai pesanan",
  lainnya: "Alasan lain",
};

export const LABEL_PENYELESAIAN: Record<PenyelesaianKomplain, string> = {
  refund: "Refund ke Saldo PasarDesa",
  pengganti: "Kirim barang pengganti",
};

// Komplain hanya bisa diajukan saat paket sudah di pos dan belum diterima (keputusan D8),
// satu kali per pesanan.
export const bisaDikomplain = (p: Pick<Pesanan, "status" | "komplain">): boolean => p.status === "tiba-di-pos" && p.komplain === undefined;

/** Total nilai item yang di-refund (dikembalikan ke Saldo PasarDesa pembeli). */
export const nilaiRefund = (p: Pick<Pesanan, "komplain">): number =>
  (p.komplain?.items ?? []).filter((item) => item.penyelesaian === "refund").reduce((sum, item) => sum + item.nilai, 0);

/** Nilai yang menjadi hak penjual: total pesanan dikurangi item yang di-refund. */
export const nilaiBersih = (p: Pick<Pesanan, "total" | "komplain">): number => p.total - nilaiRefund(p);

export const nilaiRefundPilihan = (komplain: Komplain, pilihan: (PenyelesaianKomplain | undefined)[]): number =>
  komplain.items.reduce((sum, item, i) => (pilihan[i] === "refund" ? sum + item.nilai : sum), 0);

// Menerapkan keputusan untuk setiap item (urutan sama dengan komplain.items). Dipakai penjual,
// dan juga admin BUMDes untuk kasus yang diteruskan kepadanya.
// - Ada item "pengganti" → pesanan kembali ke antrean kemas sebagai kirim ulang.
// - Semua "refund" → pesanan selesai (penjual menerima sisa nilai bersih, bila ada).
// Pilihan yang belum lengkap tidak mengubah apa pun.
export function terapkanPenyelesaian(p: Pesanan, pilihan: (PenyelesaianKomplain | undefined)[]): Pesanan {
  const { komplain } = p;
  if (!komplain || komplain.status === "selesai" || pilihan.length !== komplain.items.length || pilihan.some((x) => x === undefined)) return p;

  const items = komplain.items.map((item, i) => ({ ...item, penyelesaian: pilihan[i] }));
  const adaPengganti = items.some((item) => item.penyelesaian === "pengganti");
  return {
    ...p,
    komplain: { ...komplain, items, status: "selesai" },
    status: adaPengganti ? "perlu-dikemas" : "selesai",
    kirimUlang: adaPengganti || p.kirimUlang,
  };
}

// Penjual menolak: kasus diteruskan ke admin BUMDes, dana tetap ditahan.
export function teruskanKeBumdes(p: Pesanan): Pesanan {
  if (!p.komplain || p.komplain.status !== "diajukan") return p;
  return { ...p, komplain: { ...p.komplain, status: "diteruskan-bumdes" } };
}

// Menandai pesanan berstatus komplain. Dipakai aplikasi pembeli (di sini hanya untuk simulasi).
export function ajukanKomplainPada(p: Pesanan, komplain: Komplain): Pesanan {
  return bisaDikomplain(p) ? { ...p, status: "komplain", komplain } : p;
}

// Komplain contoh untuk simulasi pembeli di mode pengembangan.
export function buatKomplainContoh(p: Pesanan, sekarang: Date, urutan: number): Komplain {
  return {
    id: `KMP-${String(urutan).padStart(4, "0")}`,
    alasan: "tidak-segar",
    catatan: "Sebagian barang tidak segar saat diterima di pos.",
    foto: [],
    diajukanPada: sekarang.toISOString(),
    status: "diajukan",
    items: p.items.map((item) => ({ komoditas: item.komoditas, nilai: item.subtotal })),
  };
}
