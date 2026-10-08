import type { KategoriInduk, SubKategori } from "@/types";
import { KATEGORI_INDUK } from "./data/kategori";

// Turunan dari pohon kategori (lib/data/kategori.ts) yang dipakai filter, form, dan impor CSV.
export const SUB_KATEGORI: SubKategori[] = KATEGORI_INDUK.flatMap((induk) => induk.anak);
export const NAMA_SUB_KATEGORI: string[] = SUB_KATEGORI.map((sub) => sub.nama);

/** Ikon emoji per nama sub-kategori; dipakai sebagai ikon cadangan produk baru. */
export const IKON_SUB_KATEGORI: Record<string, string> = Object.fromEntries(SUB_KATEGORI.map((sub) => [sub.nama, sub.ikon]));

export const IKON_BAWAAN = "🌱";

export function indukDari(namaSub: string): KategoriInduk | undefined {
  return KATEGORI_INDUK.find((induk) => induk.anak.some((sub) => sub.nama === namaSub));
}

export function subDariInduk(namaInduk: string): string[] {
  return KATEGORI_INDUK.find((induk) => induk.nama === namaInduk)?.anak.map((sub) => sub.nama) ?? [];
}