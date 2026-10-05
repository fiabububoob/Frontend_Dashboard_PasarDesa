export type KategoriMutasi = "Penjualan Lapak" | "Pencairan Kas" | "Subsidi Desa";

export type StatusMutasi =
  | "Berhasil Masuk"
  | "Berhasil Disubsidi"
  | "Berhasil Ditransfer"
  | "Berhasil Dicairkan"
  | "Diproses"
  | "Menunggu Pengambilan";

export interface TransaksiKas {
  id: string;
  tanggal: string;
  waktu: string;
  deskripsi: string;
  referensi: string;
  kategori: KategoriMutasi;
  /** Positif = dana masuk, negatif = dana keluar. */
  nominal: number;
  status: StatusMutasi;
}

// Rekening tujuan pencairan dana Poktan.
export interface Rekening {
  bank: string;
  unit: string;
  atasNama: string;
  nomor: string;
  terverifikasi: boolean;
}

export type JalurPencairan = "bank" | "tunai";
