import type { BadgeProduk } from "@/types";

// Label produk yang boleh dipilih penjual (sama dengan yang tampil di app pembeli).
export const BADGE_PRODUK: { kode: BadgeProduk; label: string }[] = [
  { kode: "panen-baru", label: "Panen Baru" },
  { kode: "murni", label: "Murni 100%" },
  { kode: "segar-harian", label: "Segar Harian" },
  { kode: "favorit", label: "Favorit Warga" },
  { kode: "sertifikasi-bumdes", label: "Sertifikasi BUMDes" },
];