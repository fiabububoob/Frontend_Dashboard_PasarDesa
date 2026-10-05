import { clsx } from "clsx";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { BUTTON_BASE, BUTTON_SIZES, BUTTON_VARIANTS, type ButtonSize, type ButtonVariant } from "./buttonStyles";

// State tombol (materi P7 — "State: bagian yang sering dilupakan"):
//   default  → status="idle"
//   hover    → CSS :hover      pressed → CSS :active (menekan sedikit / scale)
//   loading  → status="loading"   success → status="success"   error → status="error"
//   disabled → prop `disabled`
export type ActionStatus = "idle" | "loading" | "success" | "error";
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  status?: ActionStatus;
  loadingLabel?: string;
  successLabel?: string;
  errorLabel?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
  variant = "primary",
  size = "md",
  status = "idle",
  loadingLabel = "Memproses…",
  successLabel = "Berhasil",
  errorLabel = "Gagal, coba lagi",
  className,
  children,
  disabled,
  type = "button", // default "button" agar tidak tak sengaja men-submit <form>
  ...props
  },
  ref,
) {
  const busy = status === "loading";
  const inert = disabled || busy;

  return (
    <button
      ref={ref}
      type={type}
      disabled={inert}
      aria-busy={busy || undefined}
      className={clsx(
        BUTTON_BASE,
        BUTTON_SIZES[size],
        "transition-[background-color,border-color,color,transform,opacity] duration-feedback ease-enter",
        // success/error menimpa warna varian → hierarchy (perhatian pengguna tertarik ke hasil aksi)
        status === "success"
          ? "border-brand-600 bg-brand-600 text-white"
          : status === "error"
            ? "animate-shake border-danger-600 bg-danger-600 text-white"
            : BUTTON_VARIANTS[variant].base,
        !inert && status === "idle" && [BUTTON_VARIANTS[variant].interactive, "active:scale-[0.97]"],
        disabled && "cursor-not-allowed opacity-50",
        busy && "cursor-progress",
        className,
      )}
      {...props}
    >
      {/* key={status} → konten di-remount tiap state berubah, sehingga ikon/label
          "bertransformasi" dengan fade cepat (100ms) alih-alih loncat. */}
      <span key={status} className="inline-flex animate-fade-in-fast items-center gap-2">
        {status === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            {loadingLabel}
          </>
        ) : status === "success" ? (
          <>
            <Check className="h-4 w-4 animate-pop" aria-hidden />
            {successLabel}
          </>
        ) : status === "error" ? (
          <>
            <AlertCircle className="h-4 w-4" aria-hidden />
            {errorLabel}
          </>
        ) : (
          children
        )}
      </span>
    </button>
  );
});
