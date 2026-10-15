import type { Metadata } from "next";
import { KeyRound, Lock, Shield } from "lucide-react";
import { AuthShell, AuthHeader, AuthFooterLink, BrandPill, ShieldBadge, Wordmark } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Registrasi Admin — PasarDesa" };

// Server Component: hanya menyusun kerangka halaman. Bagian interaktif ada di <RegisterForm> (client).
export default function RegisterPage() {
  return (
    <AuthShell
      backHref="/login"
      badge={<ShieldBadge />}
      icon={Shield}
      iconAccent="alert"
      heading={<Wordmark />}
      pill={
        <BrandPill>
          <KeyRound className="h-3 w-3" aria-hidden /> Panel Administrator BUMDes
        </BrandPill>
      }
      description="Portal Khusus Pendaftaran Akun Pengelola BUMDes Sukorejo, Verifikator Komoditas, dan Petugas Keuangan."
      footer={
        <>
          <Lock className="h-3.5 w-3.5" /> Akses Terenkripsi &amp; Terverifikasi Desa
        </>
      }
    >
      <AuthHeader title="Registrasi Admin" subtitle="Khusus Pengelola BUMDes & Mitra Resmi" />

      <div className="my-4 border-t border-line" />

      <RegisterForm />

      <AuthFooterLink prompt="Sudah punya akun Admin?" href="/login" label="Masuk / Login Admin" />
    </AuthShell>
  );
}