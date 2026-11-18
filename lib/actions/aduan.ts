"use server";

import { ApiError, apiFetch } from "@/lib/server/api";
import { getToken } from "@/lib/server/session";
import type { BarisAduanApi } from "@/lib/aduanApi";
import type { StatusAduan } from "@/types";
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

export async function ambilAduan() {
  return panggil((token) => apiFetch<BarisAduanApi[]>("/admin/complaints", { token }));
}

// Status hanya bisa maju (diverifikasi → diproses → selesai); server menolak yang mundur. Balasan terkirim ke pembeli.
export async function ubahAduanServer(idServer: number, perubahan: { status?: StatusAduan; balasan?: string }) {
  return panggil((token) => apiFetch<BarisAduanApi>(`/admin/complaints/${idServer}`, { token, method: "PATCH", body: JSON.stringify(perubahan) }));
}
