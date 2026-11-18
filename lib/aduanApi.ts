import { daftarFoto } from "./fotoUrl";
import type { Aduan, StatusAduan } from "@/types";

// Bentuk tiket aduan dari Express API (GET/PATCH /api/admin/complaints).
export interface BarisAduanApi {
  id: number;
  kode: string;
  topik: string;
  kodePesanan: string | null;
  judul: string;
  deskripsi: string | null;
  foto: string[] | string | null;
  solusiDiminta: string | null;
  status: StatusAduan;
  balasan: string | null;
  dibalasPada: string | null;
  dibuatPada: string;
  pembeli: string;
  email: string | null;
  telepon: string | null;
}

export function aduanDariApi(b: BarisAduanApi): Aduan {
  return {
    idServer: b.id,
    id: b.kode,
    topik: b.topik,
    kodePesanan: b.kodePesanan ?? undefined,
    judul: b.judul,
    deskripsi: b.deskripsi ?? undefined,
    foto: daftarFoto(b.foto),
    solusiDiminta: b.solusiDiminta ?? undefined,
    status: b.status,
    balasan: b.balasan ?? undefined,
    dibalasPada: b.dibalasPada ?? undefined,
    dibuatPada: b.dibuatPada,
    pembeli: b.pembeli,
    email: b.email ?? undefined,
    telepon: b.telepon ?? undefined,
  };
}

export const LABEL_STATUS_ADUAN: Record<StatusAduan, string> = { diverifikasi: "Sedang Diverifikasi", diproses: "Diproses", selesai: "Selesai" };

/** Target tindak lanjut yang dijanjikan di aplikasi mobile: 1×24 jam. */
export const BATAS_TINDAK_LANJUT_MS = 24 * 60 * 60 * 1000;

/** Aduan belum selesai dan sudah lewat 1×24 jam sejak diajukan. */
export const lewatBatas = (a: Pick<Aduan, "status" | "dibuatPada">, sekarang: Date): boolean =>
  a.status !== "selesai" && sekarang.getTime() - new Date(a.dibuatPada).getTime() > BATAS_TINDAK_LANJUT_MS;
