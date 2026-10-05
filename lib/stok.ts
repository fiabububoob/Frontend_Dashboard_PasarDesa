import type { Komoditas } from "@/types";

// Satu aturan untuk menentukan status stok, dipakai tiap kali stok berubah.
// < AMBANG_KRITIS unit = kritis (sesuai label "Kritis (<5 unit)" di halaman Komoditas),
// <= RASIO_MENENGAH dari kapasitas = menengah, selain itu aman.
export const AMBANG_KRITIS = 5;
const RASIO_MENENGAH = 0.4;

export function hitungStatusStok(stok: number, stokMaks: number): Komoditas["statusStok"] {
  if (stok < AMBANG_KRITIS) return "kritis";
  if (stok / stokMaks <= RASIO_MENENGAH) return "menengah";
  return "aman";
}

export interface RingkasanKategori {
  nama: string;
  count: number;
  kritis: number;
}

// Jumlah komoditas (dan yang stoknya kritis) per kategori, urutan sesuai kemunculan.
export function kategoriList(komoditas: Komoditas[]): RingkasanKategori[] {
  const map = new Map<string, RingkasanKategori>();
  for (const k of komoditas) {
    const row = map.get(k.kategori) ?? { nama: k.kategori, count: 0, kritis: 0 };
    row.count += 1;
    if (k.statusStok === "kritis") row.kritis += 1;
    map.set(k.kategori, row);
  }
  return Array.from(map.values());
}

// Nama di pesanan ("Cabai Rawit 500g") tidak persis sama dengan nama di
// katalog ("Cabai Rawit Merah Petik Pagi 500g"), jadi dicocokkan lewat dua
// kata pertama (JUMLAH_KATA_KUNCI).
const JUMLAH_KATA_KUNCI = 2;

function kunci(nama: string) {
  return nama.toLowerCase().split(/\s+/).slice(0, JUMLAH_KATA_KUNCI).join(" ");
}

export function cariKomoditasByNama(komoditas: Komoditas[], nama: string) {
  const k = kunci(nama);
  return komoditas.find((item) => kunci(item.nama) === k);
}

export const hitungKritis = (komoditas: Komoditas[]) => komoditas.filter((k) => k.statusStok === "kritis").length;
export const hitungTampil = (komoditas: Komoditas[]) => komoditas.filter((k) => k.tampil).length;
