"use client";

import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer, Stepper } from "@/components/ui/Drawer";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import {
  LangkahHargaStok,
  LangkahInfoDasar,
  LangkahPengiriman,
  LangkahPenjual,
  LangkahSpesifikasi,
} from "@/components/komoditas/wizard/Langkah";
import { dataDariDraft, draftDari, draftKosong, errorDraft, type DraftKomoditas } from "@/lib/komoditasForm";
import { useDetail } from "./DetailProvider";
import { useSimpanModal } from "./useSimpanModal";

const LANGKAH = ["Info Dasar", "Harga & Stok", "Penjual & Konten", "Spesifikasi", "Pengiriman"];
const KETERANGAN = [
  "Lengkapi informasi komoditas.",
  "Isi harga dan stok komoditas.",
  "Pilih penjual dan lengkapi konten.",
  "Isi spesifikasi sesuai kategori.",
  "Atur pengiriman dan kebijakan.",
];
const TERAKHIR = LANGKAH.length - 1;

// Form tambah/ubah komoditas dalam panel samping 5 langkah. Isian tetap satu `draft`
// (aturan konversi & validasi di lib/komoditasForm.ts); tiap langkah hanya menampilkan sebagian isian.
// Tambah: "Simpan sebagai Draft" menyimpan komoditas dalam keadaan nonaktif; "Publikasikan" langsung aktif.
export function KomoditasForm({ id }: { id?: string }) {
  const { komoditas, tambahKomoditas, ubahKomoditas } = useDashboardData();
  const { close } = useDetail();
  const { status, simpan } = useSimpanModal("Gagal menyimpan komoditas");
  const formRef = useRef<HTMLFormElement>(null);

  const awal = id ? komoditas.find((k) => k.id === id) : undefined;
  const [draft, setDraft] = useState<DraftKomoditas>(() => (awal ? draftDari(awal) : draftKosong(new Date())));
  const [langkah, setLangkah] = useState(0);
  const update = (patch: Partial<DraftKomoditas>) => setDraft((d) => ({ ...d, ...patch }));
  const error = errorDraft(draft);

  if (id && !awal) {
    return (
      <Drawer title="Ubah Komoditas" onClose={close}>
        <p className="text-sm text-ink-500">Komoditas tidak ditemukan.</p>
      </Drawer>
    );
  }

  // Langkah ini valid bila isian wajibnya terisi dan tidak ada galat khusus untuk langkah tersebut.
  const langkahValid = (n: number) => {
    if (formRef.current && !formRef.current.reportValidity()) return false;
    if (n === 1 && (error.stok || error.hargaCoret)) return false;
    if (n === TERAKHIR && error.pengiriman) return false;
    return true;
  };
  const lanjut = () => langkahValid(langkah) && setLangkah((n) => Math.min(TERAKHIR, n + 1));
  const kembali = () => setLangkah((n) => Math.max(0, n - 1));

  function kirim(sebagaiDraft: boolean) {
    if (!langkahValid(langkah)) return;
    const data = dataDariDraft(draft);
    const asalPanen = data.spesifikasi?.find((s) => s.label === "Asal Panen")?.nilai;
    data.asalBlok = data.asalBlok || asalPanen || data.penjual || "-";
    data.stokMaks = Math.max(1, data.stokMaks || 0);
    simpan(() => {
      if (awal) {
        ubahKomoditas(awal.id, data);
        return { title: "Komoditas diperbarui", description: data.nama };
      }
      tambahKomoditas({ ...data, tampil: !sebagaiDraft });
      return sebagaiDraft
        ? { title: "Disimpan sebagai draft", description: `${data.nama} belum tampil di katalog warga.` }
        : { title: "Komoditas dipublikasikan", description: `${data.nama} muncul di katalog warga.` };
    });
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (langkah < TERAKHIR) return lanjut(); // Enter di kolom isian = Lanjut
    kirim(false);
  }

  const props = { draft, update, error };
  const subtitle = awal ? `${awal.nama}. Langkah ${langkah + 1} dari 5.` : `Langkah ${langkah + 1} dari 5. ${KETERANGAN[langkah]}`;

  return (
    <Drawer
      title={awal ? "Edit Komoditas" : "Tambah Komoditas"}
      subtitle={subtitle}
      onClose={close}
      stepper={<Stepper steps={LANGKAH} current={langkah} onSelect={(i) => (awal || i < langkah) && setLangkah(i)} />}
      footer={(tutup) => (
        <>
          {langkah > 0 ? (
            <button type="button" onClick={kembali} className="rounded-lg px-1 py-2 text-sm font-semibold text-ink-700 hover:text-ink-900">
              Kembali
            </button>
          ) : (
            !awal && (
              <button type="button" onClick={() => kirim(true)} className="rounded-lg px-1 py-2 text-sm font-semibold text-ink-700 hover:text-ink-900">
                Simpan sebagai Draft
              </button>
            )
          )}
          <div className="ml-auto flex items-center gap-3">
            {!awal && langkah === TERAKHIR ? (
              <>
                <Button variant="secondary" className="border-brand-600 text-brand-700" onClick={() => kirim(true)}>
                  Simpan sebagai Draft
                </Button>
                <Button status={status} loadingLabel="Menyimpan…" successLabel="Terpublikasi" errorLabel="Coba lagi" onClick={() => kirim(false)}>
                  Publikasikan
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" className="border-brand-600 text-brand-700" onClick={tutup}>
                  Batal
                </Button>
                {langkah < TERAKHIR && (
                  <Button variant={awal ? "secondary" : "primary"} className={awal ? "border-brand-600 text-brand-700" : undefined} onClick={lanjut}>
                    Lanjut
                  </Button>
                )}
                {awal && (
                  <Button status={status} loadingLabel="Menyimpan…" successLabel="Tersimpan" errorLabel="Coba lagi" onClick={() => kirim(false)}>
                    Simpan Perubahan
                  </Button>
                )}
              </>
            )}
          </div>
        </>
      )}
    >
      <form ref={formRef} onSubmit={handleSubmit} noValidate={false} className="text-sm">
        {langkah === 0 && <LangkahInfoDasar {...props} />}
        {langkah === 1 && <LangkahHargaStok {...props} />}
        {langkah === 2 && <LangkahPenjual {...props} />}
        {langkah === 3 && <LangkahSpesifikasi {...props} />}
        {langkah === 4 && <LangkahPengiriman {...props} />}
      </form>
    </Drawer>
  );
}
