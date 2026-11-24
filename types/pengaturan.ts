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

// Satu-satunya tempat kurir desa mengambil panen yang sudah dikemas.
export interface TitikJemput {
  nama: string;
  alamat: string;
}

// Isi form Pengaturan (yang disimpan lewat tombol "Simpan Pengaturan").
// Penutupan sementara sengaja terpisah (lihat TutupSementara): berlaku langsung.
export interface PengaturanLapak {
  namaLapak: string;
  whatsapp: string;
  deskripsi: string;
  komoditasUnggulan: string[];
  jadwal: JadwalOperasional[];
  titikJemput: TitikJemput;
  /** Petunjuk untuk kurir. Tidak ditampilkan ke warga. */
  petunjukAkses: string;
}

// Penutupan sementara (jeda tanam, cuaca ekstrem, libur, gagal panen, dll.).
// Berlaku seketika setelah dikonfirmasi, tidak menunggu "Simpan Pengaturan".
export interface TutupSementara {
  aktif: boolean;
  /** Id kategori induk yang ditutup (lihat KATEGORI_INDUK). Kosong = seluruh toko. */
  kategori: string[];
  /** Tanggal terakhir tutup (YYYY-MM-DD, WIB). Kosong = tutup sampai dibuka manual. */
  sampai: string;
  /** Pesan singkat untuk warga. Boleh kosong. */
  pesan: string;
}

// Profil pengguna yang login (kanan atas). Foto disimpan sebagai data URL.
export interface ProfilPengguna {
  nama: string;
  jabatan: string;
  foto?: string;
}
