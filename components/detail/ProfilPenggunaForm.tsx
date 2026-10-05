"use client";

import { useRef, useState, type FormEvent } from "react";
import { Trash2, Upload } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { FormActions } from "@/components/ui/FormActions";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { MAKS_UKURAN_FOTO_BYTES } from "@/lib/constants";
import { useSimpanModal } from "./useSimpanModal";

const FORMAT_FOTO = ["image/jpeg", "image/png"];

// Edit profil pengguna (menu profil di kanan atas). Foto, nama, dan jabatan
// disimpan di DashboardDataProvider, jadi langsung berubah di Topbar, halaman
// Pengaturan, dan pratinjau warga.
export function ProfilPenggunaForm() {
  const { profil, ubahProfil } = useDashboardData();
  const { status, close, simpan } = useSimpanModal("Gagal menyimpan profil");
  const toast = useToast();
  const inputFotoRef = useRef<HTMLInputElement>(null);

  const [nama, setNama] = useState(profil.nama);
  const [jabatan, setJabatan] = useState(profil.jabatan);
  const [foto, setFoto] = useState(profil.foto);

  function pilihFoto(file?: File) {
    if (!file) return;
    if (!FORMAT_FOTO.includes(file.type)) {
      toast({ type: "error", title: "Format foto tidak didukung", description: "Gunakan file JPG atau PNG." });
      return;
    }
    if (file.size > MAKS_UKURAN_FOTO_BYTES) {
      toast({ type: "error", title: "Ukuran foto terlalu besar", description: "Maksimal 2 MB." });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setFoto(String(reader.result));
    reader.onerror = () => toast({ type: "error", title: "Foto gagal dibaca", description: "Coba pilih file lain." });
    reader.readAsDataURL(file);
    if (inputFotoRef.current) inputFotoRef.current.value = ""; // izinkan memilih file yang sama lagi
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    simpan(() => {
      ubahProfil({ nama: nama.trim(), jabatan: jabatan.trim(), foto });
      return { title: "Profil diperbarui", description: nama.trim() };
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-sm">
      <div className="flex items-center gap-4">
        <Avatar nama={nama} foto={foto} className="h-20 w-20 text-2xl" />
        <div className="space-y-2">
          <input ref={inputFotoRef} type="file" accept={FORMAT_FOTO.join(",")} className="sr-only" aria-label="Pilih foto profil" onChange={(e) => pilihFoto(e.target.files?.[0])} />
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => inputFotoRef.current?.click()}>
              <Upload className="h-3.5 w-3.5" />
              {foto ? "Ganti Foto" : "Unggah Foto"}
            </Button>
            {foto && (
              <Button variant="ghost" size="sm" className="text-danger-600" onClick={() => setFoto(undefined)}>
                <Trash2 className="h-3.5 w-3.5" />
                Hapus
              </Button>
            )}
          </div>
          <p className="text-xs text-ink-400">JPG/PNG, maksimal 2 MB. Ukuran ideal 400×400px.</p>
        </div>
      </div>

      <Field label="Nama lengkap" htmlFor="profil-nama">
        <Input id="profil-nama" required minLength={3} value={nama} onChange={(e) => setNama(e.target.value)} />
      </Field>

      <Field label="Jabatan di Poktan" htmlFor="profil-jabatan">
        <Input id="profil-jabatan" required minLength={3} value={jabatan} onChange={(e) => setJabatan(e.target.value)} placeholder="Mis. Ketua Poktan" />
      </Field>

      <FormActions onCancel={close} submitLabel="Simpan Profil" status={status} />
    </form>
  );
}
