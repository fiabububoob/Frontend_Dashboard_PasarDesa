import type { Komoditas, KomoditasBaru, KomoditasUbah } from "@/types";
import { hitungStatusStok } from "./stok";

// Aturan bisnis komoditas sebagai fungsi murni (tanpa React): dipakai oleh
// state komoditas dan mudah diuji.

const KODE_SKU_BAWAAN = "KMD";
const PANJANG_KODE_SKU = 3;

// "Beras Merah Organik" → "BER"; dipakai untuk membentuk SKU komoditas baru.
export function kodeSku(nama: string): string {
  const huruf = nama.replace(/[^a-zA-Z]/g, "").toUpperCase() || KODE_SKU_BAWAAN;
  return huruf.slice(0, PANJANG_KODE_SKU).padEnd(PANJANG_KODE_SKU, "X");
}

// SKU unik berformat SKR-<KODE>-<NN>; nomor naik sampai tidak bentrok dengan SKU yang ada.
export function buatSkuBaru(daftar: Komoditas[], nama: string): string {
  const kode = kodeSku(nama);
  let nomor = daftar.filter((k) => k.sku.startsWith(`SKR-${kode}-`)).length + 1;
  const format = (n: number) => `SKR-${kode}-${String(n).padStart(2, "0")}`;
  while (daftar.some((k) => k.id === format(nomor))) nomor += 1;
  return format(nomor);
}

export function buatKomoditas(daftar: Komoditas[], data: KomoditasBaru): Komoditas {
  const sku = buatSkuBaru(daftar, data.nama);
  const stok = Math.min(data.stok, data.stokMaks);
  return {
    ...data,
    id: sku,
    sku,
    stok,
    statusStok: hitungStatusStok(stok, data.stokMaks),
    waktuPanen: "Baru ditambahkan",
    waktuKeterangan: "Dicatat dari Manajemen Komoditas",
    tampil: data.tampil ?? true,
  };
}

// Stok tidak pernah melebihi kapasitas; status stok ikut dihitung ulang.
export function tambahStokKomoditas(k: Komoditas, jumlah: number, catatan?: string): Komoditas {
  const stok = Math.min(k.stok + jumlah, k.stokMaks);
  return { ...k, stok, statusStok: hitungStatusStok(stok, k.stokMaks), waktuPanen: "Baru saja", waktuKeterangan: catatan ?? "Dicatat dari Ringkasan" };
}

export function ubahKomoditas(k: Komoditas, data: KomoditasUbah): Komoditas {
  const hasil = { ...k, ...data };
  hasil.stok = Math.min(hasil.stok, hasil.stokMaks);
  hasil.statusStok = hitungStatusStok(hasil.stok, hasil.stokMaks);
  return hasil;
}
