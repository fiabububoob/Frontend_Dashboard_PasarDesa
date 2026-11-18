import type { Aduan, DetailTarget, Komoditas, Pesanan } from "@/types";
import { JAM_JEMPUT_SORE } from "./constants";
import { KURIR_AKTIF, WARTA_LIST } from "./data/ringkasan";
import { hitungStatus } from "./pesanan";

export type JenisNotifikasi = "komplain" | "aduan" | "batal" | "dikemas" | "stok-kritis" | "kurir" | "pengumuman";

export interface Notifikasi {
  key: string;
  jenis: JenisNotifikasi;
  judul: string;
  keterangan: string;
  /** Modal yang dibuka saat notifikasi diklik. */
  target: DetailTarget;
}

// Notifikasi dihitung dari data hidup (bukan daftar tetap), jadi ikut berubah
// saat stok atau status pesanan berubah. Fungsi murni → mudah diuji.
const BATAS_NOTIF_BATAL_MS = 24 * 60 * 60 * 1000;

// `sekarang` (opsional) dipakai untuk notifikasi yang punya masa tampil, mis. pembatalan 24 jam terakhir.
export function buatNotifikasi(data: { pesanan: Pesanan[]; komoditas: Komoditas[]; sekarang?: Date; aduan?: Aduan[] }): Notifikasi[] {
  const hasil: Notifikasi[] = [];

  const komplain = data.pesanan.filter((p) => p.komplain?.status === "diajukan");
  if (komplain.length > 0) {
    hasil.push({
      key: "komplain",
      jenis: "komplain",
      judul: `${komplain.length} komplain perlu ditangani`,
      keterangan: "Dana pesanan ditahan sampai komplain selesai",
      target: { type: "pesanan", id: komplain[0].id },
    });
  }

  // Pembeli membatalkan pesanan lewat aplikasi: admin perlu tahu (stok sudah otomatis kembali).
  const batalPembeli = data.sekarang
    ? data.pesanan.filter(
        (p) => p.dibatalkanOleh === "pembeli" && p.dibatalkanPada && data.sekarang!.getTime() - new Date(p.dibatalkanPada).getTime() < BATAS_NOTIF_BATAL_MS,
      )
    : [];
  if (batalPembeli.length > 0) {
    hasil.push({
      key: "batal-pembeli",
      jenis: "batal",
      judul: `${batalPembeli.length} pesanan dibatalkan pembeli`,
      keterangan: batalPembeli[0].alasanBatal ? `Alasan: ${batalPembeli[0].alasanBatal}` : "Stok sudah dikembalikan otomatis",
      target: { type: "pesanan", id: batalPembeli[0].id },
    });
  }

  // Tiket aduan umum yang masih "Sedang Diverifikasi" (dari Pusat Bantuan aplikasi mobile).
  const aduanBaru = (data.aduan ?? []).filter((a) => a.status === "diverifikasi");
  if (aduanBaru.length > 0) {
    hasil.push({
      key: "aduan-baru",
      jenis: "aduan",
      judul: `${aduanBaru.length} tiket aduan baru`,
      keterangan: `${aduanBaru[0].topik} · target tindak lanjut 1×24 jam`,
      target: { type: "aduan", id: aduanBaru[0].id },
    });
  }

  const perluDikemas = data.pesanan.filter((p) => p.status === "perlu-dikemas");
  if (perluDikemas.length > 0) {
    hasil.push({
      key: "dikemas",
      jenis: "dikemas",
      judul: `${hitungStatus(data.pesanan, "perlu-dikemas")} pesanan perlu dikemas`,
      keterangan: `Siapkan sebelum kurir datang pukul ${JAM_JEMPUT_SORE}`,
      target: { type: "pesanan", id: perluDikemas[0].id },
    });
  }

  for (const k of data.komoditas.filter((x) => x.statusStok === "kritis")) {
    hasil.push({
      key: `stok-${k.id}`,
      jenis: "stok-kritis",
      judul: `Stok kritis: ${k.nama}`,
      keterangan: `Tersisa ${k.stok} ${k.satuan}`,
      target: { type: "komoditas", id: k.id },
    });
  }

  hasil.push({
    key: "kurir",
    jenis: "kurir",
    judul: `Kurir tiba pukul ${KURIR_AKTIF.jamTiba}`,
    keterangan: `${KURIR_AKTIF.nama} menuju lumbung`,
    target: { type: "kurir" },
  });

  const [warta] = WARTA_LIST;
  hasil.push({ key: "pengumuman", jenis: "pengumuman", judul: warta.judul, keterangan: "Pengumuman BUMDes", target: { type: "warta", id: warta.id } });

  return hasil;
}
