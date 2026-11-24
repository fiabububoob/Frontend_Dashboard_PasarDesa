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

// "MIDTRANS" = pembayaran lewat gateway (QRIS, Virtual Account, e-wallet, kartu); rinciannya ada di `jenisPembayaran`.
// "QRIS" dipertahankan untuk pesanan lama sebelum Midtrans.
export type MetodeBayar = "QRIS" | "MIDTRANS" | "COD" | "SALDO";

// Status dari gateway (kolom payment_status di backend), terpisah dari status pesanan.
// menunggu: tagihan dibuat, belum dibayar · lunas: Midtrans mengonfirmasi · gagal/kedaluwarsa: tidak jadi dibayar
// dikembalikan: refund/chargeback tercatat di Midtrans · cod: bayar di tempat
export type StatusPembayaran = "menunggu" | "lunas" | "gagal" | "kedaluwarsa" | "dikembalikan" | "cod";

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

export interface UlasanPesanan {
  /** 1–5. */
  rating: number;
  tags: string[];
  catatan?: string;
  kurirDisukai?: boolean;
  dibuatPada: string;
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
  /** Status pembayaran dari gateway. Kosong pada data lama (sebelum Midtrans). */
  statusPembayaran?: StatusPembayaran;
  /** Jenis dari Midtrans: bank_transfer, qris, gopay, shopeepay, credit_card, ... */
  jenisPembayaran?: string;
  /** Kanal/bank, mis. "bca", "bni", "permata". */
  kanalPembayaran?: string;
  /** Waktu pembayaran dikonfirmasi (ISO). */
  dibayarPada?: string;
  /** Batas waktu bayar (ISO); lewat dari ini pesanan dibatalkan otomatis. */
  batasBayar?: string;
  /** Dihitung server. Total yang dibayar pembeli = `total` + `biayaKirim` - `diskon`. */
  biayaKirim?: number;
  diskon?: number;
  totalBayar?: number;
  status: StatusPesanan;
  waktu: string;
  /** Waktu pesanan dibuat (ISO). Dasar pengelompokan penjualan per hari di Dashboard dan Laporan Pesanan. */
  dibuatPada?: string;
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
  /** Jejak pembatalan: siapa yang membatalkan, alasannya, dan waktunya (ISO). */
  dibatalkanOleh?: "pembeli" | "admin" | "sistem";
  alasanBatal?: string;
  dibatalkanPada?: string;
  /** Ulasan pembeli setelah pesanan selesai (satu per pesanan). */
  ulasan?: UlasanPesanan;
}

// Tab filter di halaman Pesanan; `status: null` = semua pesanan.
export interface TabPesanan {
  label: string;
  status: StatusPesanan[] | null;
}
