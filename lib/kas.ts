import type { JalurPencairan, Pesanan, Rekening, TransaksiKas } from "@/types";
import { hitungTotal } from "./pesanan";

// Escrow = dana QRIS dari pesanan yang masih berjalan (belum selesai). Dana
// ini baru masuk saldo aktif ketika pesanannya selesai.
export function pesananEscrow(pesanan: Pesanan[]): Pesanan[] {
  return pesanan.filter((p) => p.metodeBayar === "QRIS" && p.status !== "selesai");
}

export const hitungEscrow = (pesanan: Pesanan[]) => hitungTotal(pesananEscrow(pesanan));

// Status mutasi yang belum final (dana belum benar-benar berpindah) tampil kuning.
const STATUS_BELUM_FINAL: TransaksiKas["status"][] = ["Diproses", "Menunggu Pengambilan"];

export function mutasiBelumFinal(status: TransaksiKas["status"]): boolean {
  return STATUS_BELUM_FINAL.includes(status);
}

// ---------------------------------------------------------------------------
// Pembentuk mutasi kas (fungsi murni). Id & waktu dilengkapi oleh state kas.
// ---------------------------------------------------------------------------
export type DraftTransaksi = Omit<TransaksiKas, "id" | "tanggal" | "waktu">;

export function transaksiPenjualan(p: Pesanan): DraftTransaksi {
  return {
    deskripsi: "Hasil Penjualan Komoditas",
    referensi: `Invoice: #${p.id} (${p.items.map((i) => i.komoditas).join(" + ")})`,
    kategori: "Penjualan Lapak",
    nominal: p.total,
    status: "Berhasil Masuk",
  };
}

export function transaksiPencairan(nominal: number, jalur: JalurPencairan, rekening: Rekening, nomorReferensi: number): DraftTransaksi {
  if (jalur === "bank") {
    return {
      deskripsi: `Pencairan Dana Kas ke ${rekening.bank.replace("Bank ", "")} ${rekening.atasNama.split(" ")[0]}`,
      referensi: `No. Referensi Bank: KAS-SKR-${nomorReferensi} • ${rekening.unit}`,
      kategori: "Pencairan Kas",
      nominal: -nominal,
      status: "Diproses",
    };
  }
  return {
    deskripsi: "Penarikan Tunai di Balai Desa",
    referensi: `Kasir Loket BUMDes Balai Desa • Bukti: TNI-SKR-${nomorReferensi}`,
    kategori: "Pencairan Kas",
    nominal: -nominal,
    status: "Menunggu Pengambilan",
  };
}

export const formatIdTransaksi = (urutan: number) => `TRX-${String(urutan).padStart(4, "0")}`;
