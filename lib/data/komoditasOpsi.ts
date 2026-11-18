// Pilihan dropdown pada form komoditas (langkah Harga & Stok, Konten, Pengiriman).
export const OPSI_SATUAN = ["kg", "sak", "karung", "ikat", "botol", "mika", "bks", "sachet", "ekor", "butir", "500g"];
export const OPSI_KETERSEDIAAN = ["Siap kirim", "Panen pagi", "Pre-order", "Stok habis"];
export const OPSI_GARANSI = ["Garansi Mutu BUMDes Sukorejo", "Garansi Uang Kembali 1×24 jam", "Tanpa garansi"];
export const OPSI_AREA_ANTAR = ["Seluruh RT/RW desa", "Dusun Krajan saja", "Dusun Sidomulyo saja", "Sekitar Balai Desa"];
export const OPSI_ESTIMASI = ["Hari ini", "Besok pagi", "1–2 hari", "2–3 hari"];
export const OPSI_LOKASI_AMBIL = ["Kantor BUMDes Sukorejo", "Lumbung Krajan", "Pos Drop-Point Krajan RT 02"];
export const OPSI_BATAS_KLAIM = ["1×24 jam", "2×24 jam", "3×24 jam"];
export const LABEL_JENIS_SUMBER = ["Petani", "UMKM", "BUMDes"] as const;

// Isian spesifikasi menyesuaikan kategori utama. `alias` = label lama pada data yang sudah ada.
export interface IsianSpesifikasi {
  label: string;
  placeholder: string;
  wajib?: boolean;
  alias?: string[];
}

const HASIL_TANI: IsianSpesifikasi[] = [
  { label: "Berat Bersih", placeholder: "Contoh: 5 Kilogram", wajib: true },
  { label: "Asal Panen", placeholder: "Contoh: Sawah Blok Selatan", wajib: true },
  { label: "Varietas", placeholder: "Contoh: Pandan Wangi Bersertifikat", alias: ["Varietas Bibit"] },
  { label: "Kualitas Olah", placeholder: "Contoh: Tanpa Pemutih", alias: ["Kualitas Pengolahan"] },
  { label: "Sertifikasi", placeholder: "Opsional" },
];

const OLAHAN: IsianSpesifikasi[] = [
  { label: "Isi Bersih", placeholder: "Contoh: 200 gram", wajib: true },
  { label: "Komposisi", placeholder: "Contoh: Singkong, bumbu balado", wajib: true },
  { label: "Masa Simpan", placeholder: "Contoh: 3 bulan" },
  { label: "Izin Edar (PIRT)", placeholder: "Opsional" },
  { label: "Sertifikasi", placeholder: "Opsional" },
];

export function isianSpesifikasi(induk: string): IsianSpesifikasi[] {
  return induk === "Hasil Tani" || induk === "Ternak Ikan" ? HASIL_TANI : OLAHAN;
}
