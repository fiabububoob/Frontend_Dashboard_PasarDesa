import type { KurirPesanan, Pesanan, PesananItem } from "@/types";
import { KURIR_AKTIF } from "./ringkasan";
import { formatRupiah } from "@/lib/format";

// Mock data layer for "Pesanan & Pengiriman Kurir Desa". See komoditas.ts
// for the note on swapping this for a real API call later.
//
// Statistik & jumlah di tab (Perlu Dikemas, Siap Jemput, dst.) TIDAK ditulis
// di sini — dihitung dari daftar pesanan di bawah, jadi selalu cocok dengan isinya.

export const PESANAN_TABS = [
  { key: "semua", label: "Semua Pesanan" },
  { key: "perlu-dikemas", label: "Perlu Disiapkan / Dikemas" },
  { key: "siap-jemput", label: "Siap Diambil Kurir Desa" },
  { key: "sedang-dikemas", label: "Sedang Dikirim ke Drop-Point" },
  { key: "selesai", label: "Selesai" },
] as const;

export const KURIR_DEFAULT: KurirPesanan = {
  nama: KURIR_AKTIF.nama,
  armada: "Motor Roda 3 BUMDes (N 4921 XD)",
  jadwal: "15:00 - 17:00 WIB",
  telepon: KURIR_AKTIF.telepon,
};

// Nama komoditas sengaja diawali sama dengan nama di katalog (dua kata pertama)
// supaya item pesanan bisa ditautkan ke detail komoditas.
function item(komoditas: string, qty: number, satuan: string, harga: number, tag?: string): PesananItem {
  return { komoditas, jumlah: `${qty} ${satuan} x ${formatRupiah(harga)}`, hargaSatuan: harga, subtotal: qty * harga, tag };
}

function pesanan(p: Omit<Pesanan, "total" | "inisial"> & { inisial?: string }): Pesanan {
  const inisial = p.inisial ?? p.pembeli.replace(/^(Pak|Ibu|Bu|Mas|Mbak|Warung)\s+/i, "").split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return { ...p, inisial, total: p.items.reduce((sum, i) => sum + i.subtotal, 0) };
}

