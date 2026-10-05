import type { Pesanan, StatusKemas } from "@/types";

// Label status pesanan — satu sumber untuk badge, tab filter, dan pencarian.
export const STATUS_LABEL: Record<StatusKemas, string> = {
  "perlu-dikemas": "Perlu Dikemas",
  "siap-jemput": "Siap Jemput",
  "sedang-dikemas": "Dalam Antaran", // key lama dipertahankan; artinya paket sedang dikirim ke drop-point
  selesai: "Selesai",
};

// Urutan alur: dikemas → siap jemput → dalam antaran → selesai.
export const STATUS_BERIKUTNYA: Record<StatusKemas, StatusKemas | null> = {
  "perlu-dikemas": "siap-jemput",
  "siap-jemput": "sedang-dikemas",
  "sedang-dikemas": "selesai",
  selesai: null,
};

// Pesanan yang masih harus dikemas / menunggu kurir. Dipakai Ringkasan, rekap,
// daftar jemput kurir, dan surat jalan.
export const perluDijemput = (p: Pesanan) => p.status === "perlu-dikemas" || p.status === "siap-jemput";

export const hitungStatus = (pesanan: Pesanan[], status: StatusKemas) => pesanan.filter((p) => p.status === status).length;

export const hitungTotal = (pesanan: Pesanan[]) => pesanan.reduce((sum, p) => sum + p.total, 0);
