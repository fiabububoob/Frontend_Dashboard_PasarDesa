"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { KOMODITAS_LIST } from "@/lib/data/komoditas";
import { ambilKomoditas, hapusKomoditasServer, simpanKomoditas, ubahTampilKomoditas } from "@/lib/actions/komoditas";
import { komoditasDariApi } from "@/lib/komoditasApi";
import { buatKomoditas, tambahStokKomoditas, ubahKomoditas as terapkanUbah } from "@/lib/komoditas";
import type { Komoditas, KomoditasBaru, KomoditasUbah } from "@/types";

export type StatusMuatKomoditas = "memuat" | "siap" | "gagal";

// State & aksi komoditas. Aturan bisnisnya ada di lib/komoditas.ts; data disimpan di Express API
// (/products) lewat server action. Bila server tidak bisa dihubungi, data contoh ditampilkan dan
// `statusKomoditas` = "gagal"; perubahan ditolak dengan pesan yang jelas (tidak disimpan diam-diam di memori).
export function useKomoditasState() {
  const [komoditas, setKomoditas] = useState<Komoditas[]>([]);
  const [statusKomoditas, setStatus] = useState<StatusMuatKomoditas>("memuat");
  const [galatKomoditas, setGalat] = useState<string | null>(null);

  // Ref: aksi membaca daftar terbaru tanpa harus berganti identitas tiap kali data berubah.
  const daftarRef = useRef(komoditas);
  useEffect(() => {
    daftarRef.current = komoditas;
  }, [komoditas]);

  const muatKomoditas = useCallback(async () => {
    setStatus("memuat");
    const hasil = await ambilKomoditas();
    if (hasil.ok) {
      setKomoditas(hasil.data.map(komoditasDariApi));
      setGalat(null);
      setStatus("siap");
      return;
    }
    setKomoditas(KOMODITAS_LIST);
    setGalat(hasil.message);
    setStatus("gagal");
  }, []);

  useEffect(() => {
    void muatKomoditas();
  }, [muatKomoditas]);

  const pastikanTerhubung = useCallback(() => {
    if (statusKomoditas === "gagal") throw new Error("Server tidak dapat dihubungi. Perubahan belum bisa disimpan.");
  }, [statusKomoditas]);

  // Menyimpan ke server, lalu mengganti item di daftar dengan baris dari server (id & foto resmi).
  const simpan = useCallback(async (lengkap: Komoditas, idServer?: string) => {
    const hasil = await simpanKomoditas(lengkap, idServer);
    if (!hasil.ok) throw new Error(hasil.message);
    const tersimpan = komoditasDariApi(hasil.data);
    // Perbarui ref sekarang juga (bukan menunggu render): impor CSV menambah banyak item beruntun dan
    // butuh daftar terbaru untuk membuat SKU berikutnya; kalau tidak, SKU kembar ditolak database.
    daftarRef.current = idServer ? daftarRef.current.map((k) => (k.id === idServer ? tersimpan : k)) : [tersimpan, ...daftarRef.current];
    setKomoditas(daftarRef.current);
    return tersimpan;
  }, []);

  const ubahItem = useCallback(
    async (id: string, fn: (k: Komoditas) => Komoditas) => {
      pastikanTerhubung();
      const lama = daftarRef.current.find((k) => k.id === id);
      if (!lama) throw new Error("Komoditas tidak ditemukan.");
      await simpan(fn(lama), id);
    },
    [pastikanTerhubung, simpan],
  );

  const tambahStok = useCallback((id: string, jumlah: number, catatan?: string) => ubahItem(id, (k) => tambahStokKomoditas(k, jumlah, catatan)), [ubahItem]);
  const ubahKomoditas = useCallback((id: string, data: KomoditasUbah) => ubahItem(id, (k) => terapkanUbah(k, data)), [ubahItem]);

  const setTampil = useCallback(
    async (id: string, tampil: boolean) => {
      pastikanTerhubung();
      const hasil = await ubahTampilKomoditas(id, tampil);
      if (!hasil.ok) throw new Error(hasil.message);
      setKomoditas((daftar) => daftar.map((k) => (k.id === id ? { ...k, tampil } : k)));
    },
    [pastikanTerhubung],
  );

  const hapusKomoditas = useCallback(
    async (id: string) => {
      pastikanTerhubung();
      const hasil = await hapusKomoditasServer(id);
      if (!hasil.ok) throw new Error(hasil.message);
      daftarRef.current = daftarRef.current.filter((k) => k.id !== id);
      setKomoditas(daftarRef.current);
    },
    [pastikanTerhubung],
  );

  const tambahKomoditas = useCallback(
    async (data: KomoditasBaru) => {
      pastikanTerhubung();
      await simpan(buatKomoditas(daftarRef.current, data));
    },
    [pastikanTerhubung, simpan],
  );

  // Hasil di-memo supaya konsumen context tidak render ulang kecuali datanya benar-benar berubah.
  return useMemo(
    () => ({ komoditas, statusKomoditas, galatKomoditas, muatKomoditas, tambahStok, tambahKomoditas, ubahKomoditas, setTampil, hapusKomoditas }),
    [komoditas, statusKomoditas, galatKomoditas, muatKomoditas, tambahStok, tambahKomoditas, ubahKomoditas, setTampil, hapusKomoditas],
  );
}
