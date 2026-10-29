// Label produk yang tampil di foto/kartu app pembeli. Daftar tetap (lib/data/badgeProduk.ts); satu produk boleh punya beberapa.
export type BadgeProduk = "panen-baru" | "murni" | "segar-harian" | "favorit" | "sertifikasi-bumdes";

export interface Spesifikasi {
  label: string;
  nilai: string;
}

// Siapa yang menjual/menghasilkan komoditas (kolom "Penjual" & pilihan "Jenis sumber").
export type SumberKomoditas = "Petani" | "UMKM" | "BUMDes";

// Pengaturan pengiriman & kebijakan klaim per komoditas (langkah 5 form).
export interface PengirimanKomoditas {
  antarKurir: boolean;
  ambilDiKantor: boolean;
  areaAntar?: string;
  /** 0 = gratis. */
  ongkir?: number;
  estimasi?: string;
  /** Jam terakhir pemesanan masuk hari itu, mis. "15:00". */
  jamOrderTerakhir?: string;
  lokasiAmbil?: string;
  beratKirimKg?: number;
  bisaDiklaim: boolean;
  batasKlaim?: string;
  catatanKebijakan?: string;
}

export interface Komoditas {
  id: string;
  sku: string;
  nama: string;
  /** Emoji cadangan; dipakai bila produk belum punya foto dan di tempat yang hanya bisa menampilkan teks. */
  gambar: string;
  /** URL/data-URL foto; urutan pertama = foto sampul. */
  foto?: string[];
  /** Nama sub-kategori (lihat lib/data/kategori.ts). */
  kategori: string;
  asalBlok: string;
  harga: number;
  satuan: string;
  hargaKeterangan?: string;
  /** Harga sebelum diskon (tampil dicoret); harus lebih besar dari `harga`. */
  hargaCoret?: number;
  /** Ukuran/takaran jual, mis. "5 kg", "250 ml". */
  ukuran?: string;
  deskripsi?: string;
  spesifikasi?: Spesifikasi[];
  saranPenyimpanan?: string;
  /** Tanggal panen (YYYY-MM-DD, WIB). Bila ada, label waktu panen dihitung dari sini. */
  tanggalPanen?: string;
  badge?: BadgeProduk[];
  stok: number;
  stokMaks: number;
  statusStok: "aman" | "menengah" | "kritis";
  waktuPanen: string;
  waktuKeterangan?: string;
  tampil: boolean;
  tag?: string;
  sumber?: SumberKomoditas;
  /** Nama penjual (kelompok tani / UMKM / BUMDes). Bila kosong, dipakai `asalBlok`. */
  penjual?: string;
  /** Jumlah unit yang sudah terjual. */
  terjual?: number;
  /** Mis. "Siap kirim", "Panen pagi". */
  ketersediaan?: string;
  /** Stok sama atau di bawah angka ini dianggap rendah. Bila kosong, dipakai ambang bawaan. */
  batasStokRendah?: number;
  minBeli?: number;
  maksBeli?: number;
  keunggulan?: string[];
  garansiMutu?: string;
  pengiriman?: PengirimanKomoditas;
}

// Data minimal untuk membuat komoditas baru (form tambah & impor CSV).
// id, sku, status stok, dan keterangan panen dibuat oleh state komoditas.
export type KomoditasBaru = Pick<Komoditas, "nama" | "gambar" | "kategori" | "asalBlok" | "harga" | "satuan" | "stok" | "stokMaks"> &
  Partial<Pick<Komoditas, "sumber" | "penjual" | "ketersediaan" | "batasStokRendah" | "minBeli" | "maksBeli" | "keunggulan" | "garansiMutu" | "pengiriman" | "foto" | "tag" | "hargaKeterangan" | "tampil" | "hargaCoret" | "ukuran" | "deskripsi" | "spesifikasi" | "saranPenyimpanan" | "tanggalPanen" | "badge">>;

export type KomoditasUbah = Partial<
  Pick<
    Komoditas,
    | "nama"
    | "gambar"
    | "foto"
    | "kategori"
    | "asalBlok"
    | "harga"
    | "hargaCoret"
    | "satuan"
    | "ukuran"
    | "stok"
    | "stokMaks"
    | "tag"
    | "hargaKeterangan"
    | "deskripsi"
    | "spesifikasi"
    | "saranPenyimpanan"
    | "tanggalPanen"
    | "badge"
    | "sumber"
    | "penjual"
    | "ketersediaan"
    | "batasStokRendah"
    | "minBeli"
    | "maksBeli"
    | "keunggulan"
    | "garansiMutu"
    | "pengiriman"
  >
>;