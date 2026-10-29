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
    <span className={clsx("flex shrink-0 items-center justify-center rounded-full bg-brand-600 font-semibold text-white", className)}>
      {inisial(nama) || "?"}
    </span>
  );
}