export const PESANAN_LIST: Pesanan[] = [
  // ---- Perlu dikemas (5) --------------------------------------------------
  pesanan({
    id: "PSD-20231024-0089",
    pembeli: "Pak RT Joko Susanto",
    alamat: "Warga Krajan RT 02 / RW 01",
    dropPoint: "Pos Drop-Point BUMDes Krajan RT 02",
    metodeBayar: "QRIS",
    status: "perlu-dikemas",
    waktu: "14:15 WIB",
    telepon: "081355500189",
    catatan: "Titip di pos jaga depan gapura bila saya belum pulang dari ladang ya Mas.",
    kurir: KURIR_DEFAULT,
    items: [item("Beras Pandan Wangi Sukorejo", 1, "sak", 68000, "Grade A"), item("Jagung Manis Organik", 2, "ikat", 12000, "Bebas Pestisida")],
  }),
  pesanan({
    id: "PSD-20231024-0091",
    pembeli: "Ibu Siti Aminah",
    alamat: "Kompleks Balai Desa",
    dropPoint: "Drop-Point Balai Desa Sukorejo",
    metodeBayar: "COD",
    status: "perlu-dikemas",
    waktu: "14:30 WIB",
    telepon: "081355500191",
    items: [item("Cabai Rawit Merah", 1, "bungkus", 36000)],
  }),
  pesanan({
    id: "PSD-20231024-0092",
    pembeli: "Warung Bu Sri",
    alamat: "Dusun Sidomulyo Gang 3",
    dropPoint: "Pos Kamling Dusun Sidomulyo",
    metodeBayar: "QRIS",
    status: "perlu-dikemas",
    waktu: "14:40 WIB",
    telepon: "081355500192",
    items: [item("Beras Pandan Wangi", 2, "sak", 68000)],
  }),
  pesanan({
    id: "PSD-20231024-0093",
    pembeli: "Bu Lastri",
    alamat: "Dusun Sidomulyo RT 01",
    dropPoint: "Pos Kamling Dusun Sidomulyo",
    metodeBayar: "QRIS",
    status: "perlu-dikemas",
    waktu: "14:48 WIB",
    telepon: "081355500193",
    catatan: "Tomatnya tolong yang masih agak keras ya.",
    items: [item("Tomat Merah", 2, "kg", 15000, "Bebas Pestisida"), item("Kangkung Segar", 4, "ikat", 3500)],
  }),
  pesanan({
    id: "PSD-20231024-0094",
    pembeli: "Pak Haji Mansur",
    alamat: "Dusun Krajan RT 04",
    dropPoint: "Pos Drop-Point BUMDes Krajan RT 02",
    metodeBayar: "COD",
    status: "perlu-dikemas",
    waktu: "14:52 WIB",
    telepon: "081355500194",
    items: [item("Ayam Kampung Potong", 2, "ekor", 65000, "Halal"), item("Bawang Merah Brebes", 1, "kg", 34000)],
  }),

  // ---- Siap diambil kurir (3) ---------------------------------------------
  pesanan({
    id: "PSD-20231024-0086",
    pembeli: "Ibu Wahyuni",
    alamat: "Kompleks Balai Desa",
    dropPoint: "Drop-Point Balai Desa Sukorejo",
    metodeBayar: "QRIS",
    status: "siap-jemput",
    waktu: "13:20 WIB",
    telepon: "081355500186",
    kurir: KURIR_DEFAULT,
    items: [item("Beras Merah Organik", 1, "sak", 75000, "Organik"), item("Telur Bebek Asin", 2, "mika", 24000)],
  }),
  pesanan({
    id: "PSD-20231024-0087",
    pembeli: "Pak Darto",
    alamat: "Dusun Sidomulyo RT 03",
    dropPoint: "Pos Kamling Dusun Sidomulyo",
    metodeBayar: "QRIS",
    status: "siap-jemput",
    waktu: "13:35 WIB",
    telepon: "081355500187",
    kurir: KURIR_DEFAULT,
    items: [item("Gabah Kering Giling", 1, "karung", 210000)],
  }),
  pesanan({
    id: "PSD-20231024-0088",
    pembeli: "Warung Makan Bu Tini",
    alamat: "Jl. Raya Sukorejo No. 12",
    dropPoint: "Pos Drop-Point BUMDes Krajan RT 02",
    metodeBayar: "COD",
    status: "siap-jemput",
    waktu: "13:50 WIB",
    telepon: "081355500188",
    catatan: "Ambil sendiri di pos jam 4 sore.",
    kurir: KURIR_DEFAULT,
    items: [item("Telur Ayam Kampung", 3, "mika", 26000), item("Cabai Rawit Merah", 2, "bungkus", 22500)],
  }),

  // ---- Dalam antaran ke drop-point (2) ------------------------------------
  pesanan({
    id: "PSD-20231024-0083",
    pembeli: "Mbak Rina",
    alamat: "Dusun Tegalrejo Lor RT 02",
    dropPoint: "Pos Ronda Tegalrejo Lor",
    metodeBayar: "QRIS",
    status: "sedang-dikemas",
    waktu: "11:10 WIB",
    telepon: "081355500183",
    kurir: KURIR_DEFAULT,
    items: [item("Kedelai Lokal", 3, "kg", 14500), item("Jagung Manis Organik", 1, "kg", 12000)],
  }),
  pesanan({
    id: "PSD-20231024-0084",
    pembeli: "Pak Slamet Riyadi",
    alamat: "Dusun Krajan RT 05",
    dropPoint: "Pos Drop-Point BUMDes Krajan RT 02",
    metodeBayar: "QRIS",
    status: "sedang-dikemas",
    waktu: "11:45 WIB",
    telepon: "081355500184",
    kurir: KURIR_DEFAULT,
    items: [item("Beras Pandan Wangi", 1, "sak", 68000)],
  }),

  // ---- Selesai (4) ---------------------------------------------------------
  pesanan({
    id: "PSD-20231024-0080",
    pembeli: "Ibu Marni",
    alamat: "Kompleks Balai Desa",
    dropPoint: "Drop-Point Balai Desa Sukorejo",
    metodeBayar: "COD",
    status: "selesai",
    waktu: "08:05 WIB",
    telepon: "081355500180",
    kurir: KURIR_DEFAULT,
    items: [item("Kangkung Segar", 6, "ikat", 3500), item("Tomat Merah", 1, "kg", 15000)],
  }),
  pesanan({
    id: "PSD-20231024-0081",
    pembeli: "Pak Karyo",
    alamat: "Dusun Sidomulyo RT 02",
    dropPoint: "Pos Kamling Dusun Sidomulyo",
    metodeBayar: "QRIS",
    status: "selesai",
    waktu: "08:40 WIB",
    telepon: "081355500181",
    kurir: KURIR_DEFAULT,
    items: [item("Beras Merah Organik", 2, "sak", 75000, "Organik")],
  }),
  pesanan({
    id: "PSD-20231024-0082",
    pembeli: "Bu Endang",
    alamat: "Dusun Tegalrejo Lor RT 01",
    dropPoint: "Pos Ronda Tegalrejo Lor",
    metodeBayar: "QRIS",
    status: "selesai",
    waktu: "09:15 WIB",
    telepon: "081355500182",
    kurir: KURIR_DEFAULT,
    items: [item("Telur Ayam Kampung", 2, "mika", 26000)],
  }),
  pesanan({
    id: "PSD-20231024-0085",
    pembeli: "Warung Pak Gito",
    alamat: "Jl. Raya Sukorejo No. 3",
    dropPoint: "Pos Drop-Point BUMDes Krajan RT 02",
    metodeBayar: "COD",
    status: "selesai",
    waktu: "10:30 WIB",
    telepon: "081355500185",
    kurir: KURIR_DEFAULT,
    items: [item("Bawang Merah Brebes", 2, "kg", 34000), item("Cabai Rawit Merah", 1, "bungkus", 22500)],
  }),
];
