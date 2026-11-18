"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ambilAduan, ubahAduanServer } from "@/lib/actions/aduan";
import { aduanDariApi } from "@/lib/aduanApi";
import type { Aduan, StatusAduan } from "@/types";

export type StatusMuatAduan = "memuat" | "siap" | "gagal";

// Tiket aduan umum dari pembeli, dimuat dari Express API (/admin/complaints). Tidak ada data contoh:
// bila server tidak bisa dihubungi, daftar kosong dan `statusAduan` = "gagal" (halaman menampilkan banner).
export function useAduanState() {
  const [aduan, setAduan] = useState<Aduan[]>([]);
  const [statusAduan, setStatus] = useState<StatusMuatAduan>("memuat");
  const [galatAduan, setGalat] = useState<string | null>(null);
  const ref = useRef(aduan);
  useEffect(() => {
    ref.current = aduan;
  }, [aduan]);

  const muatAduan = useCallback(async () => {
    setStatus("memuat");
    const hasil = await ambilAduan();
    if (hasil.ok) {
      setAduan(hasil.data.map(aduanDariApi));
      setGalat(null);
      setStatus("siap");
      return;
    }
    setGalat(hasil.message);
    setStatus("gagal");
  }, []);

  useEffect(() => {
    void muatAduan();
  }, [muatAduan]);

  // Melempar Error berisi pesan server (mis. status tidak boleh mundur); pemanggil menampilkannya.
  const ubahAduan = useCallback(async (id: string, perubahan: { status?: StatusAduan; balasan?: string }) => {
    const lama = ref.current.find((a) => a.id === id);
    if (!lama) throw new Error("Aduan tidak ditemukan.");
    const hasil = await ubahAduanServer(lama.idServer, perubahan);
    if (!hasil.ok) throw new Error(hasil.message);
    const baru = aduanDariApi(hasil.data);
    setAduan((daftar) => daftar.map((a) => (a.id === id ? baru : a)));
  }, []);

  return useMemo(() => ({ aduan, statusAduan, galatAduan, muatAduan, ubahAduan }), [aduan, statusAduan, galatAduan, muatAduan, ubahAduan]);
}
