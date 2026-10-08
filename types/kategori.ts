export interface SubKategori {
  id: string;
  nama: string;
  ikon: string;
}

// Kategori dua tingkat seperti di app pembeli: kategori besar → sub-kategori.
// Penjual memilih SATU sub-kategori per produk; kategori besar mengikuti.
export interface KategoriInduk extends SubKategori {
  anak: SubKategori[];
}