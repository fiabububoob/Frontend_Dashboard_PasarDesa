"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { KAS_OMSET_AWAL, KAS_REKENING, KAS_SALDO_AWAL, KAS_TRANSAKSI } from "@/lib/data/kas";
import { TANGGAL_DATA_DUMMY } from "@/lib/constants";
import { waktuWib } from "@/lib/format";
import { formatIdTransaksi, transaksiPencairan, transaksiPenjualan, type DraftTransaksi } from "@/lib/kas";
import type { JalurPencairan, Pesanan, Rekening, TransaksiKas } from "@/types";

const NOMOR_REFERENSI_AWAL = 8812;

// State kas: saldo, omset, rekening, dan riwayat mutasi.
export function useKasState() {
  const [transaksi, setTransaksi] = useState<TransaksiKas[]>(KAS_TRANSAKSI);
  const [saldoAktif, setSaldoAktif] = useState(KAS_SALDO_AWAL);
  const [omset, setOmset] = useState(KAS_OMSET_AWAL);
  const [rekening, setRekening] = useState<Rekening>(KAS_REKENING);

  // Ref: aksi membaca saldo terbaru tanpa efek samping di dalam updater setState.
  const saldoRef = useRef(saldoAktif);
  const urutan = useRef(KAS_TRANSAKSI.length);
  const sudahDibukukan = useRef(new Set<string>()); // pesanan yang penjualannya sudah tercatat
  useEffect(() => {
    saldoRef.current = saldoAktif;
  }, [saldoAktif]);

  const catat = useCallback((draft: DraftTransaksi) => {
    urutan.current += 1;
    const baru: TransaksiKas = { ...draft, id: formatIdTransaksi(urutan.current), tanggal: TANGGAL_DATA_DUMMY, waktu: waktuWib() };
    setTransaksi((daftar) => [baru, ...daftar]);
  }, []);

  // Pesanan selesai → escrow lepas: saldo aktif & omset naik, penjualan tercatat (sekali per pesanan).
  const catatPenjualan = useCallback(
    (p: Pesanan) => {
      if (sudahDibukukan.current.has(p.id)) return;
      sudahDibukukan.current.add(p.id);
      setSaldoAktif((s) => s + p.total);
      setOmset((o) => o + p.total);
      catat(transaksiPenjualan(p));
    },
    [catat],
  );

  // Mengembalikan false bila nominal tidak valid atau melebihi saldo (mis. saldo berubah saat dialog konfirmasi terbuka).
  const ajukanPencairan = useCallback(
    (nominal: number, jalur: JalurPencairan) => {
      if (nominal <= 0 || nominal > saldoRef.current) return false;
      saldoRef.current -= nominal;
      setSaldoAktif((s) => s - nominal);
      catat(transaksiPencairan(nominal, jalur, rekening, NOMOR_REFERENSI_AWAL + urutan.current));
      return true;
    },
    [catat, rekening],
  );

  // Rekening yang diubah harus diverifikasi ulang oleh BUMDes.
  const ubahRekening = useCallback((data: Pick<Rekening, "bank" | "atasNama" | "nomor">) => {
    setRekening((r) => ({ ...r, ...data, unit: data.bank === r.bank ? r.unit : "Cabang Utama", terverifikasi: false }));
  }, []);

  return useMemo(
    () => ({ transaksi, saldoAktif, omset, rekening, catatPenjualan, ajukanPencairan, ubahRekening }),
    [transaksi, saldoAktif, omset, rekening, catatPenjualan, ajukanPencairan, ubahRekening],
  );
}
