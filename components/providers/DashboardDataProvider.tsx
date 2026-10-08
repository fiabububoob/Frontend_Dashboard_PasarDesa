"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import type { StatusKemas } from "@/types";
import { useKasState } from "./slices/useKasState";
import { useKomoditasState } from "./slices/useKomoditasState";
import { usePengaturanState } from "./slices/usePengaturanState";
import { usePesananState } from "./slices/usePesananState";

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
  Omit<PesananState, "cariPesanan" | "ubahStatus"> &
  KasState &
  PengaturanState & {
    siapkanPaket: (id: string) => void;
    setStatusPesanan: (id: string, status: StatusKemas) => void;
  };

const Ctx = createContext<DashboardData | null>(null);

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const komoditas = useKomoditasState();
  const pesananSlice = usePesananState();
  const { cariPesanan, ubahStatus } = pesananSlice;
  const kas = useKasState();
  const pengaturan = usePengaturanState();
  const { catatPenjualan } = kas;

  // Satu pintu untuk semua perubahan status pesanan (Ringkasan, modal, halaman Pesanan).
  const setStatusPesanan = useCallback(
    (id: string, status: StatusKemas) => {
      const lama = cariPesanan(id);
      if (lama && status === "selesai" && lama.status !== "selesai") catatPenjualan(lama);
      ubahStatus(id, status);
    },
    [cariPesanan, ubahStatus, catatPenjualan],
  );

  const siapkanPaket = useCallback((id: string) => setStatusPesanan(id, "siap-jemput"), [setStatusPesanan]);

  const value = useMemo<DashboardData>(
    () => ({
      ...komoditas,
      pesanan: pesananSlice.pesanan,
      ...kas,
      ...pengaturan,
      siapkanPaket,
      setStatusPesanan,
    }),
    [komoditas, pesananSlice.pesanan, kas, pengaturan, siapkanPaket, setStatusPesanan],  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDashboardData() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDashboardData harus dipakai di dalam <DashboardDataProvider>");
  return ctx;
}
