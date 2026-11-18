"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ajukanPenarikan, ambilDataKas } from "@/lib/actions/kas";
import { mutasiDariApi } from "@/lib/kasApi";
import { KAS_OMSET_AWAL, KAS_REKENING, KAS_SALDO_AWAL, KAS_TRANSAKSI } from "@/lib/data/kas";
import type { JalurPencairan, Rekening, TransaksiKas } from "@/types";

export type StatusMuatKas = "memuat" | "siap" | "gagal";

// State kas: saldo, omset, rekening, dan riwayat mutasi.
// Saldo, omset, dan mutasi diambil dari Express API (/cash/summary + /cash). Bila server tidak bisa
// dihubungi, data contoh ditampilkan dan `statusKas` = "gagal" supaya UI bisa memberi tahu pengguna.
export function useKasState() {
  const [transaksi, setTransaksi] = useState<TransaksiKas[]>([]);
  const [saldoAktif, setSaldoAktif] = useState(0);
  const [omset, setOmset] = useState(0);
  const [statusKas, setStatusKas] = useState<StatusMuatKas>("memuat");
  const [galatKas, setGalatKas] = useState<string | null>(null);
  const [rekening, setRekening] = useState<Rekening>(KAS_REKENING);


  const muatKas = useCallback(async () => {
    setStatusKas("memuat");
    const hasil = await ambilDataKas();
    if (hasil.ok) {
      const { ringkasan, mutasi } = hasil.data;
      setSaldoAktif(ringkasan.saldoAktif);
      setOmset(ringkasan.omsetBulanIni);
      setTransaksi(mutasi.map(mutasiDariApi));
      setGalatKas(null);
      setStatusKas("siap");
      return;
    }
    // Server tidak tersedia: tampilkan data contoh agar halaman tetap bisa dipakai, dan beri tahu pengguna.
    setTransaksi(KAS_TRANSAKSI);
    setSaldoAktif(KAS_SALDO_AWAL);
    setOmset(KAS_OMSET_AWAL);
    setGalatKas(hasil.message);
    setStatusKas("gagal");
  }, []);

  useEffect(() => {
    void muatKas();
  }, [muatKas]);

  // Penarikan diproses server (saldo dicek di sana, dengan kunci agar dua penarikan bersamaan tidak lolos
  // bersamaan). Melempar Error berisi pesan dari server bila ditolak; sukses → data kas dimuat ulang.
  const ajukanPencairan = useCallback(
    async (nominal: number, jalur: JalurPencairan) => {
      if (statusKas === "gagal") throw new Error("Server tidak dapat dihubungi. Penarikan belum bisa diproses.");
      const hasil = await ajukanPenarikan(nominal, jalur);
      if (!hasil.ok) throw new Error(hasil.message);
      await muatKas();
    },
    [statusKas, muatKas],
  );

  // Rekening yang diubah harus diverifikasi ulang oleh BUMDes.
  const ubahRekening = useCallback((data: Pick<Rekening, "bank" | "atasNama" | "nomor">) => {
    setRekening((r) => ({ ...r, ...data, unit: data.bank === r.bank ? r.unit : "Cabang Utama", terverifikasi: false }));
  }, []);

  return useMemo(
    () => ({ transaksi, saldoAktif, omset, rekening, statusKas, galatKas, muatKas, ajukanPencairan, ubahRekening }),
    [transaksi, saldoAktif, omset, rekening, statusKas, galatKas, muatKas, ajukanPencairan, ubahRekening],
  );
}
