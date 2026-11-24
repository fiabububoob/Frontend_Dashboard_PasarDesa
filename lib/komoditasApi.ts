import { indukNama } from "./komoditas";
import { hitungStatusStok } from "./stok";
import type { BadgeProduk, Komoditas, MusimKomoditas, PengirimanKomoditas, Spesifikasi, SumberKomoditas } from "@/types";

// Baris produk dari Express API (GET /api/products). Kolom `detail` (JSON) menampung isian kaya dashboard.
export interface DetailKomoditasApi {
  /** Kategori utama (mis. "Hasil Tani"); dipakai aplikasi mobile untuk filter kategori. */
  kategoriInduk?: string;
  gambar?: string;
  badge?: BadgeProduk[];
  spesifikasi?: Spesifikasi[];
  saranPenyimpanan?: string;
  tanggalPanen?: string;
  waktuPanen?: string;
  waktuKeterangan?: string;
  minBeli?: number;
  maksBeli?: number;
  keunggulan?: string[];
  garansiMutu?: string;
  pengiriman?: PengirimanKomoditas;
  musim?: MusimKomoditas;
}

export interface BarisKomoditasApi {
  id: number | string;
  name: string;
  description: string | null;
  price: number | string;
  harga_coret: number | string | null;
  stock: number | string;
  max_stock: number | string;
  unit: string;
  ukuran: string | null;
  image: string | null;
  sku: string | null;
  origin_block: string | null;
  is_visible: number | boolean;
  tag: string | null;
  price_note: string | null;
  sumber: SumberKomoditas | null;
  ketersediaan: string | null;
  batas_stok_rendah: number | string | null;
  category_name: string | null;
  terjual?: number | string;
  detail: DetailKomoditasApi | string | null;
}

const angka = (v: number | string | null | undefined): number | undefined => (v === null || v === undefined || v === "" ? undefined : Number(v));

function bacaDetail(detail: BarisKomoditasApi["detail"]): DetailKomoditasApi {
  if (!detail) return {};
  if (typeof detail !== "string") return detail;
  try {
    return JSON.parse(detail) as DetailKomoditasApi;
  } catch {
    return {};
  }
}

// Produk backend → komoditas yang ditampilkan dashboard.
export function komoditasDariApi(b: BarisKomoditasApi): Komoditas {
  const d = bacaDetail(b.detail);
  const stok = Number(b.stock) || 0;
  const stokMaks = Number(b.max_stock) || 0;
  const batas = angka(b.batas_stok_rendah);
  return {
    id: String(b.id),
    sku: b.sku ?? `SKR-${b.id}`,
    nama: b.name,
    gambar: d.gambar ?? "🌾",
    foto: b.image ? [b.image] : undefined,
    kategori: b.category_name ?? "Lainnya",
    asalBlok: b.origin_block ?? "-",
    harga: Number(b.price) || 0,
    satuan: b.unit,
    hargaKeterangan: b.price_note ?? undefined,
    hargaCoret: angka(b.harga_coret),
    ukuran: b.ukuran ?? undefined,
    deskripsi: b.description ?? undefined,
    spesifikasi: d.spesifikasi,
    saranPenyimpanan: d.saranPenyimpanan,
    tanggalPanen: d.tanggalPanen,
    badge: d.badge,
    stok,
    stokMaks,
    statusStok: hitungStatusStok(stok, stokMaks, batas),
    waktuPanen: d.waktuPanen ?? "Baru ditambahkan",
    waktuKeterangan: d.waktuKeterangan,
    tampil: Boolean(b.is_visible),
    tag: b.tag ?? undefined,
    sumber: b.sumber ?? undefined,
    terjual: angka(b.terjual) ?? 0,
    ketersediaan: b.ketersediaan ?? undefined,
    batasStokRendah: batas,
    minBeli: d.minBeli,
    maksBeli: d.maksBeli,
    keunggulan: d.keunggulan,
    garansiMutu: d.garansiMutu,
    pengiriman: d.pengiriman,
    musim: d.musim,
  };
}

// Komoditas dashboard → isian yang dikirim ke API (nama kolom backend). Foto tidak ikut di sini:
// foto diunggah terpisah sebagai file (lihat lib/actions/komoditas.ts).
export function isianKeApi(k: Omit<Komoditas, "id" | "statusStok"> & { id?: string }): Record<string, string> {
  const detail: DetailKomoditasApi = {
    kategoriInduk: indukNama(k),
    gambar: k.gambar,
    badge: k.badge,
    spesifikasi: k.spesifikasi,
    saranPenyimpanan: k.saranPenyimpanan,
    tanggalPanen: k.tanggalPanen,
    waktuPanen: k.waktuPanen,
    waktuKeterangan: k.waktuKeterangan,
    minBeli: k.minBeli,
    maksBeli: k.maksBeli,
    keunggulan: k.keunggulan,
    garansiMutu: k.garansiMutu,
    pengiriman: k.pengiriman,
    musim: k.musim,
  };
  const teks = (v: string | number | undefined | null) => (v === undefined || v === null ? "" : String(v));
  return {
    name: k.nama,
    description: teks(k.deskripsi),
    price: teks(k.harga),
    harga_coret: teks(k.hargaCoret),
    stock: teks(k.stok),
    max_stock: teks(k.stokMaks),
    unit: k.satuan,
    ukuran: teks(k.ukuran),
    sku: teks(k.sku),
    origin_block: teks(k.asalBlok),
    is_visible: String(k.tampil),
    tag: teks(k.tag),
    price_note: teks(k.hargaKeterangan),
    sumber: teks(k.sumber),
    ketersediaan: teks(k.ketersediaan),
    batas_stok_rendah: teks(k.batasStokRendah),
    detail: JSON.stringify(detail),
  };
}

export const adalahDataUrl = (url: string | undefined): url is string => Boolean(url?.startsWith("data:"));
