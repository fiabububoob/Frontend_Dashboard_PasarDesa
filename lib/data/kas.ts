import type { Rekening, TransaksiKas } from "@/types";

// Mock data layer untuk "Kas & Penarikan Saldo". Saldo, escrow, omset, dan
// jumlah transaksi TIDAK ditulis sebagai teks di sini — dihitung dari state di
// DashboardDataProvider supaya berubah ketika pesanan selesai atau dana dicairkan.

export const KAS_SALDO_AWAL = 4_620_000;
export const KAS_OMSET_AWAL = 14_850_000;
export const KAS_SUBSIDI = 450_000;
export const KAS_MIN_TARIK = 50_000;

export const KAS_BANK = ["Bank BRI", "Bank BNI", "Bank Mandiri", "BSI", "Bank Jatim"] as const;

export const KAS_REKENING: Rekening = {
  bank: "Bank BRI",
  unit: "Unit Sukorejo",
  atasNama: "Sutrisno (Poktan Krajan)",
  nomor: "0182-01-009841-50-2",
  terverifikasi: true,
};

export const KAS_KATEGORI = ["Penjualan Lapak", "Pencairan Kas", "Subsidi Desa"] as const;

export const KAS_TRANSAKSI: TransaksiKas[] = [
  {
    id: "TRX-0012",
    tanggal: "24 Okt 2026",
    waktu: "14:20 WIB",
    deskripsi: "Hasil Penjualan Komoditas",
    referensi: "Invoice #PSD-20261024-0085 (Beras Pandan Wangi 5kg x2)",
    kategori: "Penjualan Lapak",
    nominal: 136000,
    status: "Berhasil Masuk",
  },
  {
    id: "TRX-0011",
    tanggal: "24 Okt 2026",
    waktu: "10:05 WIB",
    deskripsi: "Hasil Penjualan Komoditas",
    referensi: "Invoice #PSD-20261024-0082 (Telur Ayam Kampung 2 mika)",
    kategori: "Penjualan Lapak",
    nominal: 52000,
    status: "Berhasil Masuk",
  },
  {
    id: "TRX-0010",
    tanggal: "23 Okt 2026",
    waktu: "09:15 WIB",
    deskripsi: "Pencairan Dana Kas ke BRI Sutrisno",
    referensi: "No. Ref KAS-SKR-8812, Unit Sukorejo",
    kategori: "Pencairan Kas",
    nominal: -3500000,
    status: "Berhasil Ditransfer",
  },
  {
    id: "TRX-0009",
    tanggal: "23 Okt 2026",
    waktu: "08:40 WIB",
    deskripsi: "Hasil Penjualan Komoditas",
    referensi: "Invoice #PSD-20261023-0077 (Madu Murni Randu 3 botol)",
    kategori: "Penjualan Lapak",
    nominal: 135000,
    status: "Berhasil Masuk",
  },
  {
    id: "TRX-0008",
    tanggal: "22 Okt 2026",
    waktu: "16:45 WIB",
    deskripsi: "Reimburse Subsidi Ongkir BUMDes",
    referensi: "Kompensasi ongkir kurir warga RW 02",
    kategori: "Subsidi Desa",
    nominal: 25000,
    status: "Berhasil Disubsidi",
  },
  {
    id: "TRX-0007",
    tanggal: "22 Okt 2026",
    waktu: "11:30 WIB",
    deskripsi: "Hasil Penjualan Komoditas",
    referensi: "Invoice #PSD-20261022-0063 (Gabah Kering Giling 2 karung)",
    kategori: "Penjualan Lapak",
    nominal: 420000,
    status: "Berhasil Masuk",
  },
  {
    id: "TRX-0006",
    tanggal: "21 Okt 2026",
    waktu: "15:10 WIB",
    deskripsi: "Penarikan Tunai di Balai Desa",
    referensi: "Kasir Loket BUMDes Balai Desa • Bukti: TNI-SKR-0307",
    kategori: "Pencairan Kas",
    nominal: -1000000,
    status: "Berhasil Dicairkan",
  },
  {
    id: "TRX-0005",
    tanggal: "21 Okt 2026",
    waktu: "09:25 WIB",
    deskripsi: "Hasil Penjualan Komoditas",
    referensi: "Invoice #PSD-20261021-0052 (Tomat Merah 5 kg + Kangkung 10 ikat)",
    kategori: "Penjualan Lapak",
    nominal: 110000,
    status: "Berhasil Masuk",
  },
  {
    id: "TRX-0004",
    tanggal: "20 Okt 2026",
    waktu: "10:02 WIB",
    deskripsi: "Hasil Penjualan Beras Panen Raya",
    referensi: "Invoice #PSD-20261020-0041 (Beras Ciherang Wangi 35 kg)",
    kategori: "Penjualan Lapak",
    nominal: 408000,
    status: "Berhasil Masuk",
  },
  {
    id: "TRX-0003",
    tanggal: "19 Okt 2026",
    waktu: "13:55 WIB",
    deskripsi: "Subsidi Pupuk Organik Musim Gadu",
    referensi: "Program Ketahanan Pangan Desa • SK Desa No. 14/BUMD/2022",
    kategori: "Subsidi Desa",
    nominal: 150000,
    status: "Berhasil Disubsidi",
  },
  {
    id: "TRX-0002",
    tanggal: "18 Okt 2026",
    waktu: "14:00 WIB",
    deskripsi: "Hasil Penjualan Komoditas",
    referensi: "Invoice #PSD-20261018-0030 (Ayam Kampung 3 ekor)",
    kategori: "Penjualan Lapak",
    nominal: 195000,
    status: "Berhasil Masuk",
  },
  {
    id: "TRX-0001",
    tanggal: "17 Okt 2026",
    waktu: "09:00 WIB",
    deskripsi: "Pencairan Dana Kas ke BRI Sutrisno",
    referensi: "No. Referensi Bank: KAS-SKR-8790 • Unit Sukorejo",
    kategori: "Pencairan Kas",
    nominal: -2000000,
    status: "Berhasil Ditransfer",
  },
];
