"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ambilPesanan, simpanPesanan } from "@/lib/actions/pesanan";
import { KURIR_DEFAULT, PESANAN_LIST } from "@/lib/data/pesanan";
import { pesananDariApi, perubahanKeApi } from "@/lib/pesananApi";
import { butuhKurir, terapkanStatus } from "@/lib/pesanan";
import type { Pesanan, StatusPesanan } from "@/types";

const INTERVAL_SEGARKAN_MS = 15_000;

export type StatusMuatPesanan = "memuat" | "siap" | "gagal";

// State pesanan, disimpan di Express API (/admin/orders) lewat server action. Aksi bersifat async dan
// MELEMPAR Error berisi pesan dari server bila ditolak (mis. loncat status), supaya pemanggil bisa menampilkannya.
// Bila server tidak bisa dihubungi, data contoh ditampilkan dan `statusPesanan` = "gagal".
// `cariPesanan` membaca nilai terbaru lewat ref (aksi lintas-domain tidak perlu efek samping di updater setState).
export function usePesananState() {
  const [pesanan, setPesanan] = useState<Pesanan[]>([]);
  const [statusPesanan, setStatus] = useState<StatusMuatPesanan>("memuat");
  const [galatPesanan, setGalat] = useState<string | null>(null);
  const ref = useRef(pesanan);
  useEffect(() => {
    ref.current = pesanan;
  }, [pesanan]);

  // `senyap` = penyegaran latar belakang: tanpa status "memuat", dan bila gagal data yang sudah tampil dipertahankan.
  const muatPesanan = useCallback(async (senyap = false) => {
    if (!senyap) setStatus("memuat");
    const hasil = await ambilPesanan();
    if (hasil.ok) {
      setPesanan(hasil.data.map(pesananDariApi));
      setGalat(null);
      setStatus("siap");
      return;
    }
    if (senyap) return;
    setPesanan(PESANAN_LIST);
    setGalat(hasil.message);
    setStatus("gagal");
  }, []);

  useEffect(() => {
    void muatPesanan();
  }, [muatPesanan]);

  // Pesanan baru dari aplikasi pembeli, konfirmasi bayar Midtrans, dan "Pesanan Diterima" terjadi di luar dashboard,
  // jadi daftar disegarkan berkala (hanya saat tab terlihat) dan saat tab kembali difokuskan.
  useEffect(() => {
    const segarkan = () => {
      if (document.visibilityState === "visible") void muatPesanan(true);
    };
    const timer = window.setInterval(segarkan, INTERVAL_SEGARKAN_MS);
    document.addEventListener("visibilitychange", segarkan);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", segarkan);
    };
  }, [muatPesanan]);

  const cariPesanan = useCallback((id: string) => ref.current.find((p) => p.id === id), []);

  // Kirim hasil perubahan ke server, lalu ganti item dengan baris dari server (sumber kebenaran).
  const simpanPerubahan = useCallback(
    async (id: string, baru: Pesanan) => {
      if (statusPesanan === "gagal") throw new Error("Server tidak dapat dihubungi. Perubahan belum bisa disimpan.");
      const hasil = await simpanPesanan(id, perubahanKeApi(baru));
      if (!hasil.ok) throw new Error(hasil.message);
      const tersimpan = pesananDariApi(hasil.data);
      setPesanan((daftar) => daftar.map((p) => (p.id === id ? tersimpan : p)));
    },
    [statusPesanan],
  );

  // Kurir ditugaskan BUMDes (otomatis per RW), bukan penjual. Di sini disimulasikan: pesanan kurir-desa
  // yang paketnya sudah siap otomatis mendapat kurir bawaan.
  const ubahStatus = useCallback(
    async (id: string, status: StatusPesanan) => {
      const lama = ref.current.find((p) => p.id === id);
      if (!lama) throw new Error("Pesanan tidak ditemukan.");
      const diperbarui = terapkanStatus(lama, status, new Date());
      await simpanPerubahan(id, { ...diperbarui, kurir: lama.kurir ?? (butuhKurir(lama, status) ? KURIR_DEFAULT : undefined) });
    },
    [simpanPerubahan],
  );

  // Perubahan bebas atas satu pesanan (mis. komplain); aturan perubahannya ada di lib/*.
  const perbarui = useCallback(
    async (id: string, ubah: (p: Pesanan) => Pesanan) => {
      const lama = ref.current.find((p) => p.id === id);
      if (!lama) throw new Error("Pesanan tidak ditemukan.");
      const baru = ubah(lama);
      if (baru === lama) return;
      await simpanPerubahan(id, baru);
    },
    [simpanPerubahan],
  );

  return useMemo(
    () => ({ pesanan, statusPesanan, galatPesanan, muatPesanan, cariPesanan, ubahStatus, perbarui }),
    [pesanan, statusPesanan, galatPesanan, muatPesanan, cariPesanan, ubahStatus, perbarui],
  );
}
