"use client";

import { CheckCircle2, KeyRound, Mail, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { AuthShell, AuthHeader, AuthFooterLink, StatusPill } from "@/components/auth/AuthShell";
import { AuthField } from "@/components/auth/AuthField";
import { Button } from "@/components/ui/Button";
import { LATENSI } from "@/lib/constants";
import { simulateRequest } from "@/lib/fake-api";
import { useActionStatus } from "@/lib/hooks/useActionStatus";

export default function LupaPasswordPage() {
  const { status, run } = useActionStatus();
  const [terkirim, setTerkirim] = useState(false);

  async function kirim(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const berhasil = await run(() => simulateRequest(LATENSI.normal));
    if (berhasil) setTerkirim(true);
  }

  return (
    <AuthShell
      backHref="/login"
      badge={<StatusPill tone="warning">Pemulihan Akses</StatusPill>}
      icon={KeyRound}
      heading={<p className="font-display text-2xl font-bold text-white">Lupa Kata Sandi?</p>}
      description="Jangan khawatir. Masukkan email dinas pengelola BUMDes Anda untuk menerima instruksi reset password."
      footer={<>🛡️ Prosedur Keamanan Akun BUMDes</>}
    >
      <AuthHeader title="Reset Password Admin" subtitle="Kirim verifikasi pemulihan kata sandi" pill={<StatusPill tone="warning">🔒 Auth Recovery</StatusPill>} />

      <div className="my-6 border-t border-line" />

      <form onSubmit={kirim} className="space-y-4">
        <AuthField
          label="Email Dinas Terdaftar"
          icon={Mail}
          type="email"
          required
          placeholder="contoh: admin.budi@sukorejo.id"
          hint="Link pemulihan akan dikirimkan ke email yang terdaftar di sistem."
        />

        {terkirim && (
          <p className="flex items-center gap-2 rounded-lg bg-brand-50 p-3 text-sm font-medium text-brand-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Instruksi reset sudah dikirim. Silakan periksa email dinas Anda.
          </p>
        )}

        <Button type="submit" status={status} loadingLabel="Mengirim…" successLabel="Terkirim" className="w-full">
          <Send className="h-4 w-4" />
          Selesai
        </Button>
      </form>

      <AuthFooterLink prompt="Ingat kata sandi Anda?" href="/login" label="Kembali ke Login Admin" />
    </AuthShell>
  );
}
