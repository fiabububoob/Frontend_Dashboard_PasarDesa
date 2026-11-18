import type { BadgeProduk, Komoditas, KomoditasBaru, KomoditasUbah, SumberKomoditas } from "@/types";
import { BADGE_PRODUK } from "./data/badgeProduk";
import { formatTanggal, isoTanggal } from "./format";
import { indukDari } from "./kategori";
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
    statusStok: hitungStatusStok(stok, data.stokMaks, data.batasStokRendah),
    waktuPanen: "Baru ditambahkan",
    waktuKeterangan: "Dicatat dari Manajemen Komoditas",
    tampil: data.tampil ?? true,
  };
}

// Stok tidak pernah melebihi kapasitas; status stok ikut dihitung ulang.
// Mencatat panen berarti tanggal panen terbaru = hari ini.
export function tambahStokKomoditas(k: Komoditas, jumlah: number, catatan?: string, sekarang: Date = new Date()): Komoditas {
  const stok = Math.min(k.stok + jumlah, k.stokMaks);
  return {
    ...k,
    stok,
    statusStok: hitungStatusStok(stok, k.stokMaks, k.batasStokRendah),
    waktuPanen: "Baru saja",
    tanggalPanen: isoTanggal(sekarang),
    waktuKeterangan: catatan ?? "Dicatat dari Ringkasan",
  };
}

export function ubahKomoditas(k: Komoditas, data: KomoditasUbah): Komoditas {
  const hasil = { ...k, ...data };
  hasil.stok = Math.min(hasil.stok, hasil.stokMaks);
  hasil.statusStok = hitungStatusStok(hasil.stok, hasil.stokMaks, hasil.batasStokRendah);
  return hasil;
}

// ---------------------------------------------------------------------------
// Label waktu panen & badge
// ---------------------------------------------------------------------------
const MS_PER_HARI = 86_400_000;
const BATAS_HARI_RELATIF = 14;

/** Selisih hari kalender antara dua tanggal ISO (isoA - isoB). */
export function selisihHari(isoA: string, isoB: string): number {
  return Math.round((Date.parse(isoA) - Date.parse(isoB)) / MS_PER_HARI);
}

const tanggalDariIso = (iso: string) => formatTanggal(new Date(`${iso}T00:00:00+07:00`));

// "Hari ini", "Kemarin", "5 hari lalu", atau tanggal lengkap bila sudah lama. Produk lama yang
// belum punya tanggalPanen tetap memakai teks bebas `waktuPanen`.
export function waktuPanenLabel(k: Pick<Komoditas, "tanggalPanen" | "waktuPanen">, sekarang: Date): string {
  if (!k.tanggalPanen) return k.waktuPanen;
  const hariLalu = selisihHari(isoTanggal(sekarang), k.tanggalPanen);
  if (hariLalu < 0) return `Dijadwalkan ${tanggalDariIso(k.tanggalPanen)}`;
  if (hariLalu === 0) return "Hari ini";
  if (hariLalu === 1) return "Kemarin";
  if (hariLalu < BATAS_HARI_RELATIF) return `${hariLalu} hari lalu`;
  return tanggalDariIso(k.tanggalPanen);
}

export const labelBadge = (kode: BadgeProduk): string => BADGE_PRODUK.find((b) => b.kode === kode)?.label ?? kode;

// ---------------------------------------------------------------------------
// Tampilan daftar komoditas (tab status, kolom penjual/ketersediaan)
// ---------------------------------------------------------------------------
export type StatusTampilan = "aktif" | "stok-rendah" | "nonaktif";

export const LABEL_STATUS_TAMPILAN: Record<StatusTampilan, string> = {
  aktif: "Aktif",
  "stok-rendah": "Stok Rendah",
  nonaktif: "Nonaktif",
};

// Tiga kondisi yang saling lepas: disembunyikan = Nonaktif; tampil tetapi stok kritis = Stok Rendah; selain itu Aktif.
export function statusTampilan(k: Pick<Komoditas, "tampil" | "statusStok">): StatusTampilan {
  if (!k.tampil) return "nonaktif";
  return k.statusStok === "kritis" ? "stok-rendah" : "aktif";
}

const SUMBER_PER_INDUK: Record<string, SumberKomoditas> = {
  "Hasil Tani": "Petani",
  "Ternak Ikan": "UMKM",
  "UMKM Desa": "UMKM",
  Sembako: "BUMDes",
};

export const sumberDari = (k: Pick<Komoditas, "sumber" | "kategori">): SumberKomoditas =>
  k.sumber ?? SUMBER_PER_INDUK[indukDari(k.kategori)?.nama ?? ""] ?? "Petani";

export const penjualDari = (k: Pick<Komoditas, "penjual" | "asalBlok">): string => k.penjual ?? k.asalBlok;

export const ketersediaanDari = (k: Pick<Komoditas, "ketersediaan">): string => k.ketersediaan ?? "Siap kirim";

/** Nama kategori utama (induk) dari sub-kategori komoditas. */
export const indukNama = (k: Pick<Komoditas, "kategori">): string => indukDari(k.kategori)?.nama ?? k.kategori;

/** Dua huruf untuk foto placeholder: "Beras Pandan Wangi" → "BP". */
export function inisialProduk(nama: string): string {
  const kata = nama.trim().split(/\s+/);
  return (kata.length > 1 ? kata[0][0] + kata[1][0] : nama.slice(0, 2)).toUpperCase();
}

export const hitungStatusTampilan = (daftar: Komoditas[], status: StatusTampilan): number => daftar.filter((k) => statusTampilan(k) === status).length;
