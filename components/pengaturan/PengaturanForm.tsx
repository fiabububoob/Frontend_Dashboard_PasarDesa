"use client";

import { createContext, useContext, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { useActionStatus } from "@/lib/hooks/useActionStatus";
import { LATENSI } from "@/lib/constants";
import { simulateRequest } from "@/lib/fake-api";
import { cekJadwal } from "@/lib/pengaturan";
import type { PengaturanLapak } from "@/types";

// Draft = salinan pengaturan yang sedang diedit. Semua field (profil, jadwal,
// drop-point) membaca & menulis draft lewat usePengaturanForm(); draft baru
// menjadi pengaturan resmi setelah "Simpan Pengaturan". Karena draft berada di
// satu tempat, kartu "Tampilan di Aplikasi Warga" ikut berubah saat mengetik,
// dan "ada perubahan?" dihitung dengan membandingkan draft dengan data tersimpan.
interface FormContextValue {
  draft: PengaturanLapak;
  update: (patch: Partial<PengaturanLapak>) => void;
  jadwalErrors: Record<number, string>;
}
const FormContext = createContext<FormContextValue | null>(null);

export function usePengaturanForm() {
  const ctx = useContext(FormContext);
  if (!ctx) throw new Error("usePengaturanForm harus dipakai di dalam <PengaturanForm>");
  return ctx;
}

interface PengaturanFormProps {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
}

// Membungkus seluruh halaman Pengaturan dalam satu <form> dengan alur:
//   Simpan  → validasi → dialog "Yakin ingin menyimpan?" → loading → success/error (+toast)
//   Batal   → dialog "Batalkan perubahan?" → draft dikembalikan ke data tersimpan
// Kedua tombol nonaktif (disabled) selama belum ada perubahan.
export function PengaturanForm({ eyebrow, title, description, children }: PengaturanFormProps) {
  const { pengaturan, simpanPengaturan } = useDashboardData();
  const [draft, setDraft] = useState<PengaturanLapak>(pengaturan);
  const [resetKey, setResetKey] = useState(0);
  const confirm = useConfirm();
  const toast = useToast();
  const { status, run } = useActionStatus();

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(pengaturan), [draft, pengaturan]);
  const jadwalErrors = useMemo(() => cekJadwal(draft.jadwal), [draft.jadwal]);
  const update = (patch: Partial<PengaturanLapak>) => setDraft((d) => ({ ...d, ...patch }));

  // Peringatkan bila halaman ditutup/di-refresh saat masih ada perubahan yang belum disimpan.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;

    // checkValidity() memicu event `invalid` di tiap field yang salah → <Input> menampilkan error-nya.
    if (!form.checkValidity()) {
      toast({ type: "error", title: "Ada isian yang belum valid", description: "Periksa kolom yang ditandai merah." });
      form.querySelector<HTMLElement>(":invalid")?.focus();
      return;
    }
    if (Object.keys(jadwalErrors).length > 0) {
      toast({ type: "error", title: "Jadwal buka belum valid", description: "Periksa baris jadwal yang ditandai merah." });
      return;
    }

    const ok = await confirm({
      title: "Yakin ingin menyimpan perubahan?",
      description: "Perubahan langsung berlaku di aplikasi warga dan kurir desa.",
      confirmLabel: "Ya, Simpan",
      cancelLabel: "Periksa Lagi",
    });
    if (!ok) return;

    const saved = await run(async () => {
      await simulateRequest(LATENSI.lambat);
      simpanPengaturan(draft);
    });
    if (saved) {
      toast({ type: "success", title: "Pengaturan tersimpan", description: "Perubahan sudah aktif di aplikasi warga." });
    } else {
      toast({ type: "error", title: "Gagal menyimpan pengaturan", description: "Perubahan Anda masih aman di halaman ini. Coba lagi." });
    }
  }

  async function handleCancel() {
    const ok = await confirm({
      title: "Batalkan semua perubahan?",
      description: "Isian kembali ke data tersimpan dan perubahan yang belum disimpan akan hilang.",
      confirmLabel: "Ya, Batalkan",
      cancelLabel: "Lanjut Mengedit",
      tone: "danger",
    });
    if (!ok) return;
    setDraft(pengaturan);
    setResetKey((k) => k + 1); // mount ulang field → pesan error lama ikut hilang
    toast({ type: "info", title: "Perubahan dibatalkan" });
  }

  return (
    <FormContext.Provider value={{ draft, update, jadwalErrors }}>
      <form noValidate autoComplete="off" onSubmit={handleSubmit} className="space-y-6">
        <PageHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
          actions={
            <>
              <Button variant="secondary" disabled={!dirty || status === "loading"} onClick={handleCancel}>
                Batal Perubahan
              </Button>
              <Button
                type="submit"
                status={status}
                disabled={!dirty && status === "idle"}
                title={!dirty && status === "idle" ? "Belum ada perubahan untuk disimpan" : undefined}
                loadingLabel="Menyimpan…"
                successLabel="Tersimpan"
                errorLabel="Gagal, coba lagi"
              >
                Simpan Pengaturan
              </Button>
            </>
          }
        />
        <div key={resetKey} className="space-y-6">
          {children}
        </div>
      </form>
    </FormContext.Provider>
  );
}
