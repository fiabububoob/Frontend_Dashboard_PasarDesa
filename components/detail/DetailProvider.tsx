"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Modal } from "@/components/ui/Modal";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { PERIODE_LAPORAN } from "@/lib/constants";
import { WARTA_LIST, HOTLINE_BUMDES } from "@/lib/data/ringkasan";
import { PesananContent } from "./PesananContent";
import { KomoditasContent } from "./KomoditasContent";
import { KategoriContent } from "./KategoriContent";
import { KurirContent } from "./KurirContent";
import { WartaContent } from "./WartaContent";
import { TambahPanenForm } from "./TambahPanenForm";
import { RekapContent } from "./RekapContent";
import { LaporanContent } from "./LaporanContent";
import { HotlineContent } from "./HotlineContent";
import { KomoditasForm } from "./KomoditasForm";
import { ImporEksporContent } from "./ImporEksporContent";
import { NotaContent } from "./NotaContent";
import { SuratJalanContent } from "./SuratJalanContent";
import { TransaksiContent } from "./TransaksiContent";
import { RekeningForm } from "./RekeningForm";
import { LaporanKasContent } from "./LaporanKasContent";
import { PratinjauWargaContent } from "./PratinjauWargaContent";
import { PiagamContent } from "./PiagamContent";
import { ProfilPenggunaForm } from "./ProfilPenggunaForm";
import type { DetailTarget } from "@/types";

interface DetailApi {
  /** Buka modal baru dari nol (dipakai pencarian, notifikasi, tombol). */
  open: (target: DetailTarget) => void;
  /** Buka di atas modal yang sedang tampil; tombol "Kembali" muncul. */
  push: (target: DetailTarget) => void;
  close: () => void;
}

const Ctx = createContext<DetailApi | null>(null);

// Memasang SATU modal untuk seluruh dashboard. Isinya ditentukan oleh
// DetailTarget, jadi kategori, hasil pencarian, notifikasi, dan tombol-tombol
// Ringkasan semua memakai jalur yang sama: useDetail().open({ type, ... }).
export function DetailProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<DetailTarget[]>([]);
  const data = useDashboardData();

  const open = useCallback((t: DetailTarget) => setStack([t]), []);
  const push = useCallback((t: DetailTarget) => setStack((s) => [...s, t]), []);
  const close = useCallback(() => setStack([]), []);
  const back = useCallback(() => setStack((s) => s.slice(0, -1)), []);
  const api = useMemo(() => ({ open, push, close }), [open, push, close]);

  const current = stack[stack.length - 1];
  const meta = current ? describe(current, data) : null;

  return (
    <Ctx.Provider value={api}>
      {children}
      {current && meta && (
        <Modal title={meta.title} subtitle={meta.subtitle} size={meta.size} onClose={close} onBack={stack.length > 1 ? back : undefined}>
          {renderBody(current)}
        </Modal>
      )}
    </Ctx.Provider>
  );
}

export function useDetail() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDetail harus dipakai di dalam <DetailProvider>");
  return ctx;
}

