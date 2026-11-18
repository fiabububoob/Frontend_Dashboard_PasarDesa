// Tiket aduan umum dari pembeli (aplikasi mobile: Pusat Bantuan → Buat Tiket Aduan).
// Beda dengan komplain pesanan (types/pesanan.ts): tiket tidak menahan dana dan tidak harus terkait pesanan.
export type StatusAduan = "diverifikasi" | "diproses" | "selesai";

export interface Aduan {
  /** Id di server (dipakai untuk PATCH). */
  idServer: number;
  /** Nomor tiket tampilan, mis. ADU-20261024-0021. */
  id: string;
  /** Kendala yang dipilih pembeli, mis. "Pengantaran / Kurir Desa". */
  topik: string;
  /** Kode pesanan terkait (opsional). */
  kodePesanan?: string;
  judul: string;
  deskripsi?: string;
  /** Alamat foto bukti (sudah bisa dibuka dari dashboard). */
  foto: string[];
  /** Solusi yang diminta pembeli, mis. "Kirim Ulang Barang Pengganti". */
  solusiDiminta?: string;
  status: StatusAduan;
  balasan?: string;
  dibalasPada?: string;
  dibuatPada: string;
  pembeli: string;
  email?: string;
  telepon?: string;
}
