"use client";

import { useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Input } from "@/components/ui/Input";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { KATEGORI_INDUK } from "@/lib/data/kategori";
import { MAKS_PESAN_TUTUP, TUTUP_AWAL } from "@/lib/data/pengaturan";
import { useSekarang } from "@/lib/hooks/useSekarang";
import { isoTanggal } from "@/lib/format";
import { labelTanggalIso, pesanTutup, rapikanKategoriTutup, tutupBerlaku } from "@/lib/pengaturan";

const namaKategori = (ids: string[]) => (ids.length === 0 ? "Seluruh toko" : ids.map((id) => KATEGORI_INDUK.find((k) => k.id === id)?.nama ?? id).join(", "));

// Enter di isian ini tidak boleh mengirim form Pengaturan.
const cegahEnter = (e: KeyboardEvent<HTMLInputElement>) => {
  if (e.key === "Enter") e.preventDefault();
};

// Penutupan sementara: seluruh toko atau kategori tertentu, dengan tanggal buka
// kembali dan pesan untuk warga. Berlaku seketika (tidak menunggu "Simpan
// Pengaturan"), jadi punya tombol sendiri dan konfirmasi sendiri.
export function TutupSementaraPanel() {
  const { tutup, setTutup } = useDashboardData();
  const sekarang = useSekarang();
  const confirm = useConfirm();
  const toast = useToast();
  const [mengatur, setMengatur] = useState(false);
  const [form, setForm] = useState(TUTUP_AWAL);

  const berlaku = sekarang ? tutupBerlaku(tutup, sekarang) : tutup.aktif;
  const hariIni = sekarang ? isoTanggal(sekarang) : undefined;
  const tanggalLewat = form.sampai !== "" && hariIni !== undefined && form.sampai < hariIni;

  function ubahKategori(id: string) {
    setForm((f) => ({ ...f, kategori: f.kategori.includes(id) ? f.kategori.filter((k) => k !== id) : [...f.kategori, id] }));
  }

  async function tutupSekarang() {
    if (tanggalLewat) return;
    const kategori = rapikanKategoriTutup(form.kategori, KATEGORI_INDUK.length);
    const sampaiTeks = form.sampai ? `hingga ${labelTanggalIso(form.sampai)}` : "sampai Anda membukanya kembali";
    const ok = await confirm({
      title: "Tutup sementara sekarang?",
      description: `${namaKategori(kategori)} tidak menerima pesanan ${sampaiTeks}.`,
      confirmLabel: "Ya, Tutup Sementara",
      tone: "danger",
    });
    if (!ok) return;
    setTutup({ ...form, kategori, aktif: true, pesan: form.pesan.trim() });
    setMengatur(false);
    toast({
      type: "info",
      title: kategori.length === 0 ? "Toko ditutup sementara" : "Kategori ditutup sementara",
      description: namaKategori(kategori),
    });
  }

  function bukaKembali() {
    setTutup(TUTUP_AWAL);
    setForm(TUTUP_AWAL);
    toast({ type: "success", title: "Toko dibuka kembali" });
  }

  if (berlaku) {
    return (
      <div className="mt-5 flex items-center justify-between gap-4 rounded-lg bg-warn-50 p-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-warn-600">Tutup sementara aktif</p>
          <p className="mt-0.5 text-xs text-ink-700">
            {namaKategori(tutup.kategori)} · {tutup.sampai ? `hingga ${labelTanggalIso(tutup.sampai)}` : "sampai dibuka manual"}
          </p>
          <p className="mt-0.5 truncate text-xs text-ink-500">Pesan untuk warga: {pesanTutup(tutup)}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={bukaKembali}>
          Buka kembali
        </Button>
      </div>
    );
  }

  if (!mengatur) {
    return (
      <div className="mt-5 flex items-center justify-between gap-4 rounded-lg bg-surface-muted p-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink-900">Tutup sementara</p>
          <p className="mt-0.5 text-xs text-ink-500">
            Hentikan pesanan untuk seluruh toko atau kategori tertentu, misalnya jeda tanam, cuaca ekstrem, atau libur. Berlaku langsung.
          </p>
        </div>
        <Button variant="secondary" size="sm" className="shrink-0" onClick={() => setMengatur(true)}>
          Atur penutupan
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-4 rounded-lg border border-line bg-surface-muted p-4">
      <div>
        <p className="text-sm font-semibold text-ink-900">Tutup sementara</p>
        <p className="mt-0.5 text-xs text-ink-500">Berlaku langsung setelah dikonfirmasi, tanpa menunggu tombol Simpan Pengaturan.</p>
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium text-ink-900">Berlaku untuk</p>
        <div className="flex flex-wrap gap-2">
          <Chip selected={form.kategori.length === 0} onClick={() => setForm((f) => ({ ...f, kategori: [] }))}>
            Seluruh toko
          </Chip>
          {KATEGORI_INDUK.map((k) => (
            <Chip key={k.id} selected={form.kategori.includes(k.id)} onClick={() => ubahKategori(k.id)}>
              {k.nama}
            </Chip>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="tutupSampai" className="text-sm font-medium text-ink-900">
            Buka lagi setelah tanggal
          </label>
          <Input
            id="tutupSampai"
            type="date"
            min={hariIni}
            value={form.sampai}
            error={tanggalLewat ? "Tanggal sudah lewat" : undefined}
            onKeyDown={cegahEnter}
            onChange={(e) => setForm((f) => ({ ...f, sampai: e.target.value }))}
            containerClassName="mt-1.5"
          />
          <p className="mt-1 text-xs text-ink-400">Kosongkan bila dibuka manual. Dibuka otomatis setelah tanggal ini.</p>
        </div>
        <div>
          <label htmlFor="tutupPesan" className="text-sm font-medium text-ink-900">
            Pesan untuk warga
          </label>
          <Input
            id="tutupPesan"
            maxLength={MAKS_PESAN_TUTUP}
            placeholder="Contoh: Panen padi jeda sampai 5 Desember"
            value={form.pesan}
            onKeyDown={cegahEnter}
            onChange={(e) => setForm((f) => ({ ...f, pesan: e.target.value }))}
            containerClassName="mt-1.5"
          />
          <p className="mt-1 text-xs text-ink-400">
            Opsional. {form.pesan.length} / {MAKS_PESAN_TUTUP}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={() => setMengatur(false)}>
          Batal
        </Button>
        <Button variant="danger" size="sm" disabled={tanggalLewat} onClick={tutupSekarang}>
          Tutup sekarang
        </Button>
      </div>
    </div>
  );
}
