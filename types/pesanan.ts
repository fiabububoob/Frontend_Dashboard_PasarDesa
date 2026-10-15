// Urutan hidup pesanan (lihat lib/pesanan.ts untuk siapa yang boleh mengubah tiap langkah):
// menunggu-pembayaran → perlu-dikemas → siap-jemput → diantar → tiba-di-pos → selesai
// (ambil mandiri melewati "diantar"); dibatalkan bisa terjadi sebelum pesanan dikemas;
// komplain bisa diajukan pembeli saat tiba-di-pos (dana ditahan sampai komplain selesai).
export type StatusPesanan =
  | "menunggu-pembayaran"
  | "perlu-dikemas"
  | "siap-jemput"
  | "diantar"
  | "tiba-di-pos"
  | "komplain"
  | "selesai"
  | "dibatalkan";

export type MetodeBayar = "QRIS" | "COD" | "SALDO";

export type OpsiPengiriman = "kurir-desa" | "ambil-mandiri";

export interface PesananItem {
  komoditas: string;
  jumlah: string;
  hargaSatuan: number;
  subtotal: number;
  tag?: string;
}

export interface KurirPesanan {
  nama: string;
  armada: string;
  jadwal: string;
  telepon?: string;
}

export type AlasanKomplain = "tidak-segar" | "tidak-sesuai-timbangan" | "kemasan-rusak" | "tidak-sesuai-pesanan" | "lainnya";

/** Cara penjual menyelesaikan komplain untuk satu item. */
export type PenyelesaianKomplain = "refund" | "pengganti";

export interface KomplainItem {
  komoditas: string;
  /** Nilai item yang dikomplain (subtotal item pada pesanan). */
  nilai: number;
  penyelesaian?: PenyelesaianKomplain;
}

// diajukan: menunggu keputusan penjual · selesai: semua item sudah ditangani · diteruskan-bumdes: penjual menolak, menunggu BUMDes
export type StatusKomplain = "diajukan" | "selesai" | "diteruskan-bumdes";

export interface Komplain {
  id: string;
  alasan: AlasanKomplain;
  catatan: string;
  /** Foto bukti dari pembeli (data URL / URL). */
  foto: string[];
  /** Waktu pengajuan (ISO). */
  diajukanPada: string;
  status: StatusKomplain;
  items: KomplainItem[];
}

// Satu pesanan = bagian milik SATU penjual dari keranjang pembeli (keranjang bisa berisi beberapa penjual).
export interface Pesanan {
  id: string;
  /** ID pembayaran bersama (satu pembayaran bisa mencakup beberapa pesanan penjual). */
  idPembayaran?: string;
  pembeli: string;
  inisial: string;
  alamat: string;
  /** Wilayah pembeli, mis. "RT 02 / RW 01". */
  rtRw?: string;
  /** Penanda lokasi dari pembeli, mis. "Depan Pos Kamling RT 02". */
  patokan?: string;
  dropPoint: string;
  opsiPengiriman: OpsiPengiriman;
  metodeBayar: MetodeBayar;
  status: StatusPesanan;
  waktu: string;
  /** Waktu paket tiba di pos (ISO). Dana dilepas otomatis sekian jam setelahnya bila pembeli belum menerima. */
  tibaDiPosPada?: string;
  total: number;
  items: PesananItem[];
  catatan?: string;
  telepon?: string; // nomor WhatsApp pembeli
  kurir?: KurirPesanan;
  komplain?: Komplain;
  /** True bila pesanan dikirim ulang sebagai barang pengganti (bebas biaya) setelah komplain. */
  kirimUlang?: boolean;
}

// Tab filter di halaman Pesanan; `status: null` = semua pesanan.
export interface TabPesanan {
  label: string;
  status: StatusPesanan[] | null;
}
