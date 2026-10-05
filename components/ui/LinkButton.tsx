import { clsx } from "clsx";
import type { AnchorHTMLAttributes } from "react";
import { BUTTON_BASE, BUTTON_SIZES, BUTTON_VARIANTS, type ButtonSize } from "./buttonStyles";

interface LinkButtonProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "target" | "rel"> {
  href: string;
  /** Buka di tab baru (WhatsApp, situs luar). Tautan `tel:` tidak memerlukannya. */
  external?: boolean;
  size?: ButtonSize;
}

// Tautan (<a>) yang tampil seperti tombol sekunder: untuk aksi berupa navigasi
// (telepon, WhatsApp), bukan aksi yang mengubah data — itu tetap <Button>.
export function LinkButton({ external = false, size = "md", className, children, ...props }: LinkButtonProps) {
  return (
    <a
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={clsx(
        BUTTON_BASE,
        BUTTON_SIZES[size],
        BUTTON_VARIANTS.secondary.base,
        BUTTON_VARIANTS.secondary.interactive,
        "transition-colors duration-feedback ease-enter",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}