function describe(t: DetailTarget, data: ReturnType<typeof useDashboardData>): { title: string; subtitle?: string; size?: "md" | "lg" } {
  switch (t.type) {
    case "pesanan": {
      const p = data.pesanan.find((x) => x.id === t.id);
      return { title: `Pesanan #${p?.id ?? t.id}`, subtitle: p ? `${p.pembeli} · ${p.waktu}` : undefined };
    }
    case "komoditas": {
      const k = data.komoditas.find((x) => x.id === t.id);
      return { title: k?.nama ?? "Komoditas", subtitle: k ? `SKU: ${k.sku}` : undefined };
    }
    case "kategori":
      return { title: t.nama, subtitle: "Komoditas dalam kategori ini" };
    case "kurir":
      return { title: "Jadwal Penjemputan Kurir", subtitle: "Logistik BUMDes" };
    case "warta":
      return { title: WARTA_LIST.find((w) => w.id === t.id)?.judul ?? "Warta", subtitle: "Pengumuman BUMDes Sukorejo" };
    case "tambah-panen":
      return { title: "Tambah Hasil Panen Baru", subtitle: "Catat panen masuk lumbung, stok bertambah otomatis." };
    case "rekap":
      return { title: "Rekap Hari Ini", subtitle: "Ringkasan aktivitas lapak untuk dicetak", size: "lg" };
    case "laporan":
      return { title: "Laporan Panen 7 Hari Terakhir", subtitle: "Volume dan nilai per komoditas", size: "lg" };
    case "hotline":
      return { title: HOTLINE_BUMDES.nama, subtitle: HOTLINE_BUMDES.jam };
    case "form-komoditas": {
      const k = t.id ? data.komoditas.find((x) => x.id === t.id) : undefined;
      return k
        ? { title: "Ubah Komoditas", subtitle: `SKU: ${k.sku}` }
        : { title: "Tambah Komoditas Panen", subtitle: "Komoditas baru langsung muncul di katalog warga." };
    }
    case "impor-ekspor":
      return { title: "Import / Ekspor Data", subtitle: "Pindahkan data komoditas lewat file CSV" };
    case "nota": {
      const p = data.pesanan.find((x) => x.id === t.id);
      return { title: "Nota & Label Drop-Point", subtitle: p ? `#${p.id} · ${p.pembeli}` : undefined, size: "lg" };
    }
    case "surat-jalan":
      return { title: "Surat Jalan Kurir Desa", subtitle: "Semua paket yang menunggu dijemput", size: "lg" };
    case "transaksi": {
      const x = data.transaksi.find((y) => y.id === t.id);
      return { title: "Bukti Mutasi", subtitle: x ? `${x.id} · ${x.tanggal}` : undefined };
    }
    case "rekening":
      return { title: "Ubah Rekening Pencairan", subtitle: "Rekening tujuan transfer dana hasil panen" };
    case "laporan-kas":
      return { title: `Laporan Kas ${PERIODE_LAPORAN}`, subtitle: "Pratinjau sebelum dicetak / disimpan PDF", size: "lg" };
    case "pratinjau-warga":
      return { title: "Tampilan untuk Warga", subtitle: "Seperti yang dilihat pembeli di aplikasi PasarDesa" };
    case "piagam":
      return { title: "Piagam Mitra BUMDes", subtitle: "Pratinjau sebelum dicetak / disimpan PDF", size: "lg" };
    case "profil":
      return { title: "Edit Profil", subtitle: "Foto, nama, dan jabatan yang tampil di aplikasi" };
  }
}

function renderBody(t: DetailTarget) {
  switch (t.type) {
    case "pesanan":
      return <PesananContent id={t.id} />;
    case "komoditas":
      return <KomoditasContent id={t.id} />;
    case "kategori":
      return <KategoriContent nama={t.nama} />;
    case "kurir":
      return <KurirContent />;
    case "warta":
      return <WartaContent id={t.id} />;
    case "tambah-panen":
      return <TambahPanenForm initialId={t.komoditasId} />;
    case "rekap":
      return <RekapContent />;
    case "laporan":
      return <LaporanContent />;
    case "hotline":
      return <HotlineContent />;
    case "form-komoditas":
      return <KomoditasForm id={t.id} />;
    case "impor-ekspor":
      return <ImporEksporContent />;
    case "nota":
      return <NotaContent id={t.id} />;
    case "surat-jalan":
      return <SuratJalanContent />;
    case "transaksi":
      return <TransaksiContent id={t.id} />;
    case "rekening":
      return <RekeningForm />;
    case "laporan-kas":
      return <LaporanKasContent />;
    case "pratinjau-warga":
      return <PratinjauWargaContent data={t.data} />;
    case "piagam":
      return <PiagamContent />;
    case "profil":
      return <ProfilPenggunaForm />;
  }
}
