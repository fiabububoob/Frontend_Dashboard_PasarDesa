export type StatusKemas = "perlu-dikemas" | "sedang-dikemas" | "siap-jemput" | "selesai";

export type MetodeBayar = "QRIS" | "COD";

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

export interface Pesanan {
  id: string;
  pembeli: string;
  inisial: string;
  alamat: string;
  dropPoint: string;
  metodeBayar: MetodeBayar;
  status: StatusKemas;
  waktu: string;
  total: number;
  items: PesananItem[];
  catatan?: string;
  telepon?: string; // nomor WhatsApp pembeli
  kurir?: KurirPesanan;
}
