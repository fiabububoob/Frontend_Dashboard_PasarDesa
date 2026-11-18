"use server";

import { redirect } from "next/navigation";
import type { AuthState } from "@/types";
import { ApiError, apiFetch } from "@/lib/server/api";
import { hapusSesi, simpanSesi } from "@/lib/server/session";

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

export async function aksiLogout() {
  await hapusSesi();
  redirect("/login");
}