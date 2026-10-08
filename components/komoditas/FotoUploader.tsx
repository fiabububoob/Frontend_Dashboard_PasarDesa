"use client";

import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { MAKS_FOTO_PRODUK, MAKS_UKURAN_FOTO_PRODUK_BYTES } from "@/lib/constants";
import { FORMAT_FOTO_PRODUK, kompresFoto, validasiFoto } from "@/lib/foto";

interface FotoUploaderProps {
  foto: string[];
  onChange: (foto: string[]) => void;
}

// Kelola galeri foto produk: tambah (banyak file sekaligus), jadikan sampul, hapus.
// Foto pertama = sampul yang tampil di daftar dan di app pembeli.
export function FotoUploader({ foto, onChange }: FotoUploaderProps) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [memproses, setMemproses] = useState(false);
  const sisa = MAKS_FOTO_PRODUK - foto.length;

  async function tambah(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (files.length > sisa) toast({ type: "info", title: `Maksimal ${MAKS_FOTO_PRODUK} foto`, description: `Hanya ${sisa} foto pertama yang dipakai.` });

    setMemproses(true);
    const diterima: string[] = [];
    for (const file of Array.from(files).slice(0, sisa)) {
      const masalah = validasiFoto(file);
      if (masalah) {
        toast({ type: "error", title: `${file.name} ditolak`, description: masalah });
        continue;
      }
      try {
        diterima.push(await kompresFoto(file));
      } catch {
        toast({ type: "error", title: `${file.name} gagal diproses`, description: "Coba pilih file lain." });
      }
    }
    setMemproses(false);
    if (inputRef.current) inputRef.current.value = ""; // izinkan memilih file yang sama lagi
    if (diterima.length > 0) onChange([...foto, ...diterima]);
  }

  const jadikanSampul = (index: number) => onChange([foto[index], ...foto.filter((_, i) => i !== index)]);
  const hapus = (index: number) => onChange(foto.filter((_, i) => i !== index));

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium text-ink-700">Foto produk</span>
        <span className="text-xs text-ink-400">
          {foto.length}/{MAKS_FOTO_PRODUK}
        </span>
      </div>

      <ul className="grid grid-cols-4 gap-2 sm:grid-cols-5">
        {foto.map((src, index) => (
          <li key={`${index}-${src.length}`} className="relative aspect-square overflow-hidden rounded-lg border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL dari unggahan */}
            <img src={src} alt={`Foto produk ${index + 1}`} className="h-full w-full object-cover" />
            {index === 0 && <span className="absolute left-1 top-1 rounded bg-brand-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">Sampul</span>}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-ink-900/60 px-1.5 py-1">
              {index > 0 ? (
                <button type="button" onClick={() => jadikanSampul(index)} className="text-[10px] font-medium text-white hover:underline">
                  Jadikan sampul
                </button>
              ) : (
                <span />
              )}
              <button type="button" aria-label={`Hapus foto ${index + 1}`} onClick={() => hapus(index)} className="text-white hover:text-danger-50">
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          </li>
        ))}

        {sisa > 0 && (
          <li>
            <button
              type="button"
              disabled={memproses}
              onClick={() => inputRef.current?.click()}
              className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-line text-xs text-ink-500 transition-colors duration-feedback ease-enter hover:bg-surface-muted disabled:cursor-wait disabled:opacity-60"
            >
              <ImagePlus className="h-5 w-5" aria-hidden />
              {memproses ? "Memproses…" : "Tambah"}
            </button>
          </li>
        )}
      </ul>

      <input ref={inputRef} type="file" accept={FORMAT_FOTO_PRODUK.join(",")} multiple className="sr-only" aria-label="Pilih foto produk" onChange={(e) => tambah(e.target.files)} />
      <p className="mt-1.5 text-xs text-ink-400">
        JPG/PNG/WebP, maks. {MAKS_UKURAN_FOTO_PRODUK_BYTES / 1024 / 1024} MB per foto. Foto pertama jadi sampul di app pembeli.
      </p>
    </div>
  );
}