"use client";

import { useState, type KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { usePengaturanForm } from "./PengaturanForm";
import { MAKS_KOMODITAS_UNGGULAN } from "@/lib/data/pengaturan";

export function ProfilForm() {
  const { draft, update } = usePengaturanForm();
  const { komoditas } = useDashboardData();
  const toast = useToast();
  const [menambah, setMenambah] = useState(false);
  const [tagBaru, setTagBaru] = useState("");

  const tags = draft.komoditasUnggulan;
  const penuh = tags.length >= MAKS_KOMODITAS_UNGGULAN;

  function tambahTag() {
    const nama = tagBaru.trim();
    if (!nama) return;
    if (tags.some((t) => t.toLowerCase() === nama.toLowerCase())) {
      toast({ type: "info", title: "Sudah ada di daftar", description: nama });
      return;
    }
    update({ komoditasUnggulan: [...tags, nama] });
    setTagBaru("");
    if (tags.length + 1 >= MAKS_KOMODITAS_UNGGULAN) setMenambah(false);
  }

  // Enter di kolom ini menambah chip — bukan mengirim seluruh form.
  function onTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      tambahTag();
    } else if (e.key === "Escape") {
      setMenambah(false);
      setTagBaru("");
    }
  }

  return (
    <section className="p-6">
      <SectionHeader judul="Profil lapak" deskripsi="Tampil ke warga di halaman toko. Foto dan nama pengurus diubah dari menu profil di kanan atas." />

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="namaLapak" className="text-sm font-medium text-ink-900">
            Nama lapak
          </label>
          <Input
            id="namaLapak"
            name="namaLapak"
            required
            minLength={3}
            value={draft.namaLapak}
            onChange={(e) => update({ namaLapak: e.target.value })}
            containerClassName="mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="whatsapp" className="text-sm font-medium text-ink-900">
            WhatsApp untuk pesanan
          </label>
          <Input
            id="whatsapp"
            name="whatsapp"
            prefixText="+62"
            inputMode="tel"
            required
            minLength={8}
            pattern={"[0-9 \\-]+"}
            patternMessage="Hanya boleh angka, spasi, atau tanda hubung"
            value={draft.whatsapp}
            onChange={(e) => update({ whatsapp: e.target.value })}
            containerClassName="mt-1.5"
          />
        </div>

        <div className="sm:col-span-2">
          <p className="text-sm font-medium text-ink-900">
            Komoditas unggulan{" "}
            <span className="text-xs font-normal text-ink-400">
              ({tags.length}/{MAKS_KOMODITAS_UNGGULAN})
            </span>
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {tags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 rounded-full bg-surface-sunken px-3 py-1.5 text-xs font-medium text-ink-700">
                {tag}
                <button type="button" aria-label={`Hapus ${tag}`} onClick={() => update({ komoditasUnggulan: tags.filter((t) => t !== tag) })}>
                  <X className="h-3 w-3 text-ink-400 hover:text-ink-700" />
                </button>
              </span>
            ))}
            {menambah ? (
              <span className="flex items-center gap-1">
                <input
                  autoFocus
                  list="saran-komoditas"
                  aria-label="Nama komoditas unggulan"
                  value={tagBaru}
                  onChange={(e) => setTagBaru(e.target.value)}
                  onKeyDown={onTagKeyDown}
                  placeholder="Ketik / pilih komoditas"
                  className="w-44 rounded-full border border-brand-500 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <datalist id="saran-komoditas">
                  {komoditas.map((k) => (
                    <option key={k.id} value={k.nama} />
                  ))}
                </datalist>
                <button type="button" onClick={tambahTag} className="rounded-full bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700">
                  Tambah
                </button>
              </span>
            ) : (
              <button
                type="button"
                disabled={penuh}
                title={penuh ? `Maksimal ${MAKS_KOMODITAS_UNGGULAN} komoditas unggulan` : undefined}
                onClick={() => setMenambah(true)}
                className="flex items-center gap-1 rounded-full border border-dashed border-line px-3 py-1.5 text-xs font-medium text-brand-600 disabled:cursor-not-allowed disabled:text-ink-400"
              >
                <Plus className="h-3 w-3" />
                Tambah Baru
              </button>
            )}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="deskripsi" className="text-sm font-medium text-ink-900">
            Deskripsi
          </label>
          <textarea
            id="deskripsi"
            value={draft.deskripsi}
            onChange={(e) => update({ deskripsi: e.target.value.slice(0, 300) })}
            rows={3}
            maxLength={300}
            className="mt-1.5 w-full rounded-lg border border-line px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
          />
          <p className="mt-1 text-right text-xs text-ink-400">{draft.deskripsi.length} / 300</p>
        </div>
      </div>
    </section>
  );
}
