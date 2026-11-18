"use server";

import { ApiError, apiFetch } from "@/lib/server/api";
import { getToken } from "@/lib/server/session";
import type { BarisPesananApi } from "@/lib/pesananApi";
import type { HasilAksi } from "./kas";

async function panggil<T>(jalankan: (token: string) => Promise<T>): Promise<HasilAksi<{ data: T }>> {
  const token = await getToken();
  if (!token) return { ok: false, status: 401, message: "Sesi berakhir. Silakan login ulang." };
  try {
    return { ok: true, data: await jalankan(token) };
  } catch (error) {
    if (error instanceof ApiError) return { ok: false, status: error.status, message: error.message };
    return { ok: false, status: 500, message: "Terjadi kesalahan tak terduga." };
  }
}

export async function ambilPesanan() {
  return panggil((token) => apiFetch<BarisPesananApi[]>("/admin/orders", { token }));
}

export interface PerubahanPesanan {
  status: string;
  kurir: unknown;
  komplain: unknown;
  tibaDiPosPada: string | null;
  kirimUlang: boolean;
}

// Server memeriksa alur status dan, saat "selesai", mencatat penjualan bersih ke kas.
// Mengembalikan pesanan terbaru dari server.
export async function simpanPesanan(kode: string, perubahan: PerubahanPesanan) {
  return panggil((token) => apiFetch<BarisPesananApi>(`/admin/orders/${encodeURIComponent(kode)}`, { token, method: "PATCH", body: JSON.stringify(perubahan) }));
}
