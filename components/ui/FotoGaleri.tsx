"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { urlFoto } from "@/lib/fotoUrl";

interface Props {
  foto: string[];
  /** Kelas ukuran kotak mini, mis. "h-20 w-20". */
  ukuran?: string;
  /** Teks pengganti gambar (dibaca pembaca layar). */
  alt: string;
}

// Deretan foto kecil; diklik membuka tampilan besar (Esc menutup, panah kiri/kanan berpindah).
// Dipakai untuk bukti komplain, bukti tiket aduan, dan foto ulasan pembeli.
export function FotoGaleri({ foto, ukuran = "h-20 w-20", alt }: Props) {
  const [buka, setBuka] = useState<number | null>(null);
  const daftar = foto.map(urlFoto);

  useEffect(() => {
    if (buka === null) return;
    const n = daftar.length;
    // Fase capture + stopImmediatePropagation: Esc hanya menutup galeri, bukan panel/modal di belakangnya.
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopImmediatePropagation();
        setBuka(null);
      } else if (e.key === "ArrowRight") setBuka((i) => (i === null ? i : (i + 1) % n));
      else if (e.key === "ArrowLeft") setBuka((i) => (i === null ? i : (i - 1 + n) % n));
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [buka, daftar.length]);

  if (daftar.length === 0) return null;

  return (
    <>
      <ul className="flex flex-wrap gap-2">
        {daftar.map((src, i) => (
          <li key={`${src}-${i}`}>
            <button type="button" onClick={() => setBuka(i)} aria-label={`Perbesar ${alt} ${i + 1}`} className={clsx("block overflow-hidden rounded-xl border border-line bg-surface-muted", ukuran)}>
              {/* eslint-disable-next-line @next/next/no-img-element -- foto unggahan pembeli dari server backend */}
              <img src={src} alt={`${alt} ${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
            </button>
          </li>
        ))}
      </ul>

      {buka !== null && (
        <div role="dialog" aria-modal="true" aria-label={`${alt} ${buka + 1} dari ${daftar.length}`} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4" onClick={() => setBuka(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element -- tampilan besar foto bukti */}
          <img src={daftar[buka]} alt={`${alt} ${buka + 1}`} className="max-h-full max-w-full rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
          <button type="button" aria-label="Tutup" onClick={() => setBuka(null)} className="absolute right-4 top-4 rounded-full bg-white/15 p-2 text-white hover:bg-white/25">
            <X className="h-5 w-5" />
          </button>
          {daftar.length > 1 && (
            <>
              <button type="button" aria-label="Foto sebelumnya" onClick={(e) => { e.stopPropagation(); setBuka((buka - 1 + daftar.length) % daftar.length); }} className="absolute left-4 rounded-full bg-white/15 p-2 text-white hover:bg-white/25">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button type="button" aria-label="Foto berikutnya" onClick={(e) => { e.stopPropagation(); setBuka((buka + 1) % daftar.length); }} className="absolute right-4 rounded-full bg-white/15 p-2 text-white hover:bg-white/25">
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
