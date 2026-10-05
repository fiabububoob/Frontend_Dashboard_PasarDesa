import type { Warta } from "@/types";

// Angka bulanan yang belum punya sumber data (menunggu backend); sisanya dihitung di lib/stats.ts.
export const RINGKASAN_PENJUALAN = { transaksi: 248, tren: "+18.4%" };

// Volume tren panen 7 hari terakhir, dipakai chart batang di Ringkasan.
export const TREN_PANEN = [
  { hari: "Kam", "Beras Pandan Wangi": 30, "Jagung Manis Organik": 22, "Cabai Rawit Merah": 14, "Telur Ayam Kampung": 10 },
  { hari: "Jum", "Beras Pandan Wangi": 42, "Jagung Manis Organik": 18, "Cabai Rawit Merah": 20, "Telur Ayam Kampung": 26 },
  { hari: "Sab", "Beras Pandan Wangi": 60, "Jagung Manis Organik": 48, "Cabai Rawit Merah": 30, "Telur Ayam Kampung": 34 },
  { hari: "Min", "Beras Pandan Wangi": 50, "Jagung Manis Organik": 30, "Cabai Rawit Merah": 24, "Telur Ayam Kampung": 20 },
  { hari: "Sen", "Beras Pandan Wangi": 22, "Jagung Manis Organik": 16, "Cabai Rawit Merah": 12, "Telur Ayam Kampung": 14 },
  { hari: "Sel", "Beras Pandan Wangi": 40, "Jagung Manis Organik": 32, "Cabai Rawit Merah": 28, "Telur Ayam Kampung": 20 },
  { hari: "Hari Ini", "Beras Pandan Wangi": 55, "Jagung Manis Organik": 44, "Cabai Rawit Merah": 20, "Telur Ayam Kampung": 38 },
];

// Seri chart tren panen. `hargaPerKg` = harga acuan untuk mengubah volume (kg)
// jadi nilai Rupiah di chart (toggle Rp) dan Laporan Panen.
export const TREN_SERIES = [
  { key: "Beras Pandan Wangi", color: "bg-brand-600", hargaPerKg: 13600 },
  { key: "Jagung Manis Organik", color: "bg-brand-200", hargaPerKg: 12000 },
  { key: "Cabai Rawit Merah", color: "bg-warn-400", hargaPerKg: 45000 },
  { key: "Telur Ayam Kampung", color: "bg-ink-200", hargaPerKg: 52000 },
] as const;

export const KURIR_AKTIF = {
  nama: "Mas Slamet Raharjo",
  inisial: "SR",
  armada: "Armada Motor Roda Tiga BUMDes",
  rute: "Lumbung Poktan Krajan → Drop-point Sidomulyo",
  jamTiba: "14:45 WIB",
  estimasi: "14:45 WIB (~30 menit lagi)",
  telepon: "081234567890",
};

export const HOTLINE_BUMDES = {
  nama: "CS BUMDes Hotline",
  jam: "Senin–Sabtu · 07.00–17.00 WIB",
  telepon: "081298765432",
};

export const WARTA_LIST: Warta[] = [
  {
    id: "warta-1",
    label: "Resmi",
    tanggal: "24 Okt 2023",
    judul: "Subsidi Ongkos Kirim Panen Raya Diperpanjang",
    isi: "Pemerintah Desa Sukorejo bersama BUMDes memperpanjang gratis biaya kurir antar-dusun hingga akhir bulan untuk menjaga kestabilan harga komoditas pangan. Poktan tidak perlu mendaftar ulang; subsidi otomatis terpotong dari ongkir setiap pesanan.",
  },
  {
    id: "warta-2",
    label: "Info",
    tanggal: "20 Okt 2023",
    judul: "Standar Timbangan Tera Aktif 2023",
    isi: "Seluruh timbangan lumbung wajib memakai tera ulang tahun 2023. Petugas metrologi akan keliling ke tiap lumbung pekan depan; mohon siapkan timbangan sebelum pukul 09.00.",
  },
  {
    id: "warta-3",
    label: "Pengumuman",
    tanggal: "15 Okt 2023",
    judul: "Jadwal Kloter Kurir Sore Tetap Pukul 15.00",
    isi: "Kurir desa tetap menjemput paket kloter sore pukul 15.00 WIB. Paket yang belum berstatus siap jemput setelah jam tersebut akan masuk kloter berikutnya.",
  },
];
