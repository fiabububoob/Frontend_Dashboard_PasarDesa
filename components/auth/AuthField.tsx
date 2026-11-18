"use client";

import { clsx } from "clsx";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Ikon di depan kolom isian. */
  icon?: LucideIcon;
  /** Teks statis di depan isian, mis. "+62". */
  prefixText?: string;
  /** Elemen di kanan label (mis. tautan "Lupa Password?"). */
  labelAction?: ReactNode;
  /** True → ada tombol LIHAT/sembunyikan untuk password. */
  togglePassword?: boolean;
  /** Varian tampilan: kotak kuning untuk kode otorisasi. */
  highlight?: boolean;
  containerClassName?: string;
  hint?: string;
  /** Pesan error (mis. dari Server Action). Menandai kolom tidak valid dan tampil di bawah input. */
  error?: string;
}

// Kolom isian untuk form autentikasi: label + ikon + input, gaya mengikuti
// <Input> (border tipis, cincin fokus hijau). Mendukung ikon depan, awalan teks,
// dan tombol lihat/sembunyikan password.
export function AuthField({
  label,
  icon: Icon,
  prefixText,
  labelAction,
  togglePassword,
  highlight,
  containerClassName,
  hint,
  error,
  type = "text",
  required,
  id,
  ...props
}: AuthFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const [lihat, setLihat] = useState(false);
  const pesanId = `${fieldId}-pesan`;
  const tipe = togglePassword ? (lihat ? "text" : "password") : type;

  return (
    <div className={containerClassName}>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={fieldId} className="text-sm font-medium text-ink-700">
           {label}
        </label>
        {labelAction}
      </div>
      <div
        className={clsx(
          "flex items-center overflow-hidden rounded-lg border transition-[border-color,box-shadow] duration-feedback ease-enter",
          error
            ? "border-danger-600 bg-white focus-within:ring-1 focus-within:ring-danger-600"
            : highlight
              ? "border-warn-400 bg-warn-50 focus-within:border-warn-400 focus-within:ring-1 focus-within:ring-warn-400"
              : "border-line bg-white focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500",
        )}
      >
        {Icon && <Icon className="ml-3 h-4 w-4 shrink-0 text-ink-400" aria-hidden />}
        {prefixText && (
          <span className="flex items-center self-stretch border-r border-line bg-surface-muted px-3 text-sm font-medium text-ink-700">{prefixText}</span>
        )}
        <input
          id={fieldId}
          type={tipe}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? pesanId : undefined}
          className="w-full bg-transparent px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
          {...props}
        />
        {togglePassword && (
          <button
            type="button"
            onClick={() => setLihat((v) => !v)}
            aria-label={lihat ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
            className="flex items-center gap-1 self-stretch px-3 text-xs font-semibold uppercase text-ink-500 transition-colors duration-feedback ease-enter hover:text-ink-700"
          >
            {lihat ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span className="hidden sm:inline">{lihat ? "Tutup" : "Lihat"}</span>
          </button>
        )}
      </div>
      {error ? (
        <p id={pesanId} role="alert" className="mt-1 text-xs font-medium text-danger-600">
          {error}
        </p>
      ) : (
        hint && (
          <p id={pesanId} className="mt-1 text-xs text-ink-400">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
