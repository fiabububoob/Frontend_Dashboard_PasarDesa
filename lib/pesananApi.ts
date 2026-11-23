import { tanggalWib } from "./kasApi";
import { urlFoto } from "./fotoUrl";
import type { Komplain, KurirPesanan, MetodeBayar, OpsiPengiriman, Pesanan, StatusPembayaran, StatusPesanan } from "@/types";

// Bentuk pesanan dari Express API (GET/PATCH /api/admin/orders).
export interface BarisPesananApi {
  id: number | string;
  kode: string;
  idPembayaran: string | null;
  pembeli: string;
  alamat: string | null;
  rtRw: string | null;
  patokan: string | null;
  dropPoint: string | null;
  opsiPengiriman: OpsiPengiriman | null;
  metodeBayar: string | null;
  telepon: string | null;
  catatan: string | null;
  status: string;
  total: number | string;
  tibaDiPosPada: string | null;
  kurir: KurirPesanan | string | null;
  komplain: Komplain | string | null;
  kirimUlang: boolean | number | null;
  dibuatPada: string;
  dibatalkanOleh?: "pembeli" | "admin" | "sistem" | null;
  alasanBatal?: string | null;
  dibatalkanPada?: string | null;
  statusPembayaran?: string | null;
  jenisPembayaran?: string | null;
  kanalPembayaran?: string | null;
  dibayarPada?: string | null;
  batasBayar?: string | null;
  biayaKirim?: number | string | null;
  diskon?: number | string | null;
  totalBayar?: number | string | null;
  ulasan?: { rating: number | string; tags: string[] | string | null; catatan: string | null; kurirDisukai: boolean | null; dibuatPada: string } | null;
  items: { komoditas: string; jumlah: number | string; satuan: string; hargaSatuan: number | string; subtotal: number | string; tag: string | null }[];
}

// Status backend → status dashboard. "pending" = menunggu pembayaran; status lama disamakan dengan alur baru.
const STATUS_DARI_API: Record<string, StatusPesanan> = {
  pending: "menunggu-pembayaran",
  diproses: "perlu-dikemas",
  "sedang-dikemas": "perlu-dikemas",
  dikirim: "diantar",
};

const STATUS_VALID: StatusPesanan[] = ["menunggu-pembayaran", "perlu-dikemas", "siap-jemput", "diantar", "tiba-di-pos", "komplain", "selesai", "dibatalkan"];

export function statusDariApi(status: string): StatusPesanan {
  const s = STATUS_DARI_API[status] ?? status;
  return (STATUS_VALID as string[]).includes(s) ? (s as StatusPesanan) : "perlu-dikemas";
}

export const statusKeApi = (status: StatusPesanan): string => (status === "menunggu-pembayaran" ? "pending" : status);

const SAPAAN = new Set(["pak", "bu", "ibu", "bapak", "mas", "mbak", "haji", "hj", "rt", "rw"]);

export function inisialNama(nama: string): string {
  const kata = nama.trim().split(/\s+/).filter(Boolean);
  const inti = kata.filter((k) => !SAPAAN.has(k.toLowerCase().replace(/\./g, "")));
  const dipakai = inti.length ? inti : kata;
  return (dipakai.length > 1 ? dipakai[0][0] + dipakai[1][0] : (dipakai[0] ?? "?").slice(0, 2)).toUpperCase();
}

function metodeBayarDariApi(m: string | null): MetodeBayar {
  const t = (m ?? "").toUpperCase();
  return t.includes("COD") ? "COD" : t.includes("SALDO") ? "SALDO" : t.includes("MIDTRANS") ? "MIDTRANS" : "QRIS";
}

const STATUS_BAYAR_VALID: StatusPembayaran[] = ["menunggu", "lunas", "gagal", "kedaluwarsa", "dikembalikan", "cod"];
const statusBayarDariApi = (s: string | null | undefined): StatusPembayaran | undefined =>
  (STATUS_BAYAR_VALID as string[]).includes(s ?? "") ? (s as StatusPembayaran) : undefined;
