import type { PengaturanLapak } from "./pengaturan";

export interface Warta {
  id: string;
  label: string;
  tanggal: string;
  judul: string;
  isi: string;
}

// Target modal detail. Satu jalur untuk semua: kategori, hasil pencarian,
// notifikasi, dan tombol-tombol di halaman → useDetail().open({ type, ... }).
export type DetailTarget =
  | { type: "pesanan"; id: string }
  | { type: "komoditas"; id: string }
  | { type: "kategori"; nama: string }
  | { type: "kurir" }
  | { type: "warta"; id: string }
  | { type: "tambah-panen"; komoditasId?: string }
  | { type: "rekap" }
  | { type: "laporan" }
  | { type: "hotline" }
  | { type: "form-komoditas"; id?: string } // id kosong = tambah baru, ada id = ubah
  | { type: "impor-ekspor" }
  | { type: "nota"; id: string }
  | { type: "surat-jalan" }
  | { type: "transaksi"; id: string }
  | { type: "rekening" }
  | { type: "laporan-kas" }
  | { type: "pratinjau-warga"; data?: PengaturanLapak } // data = draft belum tersimpan (opsional)
  | { type: "piagam" }
  | { type: "profil" };
