import Link from "next/link";
import { clsx } from "clsx";
import { ArrowLeft, ShieldCheck, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

// Kerangka halaman autentikasi admin (login, registrasi, reset password).
// Dua kolom: panel hijau bermerk di kiri (±38%) + area form putih di kanan (±62%), dibungkus satu kartu
// di tengah layar. Tinggi kartu TETAP (md:h) di semua halaman, jadi login, registrasi, dan reset password
// berukuran sama dan kartu tidak melompat/membesar saat pindah halaman atau saat pesan error muncul;
// bila isi form lebih tinggi dari kartu, hanya kolom kanan yang bisa di-scroll.
interface AuthShellProps {
  /** Tujuan tombol panah "kembali" di pojok kiri atas panel (opsional; tanpa ini tombol tidak tampil). */
  backHref?: string;
  /** Lencana/pil di pojok kanan atas panel kiri (opsional). */
  badge?: ReactNode;
  /** Ikon besar di tengah panel kiri. */
  icon: LucideIcon;
  /** "star" → bintang kecil (merek), "alert" → tanda seru (keamanan), "none" → polos. */
  iconAccent?: "star" | "alert" | "none";
  /** Judul di bawah ikon. Untuk login/registrasi berupa wordmark PasarDesa. */
  heading: ReactNode;
  /** Pil kecil di bawah judul (opsional). */
  pill?: ReactNode;
  /** Keterangan panel kiri. */
  description: string;
  /** Teks footer panel kiri. */
  footer: ReactNode;
  /** Pil status di pojok kanan atas area form, mis. "Sistem Online" (opsional). */
  statusPill?: ReactNode;
  /** Isi kolom kanan (form). */
  children: ReactNode;
}

export function AuthShell({ backHref, badge, icon: Icon, iconAccent = "none", heading, pill, description, footer, statusPill, children }: AuthShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-muted p-4">
      <div className="grid w-full max-w-[1040px] overflow-hidden rounded-2xl bg-surface shadow-card md:h-[760px] md:grid-cols-[5fr_8fr] md:grid-rows-1">
        {/* Panel kiri: merek + konteks */}
        <aside className="relative flex flex-col overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-8 text-white md:p-10">
          {/* Lingkaran dekoratif halus */}
          <span aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/5" />
          <span aria-hidden className="pointer-events-none absolute -bottom-28 -left-24 h-80 w-80 rounded-full bg-white/5" />

          {(backHref || badge) && (
            <div className="relative flex items-start justify-between">
              {backHref ? (
                <Link
                  href={backHref}
                  aria-label="Kembali"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-feedback ease-enter hover:bg-white/20"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              ) : (
                <span />
              )}
              {badge}
            </div>
          )}

          <div className="relative my-auto flex flex-col items-center py-6 text-center">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10">
                <Icon className="h-9 w-9 text-white" />
              </div>
              {iconAccent === "star" && (
                <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-warn-400 text-xs text-white">★</span>
              )}
              {iconAccent === "alert" && (
                <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-warn-400 text-sm font-bold text-white">
                  !
                </span>
              )}
            </div>
            <div className="mt-5">{heading}</div>
            {pill && <div className="mt-4">{pill}</div>}
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/85">{description}</p>
          </div>

          <div className="relative flex items-center justify-center gap-2 border-t border-white/15 pt-5 text-xs text-white/80">{footer}</div>
        </aside>

        {/* Panel kanan: form */}
        <section className="relative flex min-h-0 flex-col">
          {statusPill && <div className="flex justify-end px-8 pt-6 md:absolute md:right-5 md:top-4 md:p-0">{statusPill}</div>}
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-8 py-6 md:px-10 md:py-6">
            <div className="my-auto">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}

// Wordmark "PasarDesa" dipakai di panel login & registrasi.
export function Wordmark() {
  return (
    <p className="font-display text-4xl font-bold leading-none">
      <span className="text-brand-200">Pasar</span>
      <span className="text-white">Desa</span>
    </p>
  );
}

// Pil bermerk (garis tipis) di bawah wordmark.
export function BrandPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/5 px-4 py-2 text-sm font-semibold text-white">{children}</span>
  );
}

// Lencana perisai di pojok kanan atas panel (dipakai bila halaman memasang `badge`).
export function ShieldBadge() {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-warn-400">
      <ShieldCheck className="h-5 w-5" />
    </span>
  );
}

// Kepala kolom kanan: judul + subjudul, dengan pil status opsional di kanan.
export function AuthHeader({ title, subtitle, pill }: { title: string; subtitle: string; pill?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink-900">{title}</h1>
        <p className="mt-1 text-sm text-ink-500">{subtitle}</p>
      </div>
      {pill}
    </div>
  );
}

const PILL_TONE = {
  success: "border-brand-200 bg-brand-50 text-brand-700",
  warning: "border-warn-400/60 bg-warn-50 text-warn-600",
} as const;

// Pil status kecil (mis. "Sistem Online", "Pemulihan Akses").
export function StatusPill({ tone, children }: { tone: keyof typeof PILL_TONE; children: ReactNode }) {
  return (
    <span className={clsx("inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium", PILL_TONE[tone])}>{children}</span>
  );
}

// Baris tautan di kaki form (mis. "Belum memiliki akun? Daftar Akun Admin").
export function AuthFooterLink({ prompt, href, label }: { prompt: string; href: string; label: string }) {
  return (
    <p className="mt-5 border-t border-line pt-4 text-center text-sm text-ink-500">
      {prompt}{" "}
      <Link href={href} className="font-semibold text-brand-700 hover:underline">
        {label}
      </Link>
    </p>
  );
}