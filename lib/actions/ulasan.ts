"use server";

import { ApiError, apiFetch } from "@/lib/server/api";
import { getToken } from "@/lib/server/session";
import type { DataUlasanApi } from "@/lib/ulasanApi";
import type { HasilAksi } from "./kas";

export async function ambilUlasan(): Promise<HasilAksi<{ data: DataUlasanApi }>> {
  const token = await getToken();
  if (!token) return { ok: false, status: 401, message: "Sesi berakhir. Silakan login ulang." };
  try {
    return { ok: true, data: await apiFetch<DataUlasanApi>("/admin/reviews", { token }) };
  } catch (error) {
    if (error instanceof ApiError) return { ok: false, status: error.status, message: error.message };
    return { ok: false, status: 500, message: "Terjadi kesalahan tak terduga." };
  }
}
