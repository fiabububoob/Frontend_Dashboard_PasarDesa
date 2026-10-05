export type StatusJadwal = "buka-penuh" | "buka-siang" | "khusus" | "tutup";

// Satu baris jadwal buka lapak. Jam disimpan "HH:MM" (24 jam, WIB) supaya bisa
// divalidasi dan dibandingkan dengan jam sekarang.
export interface JadwalOperasional {
  hari: string;
  status: StatusJadwal;
  buka: string;
  tutup: string;
  cutOff: string; // batas pesanan harian
  catatan: string;
}

// Isi form Pengaturan (yang disimpan lewat tombol "Simpan Pengaturan").
// Mode jeda tanam sengaja terpisah: berlaku langsung setelah konfirmasi.
export interface PengaturanLapak {
  namaLapak: string;
  whatsapp: string;
  deskripsi: string;
  komoditasUnggulan: string[];
  jadwal: JadwalOperasional[];
  dropPointId: string;
  petunjukAkses: string;
  standarPengemasan: string[];
}

// Profil pengguna yang login (kanan atas). Foto disimpan sebagai data URL.
export interface ProfilPengguna {
  nama: string;
  jabatan: string;
  foto?: string;
}
