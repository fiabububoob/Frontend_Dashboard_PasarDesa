import type { StatusMutasi, TransaksiKas } from "@/types";

// Bentuk data kas dari Express API (GET /api/cash dan GET /api/cash/summary).
export interface BarisKasApi {
  id: number | string;
  type: "credit" | "debit";
  category: string;
  description: string;
  amount: number | string;
  referenceCode: string | null;
  createdAt: string;
}

export interface RingkasanKasApi {
  saldoAktif: number;
  saldoTertahan: number;
  pesananBerjalan: number;
  omsetBulanIni: number;
}

const ZONA = "Asia/Jakarta";

export function tanggalWib(iso: string): { tanggal: string; waktu: string } {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { tanggal: "-", waktu: "" };
  const tanggal = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: ZONA }).format(d);
  const waktu = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: ZONA }).format(d).replace(".", ":");
  return { tanggal, waktu: `${waktu} WIB` };
}

// Mengubah satu baris buku kas backend menjadi mutasi yang ditampilkan tabel Kas & Saldo.
// Backend hanya mengenal credit/debit + kategori bebas; label tampilan ditentukan di sini.
export function mutasiDariApi(baris: BarisKasApi): TransaksiKas {
  const jumlah = Number(baris.amount) || 0;
  const masuk = baris.type === "credit";
  const kategoriPenjualan = baris.category === "penjualan";
  const tunai = /tunai/i.test(baris.description);

  let kategori: TransaksiKas["kategori"];
  let status: StatusMutasi;
  if (kategoriPenjualan) {
    kategori = "Penjualan Lapak";
    status = masuk ? "Berhasil Masuk" : "Dikoreksi"; // debit kategori penjualan = pembatalan pesanan selesai
  } else if (masuk) {
    kategori = "Subsidi Desa";
    status = "Berhasil Disubsidi";
  } else {
    kategori = "Pencairan Kas";
    status = tunai ? "Berhasil Dicairkan" : "Berhasil Ditransfer";
  }

  return {
    id: `TRX-${baris.id}`,
    ...tanggalWib(baris.createdAt),
    deskripsi: baris.description,
    referensi: baris.referenceCode ?? "-",
    kategori,
    nominal: masuk ? jumlah : -jumlah,
    status,
  };
}
