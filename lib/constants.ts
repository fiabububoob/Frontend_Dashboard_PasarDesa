// Konstanta lintas-fitur. Angka/teks yang dipakai di lebih dari satu tempat
// didefinisikan di sini supaya tidak ada "magic value" yang tersebar.

/** "Hari ini" pada data dummy (data awal ditulis untuk tanggal ini). */
export const TANGGAL_DATA_DUMMY = "24 Okt 2023";
export const BULAN_LAPORAN = "Oktober";
export const PERIODE_LAPORAN = `${BULAN_LAPORAN} 2023`;

/** Jumlah baris per halaman pada tabel yang berpaginasi. */
export const UKURAN_HALAMAN = 5;

/**
 * Lama simulasi permintaan jaringan (lib/fake-api.ts) sampai ada backend sungguhan.
 * Dipilih menurut "berat" aksinya: memuat ulang data < menyimpan form < transaksi keuangan.
 */
export const LATENSI = { cepat: 600, normal: 900, lambat: 1400 } as const;

/** Jeda singkat sebelum modal menutup sendiri setelah form berhasil disimpan. */
export const TUTUP_MODAL_SETELAH_SIMPAN_MS = 500;

export const MAKS_UKURAN_FOTO_BYTES = 2 * 1024 * 1024;

/** Kloter jemput kurir desa sore hari. */
export const JAM_JEMPUT_SORE = "15:00 WIB";

/** Biaya kurir desa (flat per dusun) dan subsidinya dari kas BUMDes. */
export const ONGKIR_FLAT = 5000;
export const SUBSIDI_ONGKIR = 5000;

/** Pengisian ulang data otomatis & pembaruan jam. */
export const INTERVAL_REFRESH_DATA_MS = 30_000;
export const INTERVAL_PEMBARUAN_JAM_MS = 60_000;
