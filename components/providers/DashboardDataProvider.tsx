"use client";

import { createContext, useCallback, useContext, useMemo, useEffect, useRef, type ReactNode } from "react";
import type { Komplain, PenyelesaianKomplain, ProfilPengguna, StatusPesanan } from "@/types";
import { ajukanKomplainPada, teruskanKeBumdes, terapkanPenyelesaian } from "@/lib/komplain";
import { useKasState } from "./slices/useKasState";
import { useKomoditasState } from "./slices/useKomoditasState";
import { usePengaturanState } from "./slices/usePengaturanState";
import { usePesananState } from "./slices/usePesananState";
import { useAduanState } from "./slices/useAduanState";
import { useUlasanState } from "./slices/useUlasanState";
import { useSekarang } from "@/lib/hooks/useSekarang";
import { pesananJatuhTempo } from "@/lib/pesanan";

// Satu sumber data "hidup" untuk Ringkasan, Komoditas, Pesanan, Kas, Pengaturan,
// modal detail, dan pencarian. State tiap domain ada di ./slices/*; provider ini
// hanya menyatukannya dan menjalankan aksi LINTAS-domain (mis. pesanan selesai →
// penjualan masuk kas). Data awal dari lib/data/* (dummy); perubahan hanya di
// memori dan hilang saat refresh. Ganti isi aksi di slice dengan panggilan API
// saat backend siap — komponen tetap memakai useDashboardData().
type KomoditasState = ReturnType<typeof useKomoditasState>;
type PesananState = ReturnType<typeof usePesananState>;
type KasState = ReturnType<typeof useKasState>;
type AduanState = ReturnType<typeof useAduanState>;
type UlasanState = ReturnType<typeof useUlasanState>;
type PengaturanState = ReturnType<typeof usePengaturanState>;

type DashboardData = KomoditasState &
  Omit<PesananState, "pesanan" | "cariPesanan" | "ubahStatus" | "perbarui"> & { pesanan: PesananState["pesanan"] } &
  KasState &
  AduanState &
  UlasanState &
  PengaturanState & {
    siapkanPaket: (id: string) => Promise<void>;
    setStatusPesanan: (id: string, status: StatusPesanan) => Promise<void>;
    ajukanKomplain: (id: string, komplain: Komplain) => Promise<void>;
    selesaikanKomplain: (id: string, pilihan: (PenyelesaianKomplain | undefined)[]) => Promise<void>;
    teruskanKomplain: (id: string) => Promise<void>;
  };

const Ctx = createContext<DashboardData | null>(null);

export function DashboardDataProvider({ children, profilAwal }: { children: ReactNode; profilAwal?: ProfilPengguna }) {
  const komoditas = useKomoditasState();
  const pesananSlice = usePesananState();
  const { cariPesanan, ubahStatus, perbarui } = pesananSlice;
  const kas = useKasState();
  const aduanSlice = useAduanState();
  const ulasanSlice = useUlasanState();
  const pengaturan = usePengaturanState(profilAwal);
  const { muatKas } = kas;

  // Satu pintu untuk semua perubahan status pesanan (Ringkasan, panel detail, halaman Pesanan).
  // Saat pesanan selesai, server mencatat penjualan bersih ke kas → data kas dimuat ulang.
  // Melempar Error berisi pesan server bila ditolak; pemanggil yang menampilkannya.
  const setStatusPesanan = useCallback(
    async (id: string, status: StatusPesanan) => {
      const lama = cariPesanan(id);
      await ubahStatus(id, status);
      if (lama && status === "selesai" && lama.status !== "selesai") void muatKas();
    },
    [cariPesanan, ubahStatus, muatKas],
  );

  // Keputusan D7: pesanan yang sudah tiba di pos lebih dari PELEPASAN_OTOMATIS_JAM dan belum diterima
  // pembeli diselesaikan otomatis → dana dilepas ke kas penjual. Dicek tiap menit. `sedangDiproses`
  // mencegah permintaan ganda untuk pesanan yang sama; bila gagal, dicoba lagi pada pengecekan berikutnya.
  const sekarang = useSekarang();
  const sedangDiproses = useRef(new Set<string>());
  useEffect(() => {
    if (!sekarang || pesananSlice.statusPesanan !== "siap") return;
    pesananJatuhTempo(pesananSlice.pesanan, sekarang).forEach((p) => {
      if (sedangDiproses.current.has(p.id)) return;
      sedangDiproses.current.add(p.id);
      setStatusPesanan(p.id, "selesai")
        .catch((e) => console.warn(`Pelepasan otomatis ${p.id} gagal:`, e))
        .finally(() => sedangDiproses.current.delete(p.id));
    });
  }, [sekarang, pesananSlice.pesanan, pesananSlice.statusPesanan, setStatusPesanan]);

  const siapkanPaket = useCallback((id: string) => setStatusPesanan(id, "siap-jemput"), [setStatusPesanan]);

  // Komplain pembeli (diajukan lewat app pembeli; di sini disimulasikan), keputusan penjual, atau teruskan ke BUMDes.
  const ajukanKomplain = useCallback((id: string, komplain: Komplain) => perbarui(id, (p) => ajukanKomplainPada(p, komplain)), [perbarui]);
  const teruskanKomplain = useCallback((id: string) => perbarui(id, teruskanKeBumdes), [perbarui]);

  // Aksi lintas domain: bila semua item di-refund pesanan selesai → server mencatat penjualan bersih (bila ada) ke kas.
  const selesaikanKomplain = useCallback(
    async (id: string, pilihan: (PenyelesaianKomplain | undefined)[]) => {
      const lama = cariPesanan(id);
      if (!lama) return;
      const baru = terapkanPenyelesaian(lama, pilihan);
      if (baru === lama) return;
      await perbarui(id, () => baru);
      if (baru.status === "selesai") void muatKas();
    },
    [cariPesanan, perbarui, muatKas],
  );

  const value = useMemo<DashboardData>(
    () => ({
      ...komoditas,
      pesanan: pesananSlice.pesanan,
      statusPesanan: pesananSlice.statusPesanan,
      galatPesanan: pesananSlice.galatPesanan,
      muatPesanan: pesananSlice.muatPesanan,
      ...kas,
      ...aduanSlice,
      ...ulasanSlice,
      ...pengaturan,
      siapkanPaket,
      setStatusPesanan,
      ajukanKomplain,
      selesaikanKomplain,
      teruskanKomplain,
    }),
    [komoditas, pesananSlice.pesanan, pesananSlice.statusPesanan, pesananSlice.galatPesanan, pesananSlice.muatPesanan, kas, pengaturan, aduanSlice, ulasanSlice, siapkanPaket, setStatusPesanan, ajukanKomplain, selesaikanKomplain, teruskanKomplain],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDashboardData() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDashboardData harus dipakai di dalam <DashboardDataProvider>");
  return ctx;
}
