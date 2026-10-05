import type { JadwalOperasional, PengaturanLapak, ProfilPengguna } from "@/types";

export const JADWAL_AWAL: JadwalOperasional[] = [
  { hari: "Senin", status: "buka-penuh", buka: "06:30", tutup: "17:30", cutOff: "14:00", catatan: "Ikut Pengiriman Sore" },
  { hari: "Selasa s.d. Jumat", status: "buka-penuh", buka: "06:30", tutup: "17:30", cutOff: "14:00", catatan: "Ikut Pengiriman Sore" },
  { hari: "Sabtu (Setengah Hari)", status: "buka-siang", buka: "06:30", tutup: "15:00", cutOff: "12:00", catatan: "Pengiriman Khusus Pagi" },
  { hari: "Minggu", status: "khusus", buka: "07:00", tutup: "12:00", cutOff: "09:30", catatan: "Penyerahan Langsung" },
];

export const LOKASI_DROP_POINT = [
  { id: "lumbung", nama: "Lumbung Poktan Krajan", alamat: "Dusun Krajan RT 02 / RW 01 (Rumah Pak Sutrisno)", catatan: "Titik serah-terima utama" },
  { id: "kasir", nama: "Kasir Kantor BUMDes", alamat: "Kompleks Balai Desa Sukorejo No. 12", catatan: "Transit lumbung pusat" },
  { id: "ronda", nama: "Pos Ronda Gapura", alamat: "Gerbang Masuk Dusun Sidomulyo (RT 05)", catatan: "Khusus gabah kering" },
];

export const STANDAR_PENGEMASAN = ["Karung resmi cap BUMDes", "Segel timbangan digital sah", "Pemisahan sayur basah & beras"];

export const KOMODITAS_UNGGULAN_DEFAULT = ["Beras Pandan Wangi", "Jagung Manis Pipil", "Cabai Rawit Merah", "Telur Kampung"];
export const MAKS_KOMODITAS_UNGGULAN = 6;

export const NOMOR_REGISTRASI = "REG-POKTAN-35071988-SKR";

// Nilai awal form Pengaturan (data dummy sampai ada backend).
export const PENGATURAN_AWAL: PengaturanLapak = {
  namaLapak: "Poktan Krajan Makmur",
  whatsapp: "812-3456-7890",
  deskripsi:
    "Poktan Krajan Makmur beranggotakan 18 petani aktif mengelola 14 hektar lahan sawah subur beririgasi teknis di Dusun Krajan. Didampingi penyuluh PPL Desa Sukorejo dengan standar pupuk organik BUMDes Berdaya.",
  komoditasUnggulan: KOMODITAS_UNGGULAN_DEFAULT,
  jadwal: JADWAL_AWAL,
  dropPointId: "lumbung",
  petunjukAkses: "Gerbang lumbung terbuka pukul 06:30, timbangan duduk digital tersedia di teras",
  standarPengemasan: STANDAR_PENGEMASAN,
};

export const PROFIL_AWAL: ProfilPengguna = { nama: "Pak Sutrisno", jabatan: "Ketua Poktan" };
