"use server";

import { ApiError, apiFetch } from "@/lib/server/api";
import { getToken } from "@/lib/server/session";
import type { BarisKasApi, RingkasanKasApi } from "@/lib/kasApi";
import type { JalurPencairan } from "@/types";

// Server action: token JWT ada di cookie httpOnly sehingga hanya server Next.js yang bisa memanggil Express API.
// Hasilnya berupa objek biasa ({ ok }) — pesan galat dari backend diteruskan apa adanya ke UI.
export type HasilAksi<T> = ({ ok: true } & T) | { ok: false; status: number; message: string };

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

export async function ambilDataKas() {
  return panggil(async (token) => {
    const [ringkasan, mutasi] = await Promise.all([
      apiFetch<RingkasanKasApi>("/cash/summary", { token }),
      apiFetch<BarisKasApi[]>("/cash", { token }),
    ]);
    return { ringkasan, mutasi };
  });
}

export async function ajukanPenarikan(nominal: number, jalur: JalurPencairan) {
  return panggil((token) =>
    apiFetch<{ id: number; referenceCode: string; saldoSetelah: number }>("/cash/withdrawals", {
      token,
      method: "POST",
      body: JSON.stringify({ nominal, jalur }),
    }),
  );
}
