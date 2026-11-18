import { daftarFoto } from "./fotoUrl";

// Bentuk data ulasan dari Express API (GET /api/admin/reviews).
export interface UlasanApi {
  id: number;
  rating: number;
  tags: string[] | string | null;
  note: string | null;
  courierLiked: boolean | null;
  dibuatPada: string;
  kode: string;
  pembeli: string;
  foto: string[] | string | null;
  /** Rating tiap komoditas pada pesanan ini. */
  items: { komoditas: string; rating: number }[];
}

export interface RingkasanUlasanApi {
  total: number;
  rataRata: number;
  denganFoto: number;
  distribusi: Record<"1" | "2" | "3" | "4" | "5", number>;
}

export interface RatingProdukApi {
  productId: number | null;
  nama: string;
  rataRata: number;
  jumlah: number;
  denganFoto: number;
}

export interface DataUlasanApi {
  ringkasan: RingkasanUlasanApi;
  perProduk: RatingProdukApi[];
  ulasan: UlasanApi[];
}

// Alamat foto dinormalkan supaya bisa dibuka dari browser admin (lihat lib/foto.ts).
export const normalkanUlasan = (d: DataUlasanApi): DataUlasanApi => ({ ...d, ulasan: d.ulasan.map((u) => ({ ...u, foto: daftarFoto(u.foto) })) });

export function bacaTags(tags: UlasanApi["tags"]): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  try {
    const d = JSON.parse(tags);
    return Array.isArray(d) ? d.map(String) : [];
  } catch {
    return [];
  }
}

/** 4.666 → "4,7" (format Indonesia). */
export const formatRating = (n: number): string => n.toFixed(1).replace(".", ",");
