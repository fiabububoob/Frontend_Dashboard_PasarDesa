import type { BadgeProduk, Komoditas, KomoditasBaru, Spesifikasi } from "@/types";
import { isoTanggal } from "./format";
import { IKON_BAWAAN, IKON_SUB_KATEGORI, SUB_KATEGORI } from "./kategori";

// Isian form komoditas disimpan sebagai teks (seperti nilai input HTML), lalu
// diubah ke data sungguhan hanya saat disimpan. Semua aturannya fungsi murni → mudah diuji.
export interface DraftKomoditas {
  foto: string[];
  nama: string;
  kategori: string;
  gambar: string;
  ikonDipilihSendiri: boolean;
  asalBlok: string;
  harga: string;
  hargaCoret: string;
  satuan: string;
  ukuran: string;
  stok: string;
  stokMaks: string;
  tag: string;
  hargaKeterangan: string;
  deskripsi: string;
  saranPenyimpanan: string;
  spesifikasi: Spesifikasi[];
  badge: BadgeProduk[];
  tanggalPanen: string;
}

export type UpdateDraft = (patch: Partial<DraftKomoditas>) => void;

export interface ErrorDraft {
  stok?: string;
  hargaCoret?: string;
}

export function draftKosong(sekarang: Date): DraftKomoditas {
  const kategori = SUB_KATEGORI[0].nama;
  return {
    foto: [],
    nama: "",
    kategori,
    gambar: IKON_SUB_KATEGORI[kategori] ?? IKON_BAWAAN,
    ikonDipilihSendiri: false,
    asalBlok: "",
    harga: "",
    hargaCoret: "",
    satuan: "kg",
    ukuran: "",
    stok: "",
    stokMaks: "",
    tag: "",
    hargaKeterangan: "",
    deskripsi: "",
    saranPenyimpanan: "",
    spesifikasi: [],
    badge: [],
    tanggalPanen: isoTanggal(sekarang),
  };
}

export function draftDari(k: Komoditas): DraftKomoditas {
  return {
    foto: k.foto ?? [],
    nama: k.nama,
    kategori: k.kategori,
    gambar: k.gambar,
    ikonDipilihSendiri: true,
    asalBlok: k.asalBlok,
    harga: String(k.harga),
    hargaCoret: k.hargaCoret === undefined ? "" : String(k.hargaCoret),
    satuan: k.satuan,
    ukuran: k.ukuran ?? "",
    stok: String(k.stok),
    stokMaks: String(k.stokMaks),
    tag: k.tag ?? "",
    hargaKeterangan: k.hargaKeterangan ?? "",
    deskripsi: k.deskripsi ?? "",
    saranPenyimpanan: k.saranPenyimpanan ?? "",
    spesifikasi: k.spesifikasi ?? [],
    badge: k.badge ?? [],
    tanggalPanen: k.tanggalPanen ?? "", // produk lama tanpa tanggal tetap memakai teks waktu panen lamanya
  };
}

export function errorDraft(d: DraftKomoditas): ErrorDraft {
  const error: ErrorDraft = {};
  if (d.stok !== "" && d.stokMaks !== "" && Number(d.stok) > Number(d.stokMaks)) error.stok = "Stok tidak boleh melebihi kapasitas";
  if (d.hargaCoret !== "" && d.harga !== "" && Number(d.hargaCoret) <= Number(d.harga)) error.hargaCoret = "Harga coret harus lebih besar dari harga jual";
  return error;
}

export const adaError = (error: ErrorDraft): boolean => Object.values(error).some(Boolean);

const teksAtauKosong = (nilai: string) => nilai.trim() || undefined;

// Isian → data siap simpan: teks dirapikan, angka dikonversi, baris spesifikasi yang belum lengkap dibuang.
export function dataDariDraft(d: DraftKomoditas): KomoditasBaru {
  return {
    nama: d.nama.trim(),
    foto: d.foto,
    kategori: d.kategori,
    gambar: d.gambar.trim() || IKON_BAWAAN,
    asalBlok: d.asalBlok.trim(),
    harga: Number(d.harga),
    hargaCoret: d.hargaCoret === "" ? undefined : Number(d.hargaCoret),
    satuan: d.satuan.trim(),
    ukuran: teksAtauKosong(d.ukuran),
    stok: Number(d.stok),
    stokMaks: Number(d.stokMaks),
    tag: teksAtauKosong(d.tag),
    hargaKeterangan: teksAtauKosong(d.hargaKeterangan),
    deskripsi: teksAtauKosong(d.deskripsi),
    saranPenyimpanan: teksAtauKosong(d.saranPenyimpanan),
    spesifikasi: d.spesifikasi.map((s) => ({ label: s.label.trim(), nilai: s.nilai.trim() })).filter((s) => s.label && s.nilai),
    badge: d.badge,
    tanggalPanen: d.tanggalPanen || undefined,
  };
}