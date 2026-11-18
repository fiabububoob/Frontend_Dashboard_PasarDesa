import { Star } from "lucide-react";
import { clsx } from "clsx";

// Deretan 5 bintang untuk rating 1–5 (diisi sesuai nilai). `label` dibaca pembaca layar, bintangnya dekoratif.
export function Bintang({ nilai, ukuran = "h-4 w-4", className }: { nilai: number; ukuran?: string; className?: string }) {
  const bulat = Math.round(nilai);
  return (
    <span role="img" aria-label={`Rating ${nilai} dari 5`} className={clsx("inline-flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} aria-hidden className={clsx(ukuran, n <= bulat ? "fill-[#F5A623] text-[#F5A623]" : "fill-transparent text-ink-300")} />
      ))}
    </span>
  );
}
