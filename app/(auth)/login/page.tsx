import type { Metadata } from "next";
import { KeyRound, LayoutGrid, Lock } from "lucide-react";
import { AuthShell, AuthHeader, AuthFooterLink, BrandPill, ShieldBadge, StatusPill, Wordmark } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Login Admin — PasarDesa" };

// Server Component: hanya menyusun kerangka halaman. Bagian interaktif ada di <LoginForm> (client).
export default function LoginPage() {
  return (
    <AuthShell
      backHref="/"
      badge={<ShieldBadge />}
      icon={LayoutGrid}
      iconAccent="star"
      heading={<Wordmark />}
      pill={
        <BrandPill>
          <KeyRound className="h-3 w-3" aria-hidden /> Panel Administrator BUMDes
        </BrandPill>
      }
      description="Selamat datang kembali. Silakan masuk untuk mengelola transaksi, verifikasi UMKM, dan kas BUMDes Sukorejo."
      footer={
        <>
          <Lock className="h-3.5 w-3.5" /> Sistem Autentikasi Pengelola Terproteksi
        </>
      }
    >
      <AuthHeader
        title="Login Admin"
        subtitle="Masuk ke Dashboard Sistem PasarDesa"
        pill={
          <StatusPill tone="success">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> System Online
          </StatusPill>
        }
      />

      <div className="my-5 border-t border-line" />

      <LoginForm />

      <AuthFooterLink prompt="Belum memiliki akun Pengelola?" href="/register" label="Daftar Akun Admin" />
    </AuthShell>
  );
}
