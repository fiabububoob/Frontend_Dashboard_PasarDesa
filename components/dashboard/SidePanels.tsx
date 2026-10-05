"use client";

import Link from "next/link";
import { Bike, AlertTriangle, Megaphone, Phone, Plus, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { useDetail } from "@/components/detail/DetailProvider";
import { KURIR_AKTIF, WARTA_LIST } from "@/lib/data/ringkasan";

export function LogistikKurirCard() {
  const { open } = useDetail();
  const k = KURIR_AKTIF;

  return (
    <Card className="p-5">
      <button
        type="button"
        onClick={() => open({ type: "kurir" })}
        className="flex w-full items-center gap-2 text-left text-sm font-semibold text-ink-900 hover:text-brand-700"
      >
        <Bike className="h-4 w-4 text-brand-600" />
        Logistik BUMDes · Jadwal Penjemputan Kurir
      </button>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">{k.inisial}</div>
        <div>
          <p className="text-sm font-medium text-ink-900">{k.nama}</p>
          <p className="text-xs text-ink-500">{k.armada}</p>
        </div>
      </div>

      <dl className="mt-4 space-y-2 text-xs">
        <div>
          <dt className="text-ink-500">Rute Pengantaran</dt>
          <dd className="font-medium text-ink-900">{k.rute}</dd>
        </div>
        <div>
          <dt className="text-ink-500">Estimasi Tiba di Lumbung</dt>
          <dd className="font-medium text-warn-600">{k.estimasi}</dd>
        </div>
      </dl>

      <Button variant="secondary" className="mt-4 w-full" onClick={() => open({ type: "kurir" })}>
        <Phone className="h-3.5 w-3.5" />
        Hubungi Mas Slamet
      </Button>
    </Card>
  );
}

export function StokKritisCard() {
  const { komoditas } = useDashboardData();
  const { open } = useDetail();
  const kritis = komoditas.filter((k) => k.statusStok === "kritis");

  return (
    <Card className={kritis.length > 0 ? "border-danger-50 p-5" : "p-5"}>
      <p className={`flex items-center gap-2 text-sm font-semibold ${kritis.length > 0 ? "text-danger-600" : "text-brand-700"}`}>
        {kritis.length > 0 ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
        Perhatian Lumbung · Ketersediaan Stok Kritis
      </p>
      <p className="mt-2 text-xs text-ink-500">
        {kritis.length > 0
          ? `${kritis.length} komoditas panen hampir habis. Tambahkan pasokan agar lapak tidak otomatis dinonaktifkan di aplikasi pembeli desa.`
          : "Semua stok komoditas dalam kondisi aman."}
      </p>

      {kritis.length > 0 && (
        <div className="mt-4 space-y-2">
          {kritis.map((k) => (
            <div key={k.id} className="flex items-center justify-between gap-2 rounded-lg bg-danger-50 px-3 py-2">
              <button type="button" onClick={() => open({ type: "komoditas", id: k.id })} className="min-w-0 text-left">
                <span className="block truncate text-sm font-medium text-ink-900 hover:underline">{k.nama}</span>
                <span className="block text-xs text-danger-600">
                  Tersisa {k.stok} {k.satuan}
                  {k.tag === "Permintaan Tinggi" ? " (Permintaan Tinggi)" : ""}
                </span>
              </button>
              <Button variant="secondary" size="sm" className="shrink-0" onClick={() => open({ type: "tambah-panen", komoditasId: k.id })}>
                <Plus className="h-3 w-3" />
                Tambah
              </Button>
            </div>
          ))}
        </div>
      )}

      <Link
        href="/komoditas"
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink-700 transition-colors duration-feedback ease-enter hover:bg-surface-muted"
      >
        Kelola Semua Stok
      </Link>
    </Card>
  );
}

export function WartaCard() {
  const { open } = useDetail();
  const [utama, ...lain] = WARTA_LIST;

  return (
    <Card className="p-5">
      <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
        <Megaphone className="h-4 w-4 text-brand-600" />
        Pengumuman BUMDes
      </p>

      <button
        type="button"
        onClick={() => open({ type: "warta", id: utama.id })}
        className="mt-3 block w-full rounded-lg border border-line p-3 text-left transition-colors duration-feedback ease-enter hover:bg-surface-muted"
      >
        <span className="rounded bg-brand-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">{utama.label}</span>
        <span className="ml-2 text-xs text-ink-400">{utama.tanggal}</span>
        <span className="mt-2 block text-sm font-medium text-ink-900">{utama.judul}</span>
        <span className="mt-1 line-clamp-3 block text-xs text-ink-500">{utama.isi}</span>
      </button>

      <ul className="mt-3 space-y-2 text-xs">
        {lain.map((w) => (
          <li key={w.id}>
            <button
              type="button"
              onClick={() => open({ type: "warta", id: w.id })}
              className="flex w-full items-center justify-between gap-3 text-left hover:text-brand-700"
            >
              <span className="text-ink-500">{w.judul}</span>
              <span className="shrink-0 font-medium text-brand-600">Baca</span>
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
