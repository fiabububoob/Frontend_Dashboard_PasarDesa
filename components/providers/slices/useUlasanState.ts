"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ambilUlasan } from "@/lib/actions/ulasan";
import { normalkanUlasan, type DataUlasanApi } from "@/lib/ulasanApi";

export type StatusMuatUlasan = "memuat" | "siap" | "gagal";

// Ulasan & rating pembeli dari Express API (/admin/reviews). Dipakai halaman Ulasan dan widget di Ringkasan.
export function useUlasanState() {
  const [ulasan, setUlasan] = useState<DataUlasanApi | null>(null);
  const [statusUlasan, setStatus] = useState<StatusMuatUlasan>("memuat");
  const [galatUlasan, setGalat] = useState<string | null>(null);

  const muatUlasan = useCallback(async () => {
    setStatus("memuat");
    const hasil = await ambilUlasan();
    if (hasil.ok) {
      setUlasan(normalkanUlasan(hasil.data));
      setGalat(null);
      setStatus("siap");
      return;
    }
    setGalat(hasil.message);
    setStatus("gagal");
  }, []);

  useEffect(() => {
    void muatUlasan();
  }, [muatUlasan]);

  return useMemo(() => ({ ulasan, statusUlasan, galatUlasan, muatUlasan }), [ulasan, statusUlasan, galatUlasan, muatUlasan]);
}
