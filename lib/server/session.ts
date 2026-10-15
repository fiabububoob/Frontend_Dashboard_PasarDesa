import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import type { Pengguna } from "@/types";
import { ApiError, apiFetch } from "./api";

// Token JWT disimpan di cookie httpOnly: tidak bisa dibaca JavaScript di browser (aman dari XSS).
// Nama cookie ini juga dibaca middleware.ts — ubah di dua tempat bila diganti.
export const NAMA_COOKIE_SESI = "pasardesa_token";
const UMUR_SESI_DETIK = 60 * 60 * 24 * 7; // sama dengan JWT_EXPIRES_IN=7d di backend

export async function getToken() {
  return (await cookies()).get(NAMA_COOKIE_SESI)?.value;
}

// ingat=false → cookie sesi (hilang saat browser ditutup).
export async function simpanSesi(token: string, ingat = true) {
  (await cookies()).set(NAMA_COOKIE_SESI, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(ingat ? { maxAge: UMUR_SESI_DETIK } : {}),
  });
}

export async function hapusSesi() {
  (await cookies()).delete(NAMA_COOKIE_SESI);
}

// Admin yang sedang login, atau null bila belum login / token kedaluwarsa.
// cache() → dipanggil berkali-kali dalam satu request tetap hanya satu fetch ke /auth/me.
export const getUser = cache(async (): Promise<Pengguna | null> => {
  const token = await getToken();
  if (!token) return null;
  try {
    return await apiFetch<Pengguna>("/auth/me", { token });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
});
