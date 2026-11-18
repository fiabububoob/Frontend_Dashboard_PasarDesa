"use client";

import { createContext, useCallback, useContext, useMemo, useEffect, type ReactNode } from "react";
import type { Komplain, PenyelesaianKomplain, ProfilPengguna, StatusPesanan } from "@/types";
import { ajukanKomplainPada, teruskanKeBumdes, terapkanPenyelesaian } from "@/lib/komplain";
import { useKasState } from "./slices/useKasState";
import { useKomoditasState } from "./slices/useKomoditasState";
import { usePengaturanState } from "./slices/usePengaturanState";
import { usePesananState } from "./slices/usePesananState";
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
type PengaturanState = ReturnType<typeof usePengaturanState>;

type DashboardData = KomoditasState &
  Omit<PesananState, "cariPesanan" | "ubahStatus" | "perbarui"> &
  KasState &
  PengaturanState & {
    siapkanPaket: (id: string) => void;
    setStatusPesanan: (id: string, status: StatusPesanan) => void;
    ajukanKomplain: (id: string, komplain: Komplain) => void;
    selesaikanKomplain: (id: string, pilihan: (PenyelesaianKomplain | undefined)[]) => void;
    teruskanKomplain: (id: string) => void;
  };

const Ctx = createContext<DashboardData | null>(null);

export function DashboardDataProvider({ children, profilAwal }: { children: ReactNode; profilAwal?: ProfilPengguna }) {
  const komoditas = useKomoditasState();
  const pesananSlice = usePesananState();
  const { cariPesanan, ubahStatus, perbarui } = pesananSlice;
  const kas = useKasState();
  const pengaturan = usePengaturanState(profilAwal);
  const { catatPenjualan } = kas;

  // Satu pintu untuk semua perubahan status pesanan (Ringkasan, modal, halaman Pesanan).
  const setStatusPesanan = useCallback(
    (id: string, status: StatusPesanan) => {
      const lama = cariPesanan(id);
      if (lama && status === "selesai" && lama.status !== "selesai") catatPenjualan(lama);
      ubahStatus(id, status);
    },
    [cariPesanan, ubahStatus, catatPenjualan],
  );

  // Keputusan D7: pesanan yang sudah tiba di pos lebih dari PELEPASAN_OTOMATIS_JAM dan belum diterima
  // pembeli diselesaikan otomatis → dana dilepas ke kas penjual. Dicek tiap menit.
  const sekarang = useSekarang();
  useEffect(() => {
    if (!sekarang) return;
    pesananJatuhTempo(pesananSlice.pesanan, sekarang).forEach((p) => setStatusPesanan(p.id, "selesai"));
  }, [sekarang, pesananSlice.pesanan, setStatusPesanan]);

  const siapkanPaket = useCallback((id: string) => setStatusPesanan(id, "siap-jemput"), [setStatusPesanan]);

  // Komplain pembeli (diajukan lewat app pembeli; di sini disimulasikan), keputusan penjual, atau teruskan ke BUMDes.
  const ajukanKomplain = useCallback((id: string, komplain: Komplain) => perbarui(id, (p) => ajukanKomplainPada(p, komplain)), [perbarui]);
  const teruskanKomplain = useCallback((id: string) => perbarui(id, teruskanKeBumdes), [perbarui]);

  // Aksi lintas domain: bila semua item di-refund pesanan selesai → penjualan bersih masuk kas.
  const selesaikanKomplain = useCallback(
    (id: string, pilihan: (PenyelesaianKomplain | undefined)[]) => {
      const lama = cariPesanan(id);
      if (!lama) return;
      const baru = terapkanPenyelesaian(lama, pilihan);
      if (baru === lama) return;
      perbarui(id, () => baru);
      if (baru.status === "selesai") catatPenjualan(baru);
    },
    [cariPesanan, perbarui, catatPenjualan],
  );

  const value = useMemo<DashboardData>(
    () => ({
      ...komoditas,
      pesanan: pesananSlice.pesanan,
      ...kas,
      ...pengaturan,
      siapkanPaket,
      setStatusPesanan,
      ajukanKomplain,
      selesaikanKomplain,
      teruskanKomplain,
    }),
    [komoditas, pesananSlice.pesanan, kas, pengaturan, siapkanPaket, setStatusPesanan, ajukanKomplain, selesaikanKomplain, teruskanKomplain],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDashboardData() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDashboardData harus dipakai di dalam <DashboardDataProvider>");
  return ctx;
}
