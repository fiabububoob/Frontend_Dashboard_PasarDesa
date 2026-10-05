"use client";

import { useState, type KeyboardEvent } from "react";
import { Pencil, X, Plus, Contact } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { useDetail } from "@/components/detail/DetailProvider";
import { usePengaturanForm } from "./PengaturanForm";
import { MAKS_KOMODITAS_UNGGULAN, NOMOR_REGISTRASI } from "@/lib/data/pengaturan";

export function ProfilForm() {
  const { draft, update } = usePengaturanForm();
  const { komoditas, profil } = useDashboardData();
  const { open } = useDetail();
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
    <Card className="p-5">
      <SectionHeader huruf="A" judul="Identitas & Profil Lapak Tani" deskripsi="Data kelompok tani dan kontak yang tampil ke warga." icon={Contact} />

      <div className="mt-5 flex items-center gap-4">
        <Avatar nama={profil.nama} foto={profil.foto} className="h-16 w-16 text-xl" />
        <div>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-ink-900">
            Foto Profil Wakil Poktan
            <button type="button" onClick={() => open({ type: "profil" })} className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline">
              <Pencil className="h-3 w-3" />
              Edit Profil &amp; Foto
            </button>
          </p>
          <p className="text-xs text-ink-500">Foto dan nama pengurus diubah lewat Edit Profil (juga bisa dari menu profil di kanan atas).</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-700">
            {profil.nama} ({profil.jabatan})
            <Badge tone="success">Terverifikasi Dukcapil</Badge>
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="namaLapak" className="flex items-center justify-between text-sm font-medium text-ink-900">
            Nama Lapak / Kelompok Tani
            <span className="text-xs font-normal text-danger-600">Wajib</span>
          </label>
          <Input id="namaLapak" name="namaLapak" required minLength={3} value={draft.namaLapak} onChange={(e) => update({ namaLapak: e.target.value })} containerClassName="mt-1.5" />
        </div>
        <div>
          <label htmlFor="noReg" className="flex items-center justify-between text-sm font-medium text-ink-900">
            Nomor Registrasi Balai Desa
            <Badge tone="success">Resmi Disperindag</Badge>
          </label>
          <input id="noReg" value={NOMOR_REGISTRASI} disabled readOnly className="mt-1.5 w-full rounded-lg border border-line bg-surface-muted px-3 py-2.5 text-sm text-ink-500" />
        </div>
        <div>
          <label htmlFor="whatsapp" className="text-sm font-medium text-ink-900">
            Nomor WhatsApp Narahubung Toko
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
          <p className="mt-1 text-xs text-ink-400">Notifikasi pesanan dikirim otomatis ke nomor ini.</p>
        </div>
        <div>
          <p className="text-sm font-medium text-ink-900">
            Komoditas Unggulan Musim Ini <span className="text-xs font-normal text-ink-400">({tags.length}/{MAKS_KOMODITAS_UNGGULAN})</span>
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
      </div>

      <div className="mt-4">
        <label htmlFor="deskripsi" className="text-sm font-medium text-ink-900">
          Deskripsi Riwayat &amp; Kapasitas Poktan
        </label>
        <textarea
          id="deskripsi"
          value={draft.deskripsi}
          onChange={(e) => update({ deskripsi: e.target.value.slice(0, 300) })}
          rows={3}
          maxLength={300}
          className="mt-1.5 w-full rounded-lg border border-line px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-ink-400">
          Tampil pada kartu informasi toko saat pembeli membuka katalog PasarDesa. {draft.deskripsi.length} / 300 Karakter
        </p>
      </div>
    </Card>
  );
}
