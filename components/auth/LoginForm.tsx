"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Lock, LogIn, UserRound } from "lucide-react";
import { aksiLogin } from "@/app/(auth)/actions";
import { AuthField } from "@/components/auth/AuthField";
import { Button } from "@/components/ui/Button";
import type { AuthState } from "@/types";

const STATE_AWAL: AuthState = {};

// useFormStatus hanya bisa dibaca dari komponen DI DALAM <form>, jadi tombol dipisah.
function TombolMasuk() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" status={pending ? "loading" : "idle"} loadingLabel="Memverifikasi…" className="w-full">
      <LogIn className="h-4 w-4" />
      Masuk ke Dashboard Admin
    </Button>
  );
}

// Form login: Server Action (aksiLogin) memvalidasi & memanggil Express; komponen ini hanya menampilkan hasilnya.
export function LoginForm() {
  const [state, formAction] = useActionState(aksiLogin, STATE_AWAL);

  return (
    // noValidate → pesan error konsisten dari server, bukan balon bawaan browser.
    <form action={formAction} noValidate className="space-y-5">
      {state.message && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-danger-50 p-3 text-sm font-medium text-danger-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {state.message}
        </p>
      )}

      <AuthField
        label="Email Dinas / ID Admin"
        name="email"
        icon={UserRound}
        type="email"
        required
        autoComplete="username"
        placeholder="admin.budi@sukorejo.id"
        defaultValue={state.values?.email}
        error={state.errors?.email}
      />
      <AuthField
        label="Password"
        name="password"
        icon={Lock}
        togglePassword
        required
        autoComplete="current-password"
        placeholder="Masukkan kata sandi"
        error={state.errors?.password}
        labelAction={
          <Link href="/lupa-password" className="text-xs font-semibold text-brand-700 hover:underline">
            Lupa Password?
          </Link>
        }
      />

      <label className="flex items-center gap-2.5 text-sm text-ink-700">
        <input type="checkbox" name="ingat" defaultChecked className="h-4 w-4 rounded border-line text-brand-600 focus:ring-brand-500" />
        Ingat Sesi Login Saya di Perangkat Ini
      </label>

      <TombolMasuk />
    </form>
  );
}
