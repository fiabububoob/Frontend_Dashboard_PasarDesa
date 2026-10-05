"use client";

import { Eye, ShieldCheck, LifeBuoy, MessageSquareText, Download } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useStatusLapak } from "@/components/providers/useStatusLapak";
import { useDetail } from "@/components/detail/DetailProvider";
import { LOKASI_DROP_POINT } from "@/lib/data/pengaturan";
import { usePengaturanForm } from "./PengaturanForm";

// Pratinjau langsung: membaca DRAFT, jadi berubah saat nama, komoditas unggulan,
// jadwal, atau drop-point diedit — sebelum disimpan.
export function LivePreviewCard() {
  const { draft } = usePengaturanForm();
  const { open } = useDetail();
  const { status } = useStatusLapak(draft);

  const lokasi = LOKASI_DROP_POINT.find((l) => l.id === draft.dropPointId) ?? LOKASI_DROP_POINT[0];

  return (
    <Card className="p-5">
      <p className="flex items-center justify-between text-sm font-semibold text-ink-900">
        Tampilan di Aplikasi Warga
        <Badge tone="info">Live Preview</Badge>
      </p>

      <div className={`relative mt-3 h-28 overflow-hidden rounded-lg bg-gradient-to-br ${status?.buka === false ? "from-ink-400 to-ink-200" : "from-brand-700 to-brand-500"}`}>
        {status && (
          <>
            <span className={`absolute left-2 top-2 rounded bg-white/90 px-2 py-0.5 text-[10px] font-semibold ${status.buka ? "text-brand-700" : "text-danger-600"}`}>
              ● {status.label}
            </span>
            <span className="absolute bottom-2 left-2 text-[10px] font-medium text-white/90">{status.keterangan}</span>
          </>
        )}
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-ink-900">
        {draft.namaLapak || "Nama lapak belum diisi"}
      </p>
      <p className="mt-1 text-xs text-ink-500">{draft.komoditasUnggulan.length > 0 ? draft.komoditasUnggulan.join(" · ") : "Belum ada komoditas unggulan"}</p>

      <div className="mt-2 flex items-center gap-1.5 text-xs text-ink-500">
        <span>📍 {lokasi.nama}</span>
      </div>
      <p className="text-xs text-brand-600">Subsidi Ongkir Kurir Desa Rp0</p>

      <Button variant="secondary" size="sm" className="mt-3 w-full" onClick={() => open({ type: "pratinjau-warga", data: draft })}>
        <Eye className="h-3.5 w-3.5" />
        Lihat Seperti Pembeli Warga
      </Button>
    </Card>
  );
}

export function JaminanTransaksiCard() {
  const { open } = useDetail();
  return (
    <Card className="p-5">
      <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
        <ShieldCheck className="h-4 w-4 text-brand-600" />
        Jaminan Transaksi BUMDes
      </p>
      <p className="mt-1 text-xs text-ink-400">SK Direksi BUMDes No. 14/BUMD/2022</p>
      <p className="mt-2 text-xs text-ink-500">Timbangan terkalibrasi dan pencairan dana otomatis ke rekening — dijamin oleh kas desa.</p>
      <dl className="mt-3 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <dt className="text-ink-500">Sertifikasi Tera Timbangan</dt>
          <dd className="font-medium text-brand-600">Disperindag Sah</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-ink-500">Status Kurir Mitra</dt>
          <dd className="font-medium text-brand-600">2 Armada Aktif</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-ink-500">Proteksi Gagal Panen</dt>
          <dd className="font-medium text-brand-600">Asuransi Tani Desa</dd>
        </div>
      </dl>
      <button type="button" onClick={() => open({ type: "piagam" })} className="mt-3 flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline">
        <Download className="h-3 w-3" />
        Unduh Piagam Mitra BUMDes (.PDF)
      </button>
    </Card>
  );
}

export function PusatBantuanCard() {
  const { open } = useDetail();
  return (
    <Card className="p-5">
      <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
        <LifeBuoy className="h-4 w-4 text-brand-600" />
        Pusat Bantuan Poktan Sukorejo
      </p>
      <p className="mt-2 text-xs text-ink-500">Ada kendala teknis atau operasional? Hubungi pendamping BUMDes:</p>
      <dl className="mt-3 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <dt className="text-ink-500">Call Center Balai Desa</dt>
          <dd>
            <a href="tel:03418892019" className="font-medium text-ink-900 hover:text-brand-700 hover:underline">
              (0341) 8892-019
            </a>
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-ink-500">Koordinator Logistik</dt>
          <dd>
            <button type="button" onClick={() => open({ type: "kurir" })} className="font-medium text-ink-900 hover:text-brand-700 hover:underline">
              Mas Slamet (Kurir 01)
            </button>
          </dd>
        </div>
      </dl>
      <Button variant="primary" size="sm" className="mt-3 w-full" onClick={() => open({ type: "hotline" })}>
        <MessageSquareText className="h-3.5 w-3.5" />
        Hubungi Pengurus BUMDes Sukorejo
      </Button>
    </Card>
  );
}