const angkaAtauUndefined = (n: number | string | null | undefined): number | undefined => (n === null || n === undefined || n === "" ? undefined : Number(n) || 0);

function bacaJson<T>(nilai: T | string | null): T | undefined {
  if (!nilai) return undefined;
  if (typeof nilai !== "string") return nilai;
  try {
    return JSON.parse(nilai) as T;
  } catch {
    return undefined;
  }
}

// Foto bukti komplain dikirim pembeli dari aplikasi; alamatnya dinormalkan agar bisa dibuka dari browser admin.
function komplainDariApi(k: Komplain | undefined): Komplain | undefined {
  return k ? { ...k, foto: (k.foto ?? []).map(urlFoto) } : undefined;
}

// Pesanan backend → pesanan yang ditampilkan dashboard. `id` dashboard = kode pesanan (mis. PSD-20261024-0089).
export function pesananDariApi(b: BarisPesananApi): Pesanan {
  return {
    id: b.kode,
    idPembayaran: b.idPembayaran ?? undefined,
    pembeli: b.pembeli,
    inisial: inisialNama(b.pembeli),
    alamat: b.alamat ?? "-",
    rtRw: b.rtRw ?? undefined,
    patokan: b.patokan ?? undefined,
    dropPoint: b.dropPoint ?? "-",
    opsiPengiriman: b.opsiPengiriman ?? "kurir-desa",
    metodeBayar: metodeBayarDariApi(b.metodeBayar),
    statusPembayaran: statusBayarDariApi(b.statusPembayaran),
    jenisPembayaran: b.jenisPembayaran ?? undefined,
    kanalPembayaran: b.kanalPembayaran ?? undefined,
    dibayarPada: b.dibayarPada ?? undefined,
    batasBayar: b.batasBayar ?? undefined,
    biayaKirim: angkaAtauUndefined(b.biayaKirim),
    diskon: angkaAtauUndefined(b.diskon),
    totalBayar: angkaAtauUndefined(b.totalBayar),
    status: statusDariApi(b.status),
    waktu: tanggalWib(b.dibuatPada).waktu,
    tibaDiPosPada: b.tibaDiPosPada ?? undefined,
    total: Number(b.total) || 0,
    items: b.items.map((i) => ({
      komoditas: i.komoditas,
      jumlah: `${Number(i.jumlah)} ${i.satuan}`,
      hargaSatuan: Number(i.hargaSatuan) || 0,
      subtotal: Number(i.subtotal) || 0,
      tag: i.tag ?? undefined,
    })),
    catatan: b.catatan ?? undefined,
    telepon: b.telepon ?? undefined,
    kurir: bacaJson<KurirPesanan>(b.kurir),
    komplain: komplainDariApi(bacaJson<Komplain>(b.komplain)),
    kirimUlang: Boolean(b.kirimUlang) || undefined,
    dibatalkanOleh: b.dibatalkanOleh ?? undefined,
    alasanBatal: b.alasanBatal ?? undefined,
    dibatalkanPada: b.dibatalkanPada ?? undefined,
    ulasan: b.ulasan
      ? {
          rating: Number(b.ulasan.rating) || 0,
          tags: bacaJson<string[]>(b.ulasan.tags as string[] | string | null) ?? [],
          catatan: b.ulasan.catatan ?? undefined,
          kurirDisukai: b.ulasan.kurirDisukai ?? undefined,
          dibuatPada: b.ulasan.dibuatPada,
        }
      : undefined,
  };
}

// Bagian pesanan yang berubah lewat alur dashboard (status, kurir, waktu tiba, komplain) → isian PATCH.
export function perubahanKeApi(p: Pesanan) {
  return {
    status: statusKeApi(p.status),
    kurir: p.kurir ?? null,
    komplain: p.komplain ?? null,
    tibaDiPosPada: p.tibaDiPosPada ?? null,
    kirimUlang: Boolean(p.kirimUlang),
  };
}
