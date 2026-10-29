import type { BadgeProduk, Komoditas, KomoditasBaru, Spesifikasi, SumberKomoditas } from "@/types";
import { isoTanggal } from "./format";
import { sumberDari } from "./komoditas";
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
  sumber: SumberKomoditas;
  penjual: string;
  ketersediaan: string;
  batasStokRendah: string;
  minBeli: string;
  maksBeli: string;
  /** Satu keunggulan per baris, format "Judul: isi". */
  keunggulan: string;
  garansiMutu: string;
  antarKurir: boolean;
  ambilDiKantor: boolean;
  areaAntar: string;
  ongkir: string;
  estimasi: string;
  jamOrderTerakhir: string;
  lokasiAmbil: string;
  beratKirimKg: string;
  bisaDiklaim: boolean;
  batasKlaim: string;
  catatanKebijakan: string;
}

export type UpdateDraft = (patch: Partial<DraftKomoditas>) => void;

export interface ErrorDraft {
  stok?: string;
  hargaCoret?: string;
  pengiriman?: string;
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
    sumber: "Petani",
    penjual: "",
    ketersediaan: "Siap kirim",
    batasStokRendah: "10",
    minBeli: "1",
    maksBeli: "",
    keunggulan: "",
    garansiMutu: "",
    antarKurir: true,
    ambilDiKantor: false,
    areaAntar: "",
    ongkir: "",
    estimasi: "",
    jamOrderTerakhir: "15:00",
    lokasiAmbil: "",
    beratKirimKg: "",
    bisaDiklaim: true,
    batasKlaim: "",
    catatanKebijakan: "",
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
    sumber: sumberDari(k),
    penjual: k.penjual ?? "",
    ketersediaan: k.ketersediaan ?? "Siap kirim",
    batasStokRendah: k.batasStokRendah === undefined ? "" : String(k.batasStokRendah),
    minBeli: k.minBeli === undefined ? "" : String(k.minBeli),
    maksBeli: k.maksBeli === undefined ? "" : String(k.maksBeli),
    keunggulan: (k.keunggulan ?? []).join("\n"),
    garansiMutu: k.garansiMutu ?? "",
    antarKurir: k.pengiriman?.antarKurir ?? true,
    ambilDiKantor: k.pengiriman?.ambilDiKantor ?? false,
    areaAntar: k.pengiriman?.areaAntar ?? "",
    ongkir: k.pengiriman?.ongkir === undefined ? "" : String(k.pengiriman.ongkir),
    estimasi: k.pengiriman?.estimasi ?? "",
    jamOrderTerakhir: k.pengiriman?.jamOrderTerakhir ?? "",
    lokasiAmbil: k.pengiriman?.lokasiAmbil ?? "",
    beratKirimKg: k.pengiriman?.beratKirimKg === undefined ? "" : String(k.pengiriman.beratKirimKg),
    bisaDiklaim: k.pengiriman?.bisaDiklaim ?? true,
    batasKlaim: k.pengiriman?.batasKlaim ?? "",
    catatanKebijakan: k.pengiriman?.catatanKebijakan ?? "",
  };
}

export function errorDraft(d: DraftKomoditas): ErrorDraft {
  const error: ErrorDraft = {};
  if (d.stok !== "" && d.stokMaks !== "" && Number(d.stok) > Number(d.stokMaks)) error.stok = "Stok tidak boleh melebihi kapasitas";
  if (d.hargaCoret !== "" && d.harga !== "" && Number(d.hargaCoret) <= Number(d.harga)) error.hargaCoret = "Harga coret harus lebih besar dari harga jual";
  if (!d.antarKurir && !d.ambilDiKantor) error.pengiriman = "Pilih minimal satu opsi pengiriman";
  return error;
}

export const adaError = (error: ErrorDraft): boolean => Object.values(error).some(Boolean);

const teksAtauKosong = (nilai: string) => nilai.trim() || undefined;
const angkaAtauKosong = (nilai: string) => (nilai.trim() === "" || Number.isNaN(Number(nilai)) ? undefined : Number(nilai));
export const MAKS_KEUNGGULAN = 5;

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
    sumber: d.sumber,
    penjual: teksAtauKosong(d.penjual),
    ketersediaan: teksAtauKosong(d.ketersediaan),
    batasStokRendah: angkaAtauKosong(d.batasStokRendah),
    minBeli: angkaAtauKosong(d.minBeli),
    maksBeli: angkaAtauKosong(d.maksBeli),
    keunggulan: d.keunggulan.split("\n").map((b) => b.trim()).filter(Boolean).slice(0, MAKS_KEUNGGULAN),
    garansiMutu: teksAtauKosong(d.garansiMutu),
    pengiriman: {
      antarKurir: d.antarKurir,
      ambilDiKantor: d.ambilDiKantor,
      areaAntar: teksAtauKosong(d.areaAntar),
      ongkir: angkaAtauKosong(d.ongkir),
      estimasi: teksAtauKosong(d.estimasi),
      jamOrderTerakhir: teksAtauKosong(d.jamOrderTerakhir),
      lokasiAmbil: teksAtauKosong(d.lokasiAmbil),
      beratKirimKg: angkaAtauKosong(d.beratKirimKg),
      bisaDiklaim: d.bisaDiklaim,
      batasKlaim: d.bisaDiklaim ? teksAtauKosong(d.batasKlaim) : undefined,
      catatanKebijakan: teksAtauKosong(d.catatanKebijakan),
    },
  };
}