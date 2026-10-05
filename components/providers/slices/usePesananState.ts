"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { KURIR_DEFAULT, PESANAN_LIST } from "@/lib/data/pesanan";
import type { Pesanan, StatusKemas } from "@/types";

// State pesanan. `cariPesanan` membaca nilai terbaru lewat ref, sehingga aksi
// lintas-domain (mis. mencatat penjualan ke kas) tidak perlu efek samping di
// dalam updater setState (updater harus murni; di dev React menjalankannya dua kali).
export function usePesananState() {
  const [pesanan, setPesanan] = useState<Pesanan[]>(PESANAN_LIST);
  const ref = useRef(pesanan);
  useEffect(() => {
    ref.current = pesanan;
  }, [pesanan]);

  const cariPesanan = useCallback((id: string) => ref.current.find((p) => p.id === id), []);

  // Pesanan yang sudah melewati tahap pengemasan otomatis mendapat kurir bila belum ada.
  const ubahStatus = useCallback((id: string, status: StatusKemas) => {
    setPesanan((daftar) =>
      daftar.map((p) => {
        if (p.id !== id) return p;
        const kurir = p.kurir ?? (status === "perlu-dikemas" ? undefined : KURIR_DEFAULT);
        return { ...p, status, kurir };
      }),
    );
  }, []);

  const tugaskanKurir = useCallback((id: string) => {
    setPesanan((daftar) => daftar.map((p) => (p.id === id ? { ...p, kurir: KURIR_DEFAULT } : p)));
  }, []);

  return useMemo(() => ({ pesanan, cariPesanan, ubahStatus, tugaskanKurir }), [pesanan, cariPesanan, ubahStatus, tugaskanKurir]);
}
