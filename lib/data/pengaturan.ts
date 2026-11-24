import type { JadwalOperasional, PengaturanLapak, ProfilPengguna, TutupSementara } from "@/types";

export const JADWAL_AWAL: JadwalOperasional[] = [
  { hari: "Senin", status: "buka-penuh", buka: "06:30", tutup: "17:30", cutOff: "14:00", catatan: "Ikut Pengiriman Sore" },
  { hari: "Selasa s.d. Jumat", status: "buka-penuh", buka: "06:30", tutup: "17:30", cutOff: "14:00", catatan: "Ikut Pengiriman Sore" },
  { hari: "Sabtu (Setengah Hari)", status: "buka-siang", buka: "06:30", tutup: "15:00", cutOff: "12:00", catatan: "Pengiriman Khusus Pagi" },
  { hari: "Minggu", status: "khusus", buka: "07:00", tutup: "12:00", cutOff: "09:30", catatan: "Penyerahan Langsung" },
];

export const KOMODITAS_UNGGULAN_DEFAULT = ["Beras Pandan Wangi", "Jagung Manis Pipil", "Cabai Rawit Merah", "Telur Kampung"];
export const MAKS_KOMODITAS_UNGGULAN = 6;

export const NOMOR_REGISTRASI = "REG-POKTAN-35071988-SKR";

export const MAKS_PESAN_TUTUP = 80;
export const TUTUP_AWAL: TutupSementara = { aktif: false, kategori: [], sampai: "", pesan: "" };

// Nilai awal form Pengaturan (data dummy sampai ada backend).
export const PENGATURAN_AWAL: PengaturanLapak = {
  namaLapak: "Poktan Krajan Makmur",
  whatsapp: "812-3456-7890",
  deskripsi:
    "Poktan Krajan Makmur beranggotakan 18 petani aktif mengelola 14 hektar lahan sawah subur beririgasi teknis di Dusun Krajan. Didampingi penyuluh PPL Desa Sukorejo dengan standar pupuk organik BUMDes Berdaya.",
  komoditasUnggulan: KOMODITAS_UNGGULAN_DEFAULT,
  jadwal: JADWAL_AWAL,
  titikJemput: { nama: "Lumbung Poktan Krajan", alamat: "Dusun Krajan RT 02 / RW 01 (Rumah Pak Sutrisno)" },
  petunjukAkses: "Gerbang lumbung terbuka pukul 06:30, timbangan duduk digital tersedia di teras",
};

export const PROFIL_AWAL: ProfilPengguna = { nama: "Pak Sutrisno", jabatan: "Ketua Poktan" };
