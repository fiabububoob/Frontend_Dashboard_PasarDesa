"use client";

import { useRef, useState } from "react";
import { Download, FileUp, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { downloadCsv, parseCsv } from "@/lib/csv";
import { IKON_BAWAAN, IKON_SUB_KATEGORI, NAMA_SUB_KATEGORI } from "@/lib/kategori";import { useDetail } from "./DetailProvider";
import type { KomoditasBaru } from "@/types";

const KOLOM = ["nama", "kategori", "asalBlok", "harga", "satuan", "stok", "stokMaks"] as const;

interface Hasil {
  valid: KomoditasBaru[];
  masalah: string[];
}

// Mengubah isi CSV menjadi komoditas siap tambah + daftar baris bermasalah.
function bacaCsv(teks: string): Hasil | { error: string } {
  const rows = parseCsv(teks);
  if (rows.length < 2) return { error: "File kosong atau hanya berisi judul kolom." };

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const idx = Object.fromEntries(KOLOM.map((k) => [k, header.indexOf(k.toLowerCase())]));
  const hilang = KOLOM.filter((k) => idx[k] === -1);
  if (hilang.length) return { error: `Kolom belum lengkap: ${hilang.join(", ")}. Unduh template untuk contoh format.` };

  const valid: KomoditasBaru[] = [];
  const masalah: string[] = [];
  rows.slice(1).forEach((r, i) => {
    const baris = i + 2;
    const v = (k: (typeof KOLOM)[number]) => (r[idx[k]] ?? "").trim();
    const harga = Number(v("harga"));
    const stok = Number(v("stok"));
    const stokMaks = Number(v("stokMaks"));
    const kategori = NAMA_SUB_KATEGORI.find((k) => k.toLowerCase() === v("kategori").toLowerCase());

    if (v("nama").length < 3) return masalah.push(`Baris ${baris}: nama minimal 3 karakter`);
    if (!kategori) return masalah.push(`Baris ${baris}: kategori harus salah satu dari ${NAMA_SUB_KATEGORI.join(" / ")}`);
    if (!v("asalBlok") || !v("satuan")) return masalah.push(`Baris ${baris}: asalBlok dan satuan wajib diisi`);
    if (![harga, stok, stokMaks].every((n) => Number.isFinite(n)) || harga <= 0 || stok < 0 || stokMaks <= 0)
      return masalah.push(`Baris ${baris}: harga, stok, dan stokMaks harus angka yang valid`);
    if (stok > stokMaks) return masalah.push(`Baris ${baris}: stok melebihi kapasitas`);

    valid.push({ nama: v("nama"), kategori, gambar: IKON_SUB_KATEGORI[kategori] ?? IKON_BAWAAN, asalBlok: v("asalBlok"), harga, satuan: v("satuan"), stok, stokMaks });
  });
  return { valid, masalah };
}

export function ImporEksporContent() {
  const { komoditas, tambahKomoditas } = useDashboardData();
  const { close } = useDetail();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [namaFile, setNamaFile] = useState("");
  const [hasil, setHasil] = useState<Hasil | null>(null);
  const [error, setError] = useState<string | null>(null);

  function ekspor() {
    downloadCsv("komoditas-sukorejo.csv", [
      ["sku", ...KOLOM, "tampil", "waktuPanen"],
      ...komoditas.map((k) => [k.sku, k.nama, k.kategori, k.asalBlok, k.harga, k.satuan, k.stok, k.stokMaks, k.tampil ? "ya" : "tidak", k.waktuPanen]),
    ]);
    toast({ type: "success", title: "Data diekspor", description: `${komoditas.length} komoditas → komoditas-sukorejo.csv` });
  }

  function unduhTemplate() {
    downloadCsv("template-impor-komoditas.csv", [
      [...KOLOM],
      ["Kacang Tanah Kupas 1kg", "Dapur & Rumah", "Blok Sawah Timur (RT 04)", 28000, "kg", 20, 40],
    ]);
  }

  async function onPilihFile(file?: File) {
    setHasil(null);
    setError(null);
    if (!file) return;
    setNamaFile(file.name);
    const r = bacaCsv(await file.text());
    if ("error" in r) setError(r.error);
    else setHasil(r);
  }

  function impor() {
    if (!hasil?.valid.length) return;
    hasil.valid.forEach(tambahKomoditas);
    toast({ type: "success", title: "Impor selesai", description: `${hasil.valid.length} komoditas ditambahkan.` });
    close();
  }

  return (
    <div className="space-y-5 text-sm">
      <section>
        <p className="font-medium text-ink-900">Ekspor data</p>
        <p className="mt-0.5 text-xs text-ink-500">Unduh seluruh {komoditas.length} komoditas sebagai CSV (bisa dibuka di Excel).</p>
        <Button className="mt-3" onClick={ekspor}>
          <Download className="h-4 w-4" />
          Ekspor CSV
        </Button>
      </section>

      <hr className="border-line" />

      <section>
        <p className="font-medium text-ink-900">Impor data</p>
        <p className="mt-0.5 text-xs text-ink-500">
          Kolom wajib: {KOLOM.join(", ")}. Komoditas dari file ditambahkan sebagai item baru (data yang ada tidak ditimpa).
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="sr-only" aria-label="Pilih file CSV" onChange={(e) => onPilihFile(e.target.files?.[0])} />
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            <FileUp className="h-4 w-4" />
            Pilih file CSV
          </Button>
          <Button variant="secondary" onClick={unduhTemplate}>
            Unduh template
          </Button>
        </div>

        {namaFile && <p className="mt-2 text-xs text-ink-500">File: {namaFile}</p>}
        {error && <p role="alert" className="mt-2 rounded-lg bg-danger-50 p-3 text-xs text-danger-600">{error}</p>}

        {hasil && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-ink-700">
              <span className="font-medium text-brand-700">{hasil.valid.length} baris siap diimpor</span>
              {hasil.masalah.length > 0 && <span className="text-danger-600"> · {hasil.masalah.length} baris dilewati</span>}
            </p>
            {hasil.masalah.length > 0 && (
              <ul className="max-h-28 list-disc space-y-0.5 overflow-y-auto rounded-lg bg-danger-50 p-3 pl-6 text-xs text-danger-600">
                {hasil.masalah.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            )}
            <div className="flex justify-end">
              <Button onClick={impor} disabled={hasil.valid.length === 0}>
                <Upload className="h-4 w-4" />
                Impor {hasil.valid.length} komoditas
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
