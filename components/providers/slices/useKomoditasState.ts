"use client";

import { useCallback, useMemo, useState } from "react";
import { KOMODITAS_LIST } from "@/lib/data/komoditas";
import { buatKomoditas, tambahStokKomoditas, ubahKomoditas as terapkanUbah } from "@/lib/komoditas";
import type { Komoditas, KomoditasBaru, KomoditasUbah } from "@/types";

// State & aksi komoditas. Aturan bisnisnya ada di lib/komoditas.ts; hook ini hanya menyimpan state.
export function useKomoditasState() {
  const [komoditas, setKomoditas] = useState<Komoditas[]>(KOMODITAS_LIST);

  const ubahItem = useCallback((id: string, fn: (k: Komoditas) => Komoditas) => {
    setKomoditas((daftar) => daftar.map((k) => (k.id === id ? fn(k) : k)));
  }, []);

  const tambahStok = useCallback((id: string, jumlah: number, catatan?: string) => ubahItem(id, (k) => tambahStokKomoditas(k, jumlah, catatan)), [ubahItem]);
  const ubahKomoditas = useCallback((id: string, data: KomoditasUbah) => ubahItem(id, (k) => terapkanUbah(k, data)), [ubahItem]);
  const setTampil = useCallback((id: string, tampil: boolean) => ubahItem(id, (k) => ({ ...k, tampil })), [ubahItem]);

  // Komoditas baru ditaruh paling atas supaya langsung terlihat.
  const tambahKomoditas = useCallback((data: KomoditasBaru) => setKomoditas((daftar) => [buatKomoditas(daftar, data), ...daftar]), []);

  // Hasil di-memo supaya konsumen context tidak render ulang kecuali datanya benar-benar berubah.
  return useMemo(() => ({ komoditas, tambahStok, tambahKomoditas, ubahKomoditas, setTampil }), [komoditas, tambahStok, tambahKomoditas, ubahKomoditas, setTampil]);
}
