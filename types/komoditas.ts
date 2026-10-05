export interface Komoditas {
  id: string;
  sku: string;
  nama: string;
  gambar: string;
  kategori: string;
  asalBlok: string;
  harga: number;
  satuan: string;
  hargaKeterangan?: string;
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
  Partial<Pick<Komoditas, "tag" | "hargaKeterangan" | "tampil">>;

export type KomoditasUbah = Partial<
  Pick<Komoditas, "nama" | "gambar" | "kategori" | "asalBlok" | "harga" | "satuan" | "stok" | "stokMaks" | "tag" | "hargaKeterangan">
>;
