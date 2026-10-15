"use server";

import { redirect } from "next/navigation";
import type { AuthState } from "@/types";
import { ApiError, apiFetch } from "@/lib/server/api";
import { hapusSesi, simpanSesi } from "@/lib/server/session";
import { DAFTAR_PERAN } from "@/lib/peran";

const POLA_EMAIL = /^\S+@\S+\.\S+$/;

export async function aksiLogin(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const ingat = formData.get("ingat") === "on";

  // Validasi di server (validasi di browser hanya kemudahan, bukan jaminan).
  const errors: Record<string, string> = {};
  if (!POLA_EMAIL.test(email)) errors.email = "Format email tidak valid.";
  if (!password) errors.password = "Kata sandi wajib diisi.";
  if (Object.keys(errors).length > 0) return { errors, values: { email } };

  try {
    const { token } = await apiFetch<{ token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    await simpanSesi(token, ingat);
  } catch (error) {
    return { message: error instanceof ApiError ? error.message : "Terjadi kesalahan. Coba lagi.", values: { email } };
  }

  redirect("/"); // HARUS di luar try/catch: redirect bekerja dengan melempar error khusus
}

export async function aksiRegister(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const ambil = (nama: string) => String(formData.get(nama) ?? "");
  const nama = ambil("nama").trim();
  const nip = ambil("nip").trim();
  const peran = ambil("peran");
  const email = ambil("email").trim();
  const teleponMentah = ambil("telepon").trim();
  const kodeOtorisasi = ambil("kodeOtorisasi").trim();
  const password = ambil("password");
  const konfirmasiPassword = ambil("konfirmasiPassword");
  const pakta = formData.get("pakta") === "on";

  // Isian yang dikembalikan saat gagal: semua KECUALI password & konfirmasi password.
  const values: Record<string, string> = { nama, nip, peran, email, telepon: teleponMentah, kodeOtorisasi, pakta: pakta ? "on" : "" };

  // Telepon: ambil digitnya saja, buang angka 0 di depan (awalan +62 ditambahkan saat dikirim).
  const telepon = teleponMentah.replace(/\D/g, "").replace(/^0+/, "");

  const errors: Record<string, string> = {};
  if (!nama) errors.nama = "Nama lengkap wajib diisi.";
  else if (nama.length < 3) errors.nama = "Nama minimal 3 karakter.";
  if (!nip) errors.nip = "NIP / ID pengelola wajib diisi.";
  if (!DAFTAR_PERAN.includes(peran)) errors.peran = "Pilih peran / jabatan yang tersedia.";
  if (!email) errors.email = "Email wajib diisi.";
  else if (!POLA_EMAIL.test(email)) errors.email = "Format email tidak valid.";
  if (!telepon) errors.telepon = "Nomor telepon wajib diisi.";
  else if (telepon.length < 9 || telepon.length > 13) errors.telepon = "Nomor telepon harus 9–13 digit (tanpa angka 0 di depan).";
  if (!kodeOtorisasi) errors.kodeOtorisasi = "Kode otorisasi wajib diisi.";
  if (password.length < 8) errors.password = "Kata sandi minimal 8 karakter.";
  if (konfirmasiPassword !== password) errors.konfirmasiPassword = "Konfirmasi kata sandi tidak sama.";
  if (!pakta) errors.pakta = "Anda harus menyetujui Pakta Integritas Administrator.";
  if (Object.keys(errors).length > 0) return { errors, values };

  try {
    const { token } = await apiFetch<{ token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ nama, nip, jabatan: peran, email, telepon: `+62${telepon}`, kodeOtorisasi, password }),
    });
    await simpanSesi(token);
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) return { errors: { email: error.message }, values };
    if (error instanceof ApiError && error.status === 403) return { errors: { kodeOtorisasi: error.message }, values };
    return { message: error instanceof ApiError ? error.message : "Terjadi kesalahan. Coba lagi.", values };
  }

  redirect("/"); // HARUS di luar try/catch (lihat catatan di aksiLogin)
}

export async function aksiLogout() {
  await hapusSesi();
  redirect("/login");
}