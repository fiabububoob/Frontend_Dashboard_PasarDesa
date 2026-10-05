"use client";

import { formatTanggal } from "@/lib/format";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { NOMOR_REGISTRASI } from "@/lib/data/pengaturan";
import { PrintActions } from "./PrintActions";

// "Unduh Piagam Mitra BUMDes (.PDF)": pratinjau piagam yang dicetak lewat dialog
// cetak browser — pilih "Simpan sebagai PDF" untuk mendapatkan file PDF.
export function PiagamContent() {
  const { pengaturan } = useDashboardData();
  const tanggal = formatTanggal(new Date());

  return (
    <div className="space-y-4 text-sm">
      <div className="print-area">
        <div className="rounded-xl border-4 border-double border-brand-600 p-8 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-brand-600">BUMDes Sukorejo · Kab. Malang</p>
          <p className="mt-3 font-display text-3xl font-bold text-ink-900">PIAGAM MITRA RESMI</p>
          <p className="mt-6 text-xs text-ink-500">Diberikan kepada</p>
          <p className="mt-1 font-display text-2xl font-bold text-brand-700">{pengaturan.namaLapak}</p>
          <p className="mt-1 text-xs text-ink-500">No. Registrasi {NOMOR_REGISTRASI}</p>
          <p className="mx-auto mt-6 max-w-md text-sm text-ink-700">
            sebagai Mitra Resmi BUMDes dalam penjualan hasil tani warga: timbangan tera Disperindag, pencairan dana otomatis ke rekening kelompok,
            dan pengiriman lewat kurir desa.
          </p>
          <div className="mt-8 flex items-end justify-between text-xs text-ink-500">
            <div className="text-left">
              <p>SK Direksi BUMDes</p>
              <p className="font-medium text-ink-900">No. 14/BUMD/2022</p>
            </div>
            <div className="text-right">
              <p>Sukorejo, {tanggal}</p>
              <div className="mt-8 w-40 border-b border-ink-400" />
              <p className="mt-1">Direktur BUMDes</p>
            </div>
          </div>
        </div>
      </div>

      <PrintActions cetakLabel="Cetak / Simpan sebagai PDF" />
    </div>
  );
}
