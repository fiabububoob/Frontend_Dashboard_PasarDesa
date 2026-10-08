import { clsx } from "clsx";

interface FotoProdukProps {
  nama: string;
  /** Foto sampul (URL/data URL). Kosong → tampil emoji `ikon`. */
  foto?: string;
  /** Emoji cadangan. */
  ikon: string;
  /** Ukuran & ukuran teks emoji, mis. "h-10 w-10 text-lg". */
  className?: string;
}

// Satu-satunya tempat yang menentukan bagaimana produk digambarkan: foto bila ada,
// emoji bila belum. Komponen lain cukup memakai ini.
export function FotoProduk({ nama, foto, ikon, className }: FotoProdukProps) {
  return foto ? (
    // eslint-disable-next-line @next/next/no-img-element -- foto berupa data URL dari unggahan pengguna
    <img src={foto} alt={nama} className={clsx("shrink-0 rounded-lg object-cover", className)} />
  ) : (
    <span role="img" aria-label={nama} className={clsx("flex shrink-0 items-center justify-center rounded-lg bg-surface-muted", className)}>
      {ikon}
    </span>
  );
}