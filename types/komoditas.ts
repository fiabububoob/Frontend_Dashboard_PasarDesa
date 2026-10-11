// Label produk yang tampil di foto/kartu app pembeli. Daftar tetap (lib/data/badgeProduk.ts); satu produk boleh punya beberapa.
export type BadgeProduk = "panen-baru" | "murni" | "segar-harian" | "favorit" | "sertifikasi-bumdes";

export interface Spesifikasi {
  label: string;
  nilai: string;
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
}

// Data minimal untuk membuat komoditas baru (form tambah & impor CSV).
// id, sku, status stok, dan keterangan panen dibuat oleh state komoditas.
export type KomoditasBaru = Pick<Komoditas, "nama" | "gambar" | "kategori" | "asalBlok" | "harga" | "satuan" | "stok" | "stokMaks"> &
  Partial<Pick<Komoditas, "foto" | "tag" | "hargaKeterangan" | "tampil" | "hargaCoret" | "ukuran" | "deskripsi" | "spesifikasi" | "saranPenyimpanan" | "tanggalPanen" | "badge">>;

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
  >
>;