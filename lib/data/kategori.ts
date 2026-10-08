import type { KategoriInduk } from "@/types";

// Pohon kategori sesuai app pembeli (keputusan D3). Ganti di sini saja bila
// kategori berubah; filter, form, impor CSV, dan ikon ikut menyesuaikan.
export const KATEGORI_INDUK: KategoriInduk[] = [
  {
    id: "hasil-tani",
    nama: "Hasil Tani",
    ikon: "🌱",
    anak: [
      { id: "beras-gabah", nama: "Beras & Gabah", ikon: "🌾" },
      { id: "sayur-petik-pagi", nama: "Sayur Petik Pagi", ikon: "🥬" },
      { id: "buah-desa", nama: "Buah Desa", ikon: "🍊" },
    ],
  },
  {
    id: "ternak-ikan",
    nama: "Ternak Ikan",
    ikon: "🐟",
    anak: [{ id: "telur-ayam", nama: "Telur & Ayam", ikon: "🥚" }],
  },
  {
    id: "umkm-desa",
    nama: "UMKM Desa",
    ikon: "🏪",
    anak: [
      { id: "makanan-olahan", nama: "Makanan Olahan", ikon: "🍘" },
      { id: "minuman-desa", nama: "Minuman Desa", ikon: "🥤" },
      { id: "herbal-toga", nama: "Herbal & Toga", ikon: "🌿" },
      { id: "kerajinan-warga", nama: "Kerajinan Warga", ikon: "🧺" },
      { id: "karya-warga", nama: "Karya Warga", ikon: "✨" },
    ],
  },
  {
    id: "sembako",
    nama: "Sembako",
    ikon: "🛒",
    anak: [{ id: "dapur-rumah", nama: "Dapur & Rumah", ikon: "🍳" }],
  },
];