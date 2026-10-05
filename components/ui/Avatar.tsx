import { clsx } from "clsx";
import { inisial } from "@/lib/text";

interface AvatarProps {
  nama: string;
  foto?: string;
  /** Ukuran & teks, mis. "h-9 w-9 text-sm". */
  className?: string;
}

// Foto bulat; bila belum ada foto, tampil inisial nama.
export function Avatar({ nama, foto, className }: AvatarProps) {
  return foto ? (
    // eslint-disable-next-line @next/next/no-img-element -- foto berupa data URL dari unggahan pengguna
    <img src={foto} alt="" className={clsx("shrink-0 rounded-full object-cover", className)} />
  ) : (
    <span className={clsx("flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700", className)}>
      {inisial(nama) || "?"}
    </span>
  );
}
