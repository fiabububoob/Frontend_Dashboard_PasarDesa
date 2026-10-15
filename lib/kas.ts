import type { JalurPencairan, Pesanan, Rekening, TransaksiKas } from "@/types";
import { formatRupiah } from "./format";
import { nilaiBersih, nilaiRefund } from "./komplain";
import { STATUS_ESCROW } from "./pesanan";

// Escrow = dana digital (QRIS/Saldo) dari pesanan yang masih berjalan (belum selesai, belum batal).
// Dana ini baru masuk saldo aktif ketika pesanannya selesai. COD dibayar di tempat, jadi tidak di-escrow.
export function pesananEscrow(pesanan: Pesanan[]): Pesanan[] {
  return pesanan.filter((p) => p.metodeBayar !== "COD" && STATUS_ESCROW.includes(p.status));
}

// Nilai escrow = hak penjual atas pesanan yang berjalan (total dikurangi item yang sudah di-refund).
export const hitungEscrow = (pesanan: Pesanan[]) => pesananEscrow(pesanan).reduce((sum, p) => sum + nilaiBersih(p), 0);

// Status mutasi yang belum final (dana belum benar-benar berpindah) tampil kuning.
const STATUS_BELUM_FINAL: TransaksiKas["status"][] = ["Diproses", "Menunggu Pengambilan"];

export function mutasiBelumFinal(status: TransaksiKas["status"]): boolean {
  return STATUS_BELUM_FINAL.includes(status);
}

// ---------------------------------------------------------------------------
// Pembentuk mutasi kas (fungsi murni). Id & waktu dilengkapi oleh state kas.
// ---------------------------------------------------------------------------
export type DraftTransaksi = Omit<TransaksiKas, "id" | "tanggal" | "waktu">;

// Nominal = nilai bersih (setelah refund komplain). Bila ada refund, keterangannya disebutkan.
export function transaksiPenjualan(p: Pesanan): DraftTransaksi {
  const refund = nilaiRefund(p);
  return {
    deskripsi: "Hasil Penjualan Komoditas",
    referensi: `Invoice: #${p.id} (${p.items.map((i) => i.komoditas).join(" + ")})${refund > 0 ? ` • setelah refund ${formatRupiah(refund)} ke pembeli` : ""}`,
    kategori: "Penjualan Lapak",
    nominal: nilaiBersih(p),
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
