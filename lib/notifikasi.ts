import type { DetailTarget, Komoditas, Pesanan } from "@/types";
import { JAM_JEMPUT_SORE } from "./constants";
import { KURIR_AKTIF, WARTA_LIST } from "./data/ringkasan";
import { hitungStatus } from "./pesanan";

export type JenisNotifikasi = "dikemas" | "stok-kritis" | "kurir" | "pengumuman";

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
export function buatNotifikasi(data: { pesanan: Pesanan[]; komoditas: Komoditas[] }): Notifikasi[] {
  const hasil: Notifikasi[] = [];

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
