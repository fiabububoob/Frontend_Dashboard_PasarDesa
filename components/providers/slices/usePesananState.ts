"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { KURIR_DEFAULT, PESANAN_LIST } from "@/lib/data/pesanan";
import { butuhKurir, terapkanStatus } from "@/lib/pesanan";
import type { Pesanan, StatusPesanan } from "@/types";

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

  // Kurir ditugaskan BUMDes (otomatis per RW), bukan penjual. Di data dummy ini disimulasikan:
  // pesanan kurir-desa yang paketnya sudah siap otomatis mendapat kurir bawaan.
  const ubahStatus = useCallback((id: string, status: StatusPesanan) => {
    const sekarang = new Date();
    setPesanan((daftar) =>
      daftar.map((p) => {
        if (p.id !== id) return p;
        const diperbarui = terapkanStatus(p, status, sekarang);
        return { ...diperbarui, kurir: p.kurir ?? (butuhKurir(p, status) ? KURIR_DEFAULT : undefined) };
      }),
    );
  }, []);

  // Perubahan bebas atas satu pesanan (mis. komplain); aturan perubahannya ada di lib/*.
  const perbarui = useCallback((id: string, ubah: (p: Pesanan) => Pesanan) => {
    setPesanan((daftar) => daftar.map((p) => (p.id === id ? ubah(p) : p)));
  }, []);

  return useMemo(() => ({ pesanan, cariPesanan, ubahStatus, perbarui }), [pesanan, cariPesanan, ubahStatus, perbarui]);
}
