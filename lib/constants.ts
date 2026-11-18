// Konstanta lintas-fitur. Angka/teks yang dipakai di lebih dari satu tempat
// didefinisikan di sini supaya tidak ada "magic value" yang tersebar.

/** "Hari ini" pada data dummy (data awal ditulis untuk tanggal ini). */
export const TANGGAL_DATA_DUMMY = "24 Okt 2026";
export const BULAN_LAPORAN = "Oktober";
export const PERIODE_LAPORAN = `${BULAN_LAPORAN} 2026`;

/** Jumlah baris per halaman pada tabel yang berpaginasi. */
export const UKURAN_HALAMAN = 5;

/**
 * Lama simulasi permintaan jaringan (lib/fake-api.ts) sampai ada backend sungguhan.
 * Dipilih menurut "berat" aksinya: memuat ulang data < menyimpan form < transaksi keuangan.
 */
export const LATENSI = { cepat: 600, normal: 900, lambat: 1400 } as const;

/** Jeda singkat sebelum modal menutup sendiri setelah form berhasil disimpan. */
export const TUTUP_MODAL_SETELAH_SIMPAN_MS = 500;

/** Foto profil pengguna. */
export const MAKS_UKURAN_FOTO_BYTES = 2 * 1024 * 1024;

/** Foto produk: jumlah per produk, ukuran file asli yang diterima, lalu diperkecil sebelum disimpan. */
export const MAKS_FOTO_PRODUK = 5;
export const MAKS_UKURAN_FOTO_PRODUK_BYTES = 5 * 1024 * 1024;
export const MAKS_SISI_FOTO_PX = 1280;
export const KUALITAS_FOTO = 0.82;

/** Batas isian detail produk. */
export const MAKS_SPESIFIKASI = 8;
export const MAKS_DESKRIPSI = 600;
export const MAKS_SARAN_PENYIMPANAN = 200;

/** Kloter jemput kurir desa sore hari. */
export const JAM_JEMPUT_SORE = "15:00 WIB";

/** Dana penjual dilepas otomatis sekian jam setelah paket tiba di pos, bila pembeli belum menekan "Pesanan Diterima" dan tidak ada komplain (keputusan D7). */
export const PELEPASAN_OTOMATIS_JAM = 24;

/** Alat bantu pengembangan (mis. simulasi aksi pembeli). Otomatis hilang pada build produksi. */
export const MODE_DEMO = process.env.NODE_ENV !== "production";

/** Biaya kurir desa (flat per dusun) dan subsidinya dari kas BUMDes. */
export const ONGKIR_FLAT = 5000;
export const SUBSIDI_ONGKIR = 5000;

/** Pengisian ulang data otomatis & pembaruan jam. */
export const INTERVAL_REFRESH_DATA_MS = 30_000;
export const INTERVAL_PEMBARUAN_JAM_MS = 60_000;
