"use server";

import { ApiError, apiFetch } from "@/lib/server/api";
import { getToken } from "@/lib/server/session";
import { adalahDataUrl, isianKeApi, type BarisKomoditasApi } from "@/lib/komoditasApi";
import type { Komoditas } from "@/types";
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

// Backend mengenal kategori lewat id; dashboard memakai nama sub-kategori. Bila namanya belum ada, dibuat.
async function idKategori(nama: string, token: string): Promise<number | null> {
  const daftar = await apiFetch<{ id: number; name: string }[]>("/categories", { token });
  const ada = daftar.find((k) => k.name.trim().toLowerCase() === nama.trim().toLowerCase());
  if (ada) return ada.id;
  const baru = await apiFetch<{ id: number }>("/categories", { token, method: "POST", body: JSON.stringify({ name: nama }) });
  return baru.id;
}

function blobDariDataUrl(dataUrl: string): Blob {
  const [kepala, isi] = dataUrl.split(",");
  const tipe = /data:([^;]+)/.exec(kepala)?.[1] ?? "image/jpeg";
  return new Blob([Buffer.from(isi, "base64")], { type: tipe });
}

export async function ambilKomoditas() {
  return panggil((token) => apiFetch<BarisKomoditasApi[]>("/products?includeHidden=true", { token }));
}

// Simpan (buat/ubah) satu komoditas lalu kembalikan baris terbaru dari server.
// Backend hanya menyimpan satu foto (kolom `image`): foto sampul diunggah sebagai file bila baru dipilih.
export async function simpanKomoditas(data: Omit<Komoditas, "id" | "statusStok"> & { id?: string }, idServer?: string) {
  return panggil(async (token) => {
    const isian = isianKeApi(data);
    const sampul = data.foto?.[0];
    const kategoriId = await idKategori(data.kategori, token);

    const badan: BodyInit = (() => {
      if (adalahDataUrl(sampul)) {
        const form = new FormData();
        Object.entries({ ...isian, category_id: String(kategoriId ?? "") }).forEach(([k, v]) => form.append(k, v));
        form.append("image", blobDariDataUrl(sampul), "foto-produk.jpg");
        return form;
      }
      return JSON.stringify({ ...isian, category_id: kategoriId, image: sampul ?? "" });
    })();

    const id = idServer
      ? (await apiFetch<unknown>(`/products/${idServer}`, { token, method: "PATCH", body: badan }), idServer)
      : String((await apiFetch<{ id: number }>("/products", { token, method: "POST", body: badan })).id);

    return apiFetch<BarisKomoditasApi>(`/products/${id}`, { token });
  });
}

export async function ubahTampilKomoditas(id: string, tampil: boolean) {
  return panggil((token) => apiFetch<unknown>(`/products/${id}`, { token, method: "PATCH", body: JSON.stringify({ is_visible: tampil }) }));
}
