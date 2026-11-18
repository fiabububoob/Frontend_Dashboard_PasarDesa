"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { LATENSI, MODE_DEMO } from "@/lib/constants";
import { simulateRequest } from "@/lib/fake-api";
import { formatJam, formatRupiah } from "@/lib/format";
import { useActionStatus } from "@/lib/hooks/useActionStatus";
import { LABEL_ALASAN, LABEL_PENYELESAIAN, nilaiRefundPilihan } from "@/lib/komplain";
import type { Pesanan, PenyelesaianKomplain, StatusKomplain } from "@/types";

const STATUS_KOMPLAIN: Record<StatusKomplain, { label: string; tone: BadgeTone }> = {
  diajukan: { label: "Menunggu keputusan Anda", tone: "warning" },
  "diteruskan-bumdes": { label: "Diteruskan ke BUMDes", tone: "info" },
  selesai: { label: "Selesai", tone: "success" },
};

const PILIHAN: { nilai: PenyelesaianKomplain; label: string }[] = [
  { nilai: "refund", label: "Refund" },
  { nilai: "pengganti", label: "Kirim pengganti" },
];

// Panel penanganan komplain di detail pesanan. Penjual memilih per item: refund (dana kembali ke
// Saldo PasarDesa pembeli) atau kirim pengganti (bebas biaya), atau meneruskan kasus ke BUMDes.
// Selama komplain berjalan, dana pesanan ditahan dan pelepasan otomatis berhenti (keputusan D8–D9).
export function KomplainPanel({ pesanan }: { pesanan: Pesanan }) {
  const { selesaikanKomplain, teruskanKomplain } = useDashboardData();
  const confirm = useConfirm();
  const toast = useToast();
  const { status, run } = useActionStatus();
  const { komplain } = pesanan;
  const [pilihan, setPilihan] = useState<(PenyelesaianKomplain | undefined)[]>(() => komplain?.items.map((item) => item.penyelesaian) ?? []);

  if (!komplain) return null;
  const terbuka = komplain.status === "diajukan";
  const lengkap = pilihan.length > 0 && pilihan.every(Boolean);
  const totalRefund = nilaiRefundPilihan(komplain, pilihan);
  const jumlahPengganti = pilihan.filter((x) => x === "pengganti").length;

  const pilih = (index: number, nilai: PenyelesaianKomplain) => setPilihan((lama) => lama.map((x, i) => (i === index ? nilai : x)));

  async function selesaikan() {
    const ok = await confirm({
      title: "Selesaikan komplain ini?",
      description: "Keputusan tidak bisa diubah. Pembeli akan diberi tahu.",
      details: [
        { label: "Refund ke pembeli", value: formatRupiah(totalRefund) },
        { label: "Kirim pengganti", value: `${jumlahPengganti} item` },
      ],
      confirmLabel: "Ya, Selesaikan",
    });
    if (!ok) return;
    const saved = await run(() => simulateRequest(LATENSI.normal));
    if (!saved) {
      toast({ type: "error", title: "Gagal menyelesaikan komplain", description: "Periksa koneksi lalu coba lagi." });
      return;
    }
    selesaikanKomplain(pesanan.id, pilihan);
    toast({
      type: "success",
      title: "Komplain diselesaikan",
      description: jumlahPengganti > 0 ? "Pesanan kembali ke antrean kemas sebagai kirim ulang." : `${formatRupiah(totalRefund)} dikembalikan ke pembeli.`,
    });
  }

  async function teruskan() {
    const ok = await confirm({
      title: "Teruskan komplain ke BUMDes?",
      description: "BUMDes akan memutuskan penyelesaiannya. Dana pesanan tetap ditahan sampai ada keputusan.",
      confirmLabel: "Ya, Teruskan",
      tone: "danger",
    });
    if (!ok) return;
    teruskanKomplain(pesanan.id);
    toast({ type: "info", title: "Komplain diteruskan ke BUMDes" });
  }

  return (
    <section aria-label="Komplain pembeli" className="space-y-3 rounded-lg border border-warn-400/50 bg-warn-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-ink-900">Komplain pembeli · {komplain.id}</p>
        <Badge tone={STATUS_KOMPLAIN[komplain.status].tone}>{STATUS_KOMPLAIN[komplain.status].label}</Badge>
      </div>

      <div className="text-xs text-ink-700">
        <p>
          <span className="font-medium">{LABEL_ALASAN[komplain.alasan]}</span> · diajukan {formatJam(new Date(komplain.diajukanPada))} WIB
        </p>
        {komplain.catatan && <p className="mt-1 italic text-ink-500">&ldquo;{komplain.catatan}&rdquo;</p>}
      </div>

      {komplain.foto.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {komplain.foto.map((src, i) => (
            <li key={i}>
              {/* eslint-disable-next-line @next/next/no-img-element -- foto bukti dari pembeli */}
              <img src={src} alt={`Bukti komplain ${i + 1}`} className="h-16 w-16 rounded-lg border border-line object-cover" />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-ink-400">Pembeli tidak melampirkan foto.</p>
      )}

      <ul className="divide-y divide-line rounded-lg border border-line bg-white">
        {komplain.items.map((item, index) => (
          <li key={item.komoditas} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5">
            <span className="text-sm">
              <span className="font-medium text-ink-900">{item.komoditas}</span>
              <span className="ml-2 text-xs text-ink-500">{formatRupiah(item.nilai)}</span>
            </span>
            {terbuka ? (
              <div role="group" aria-label={`Penyelesaian ${item.komoditas}`} className="flex gap-1.5">
                {PILIHAN.map(({ nilai, label }) => (
                  <button
                    key={nilai}
                    type="button"
                    aria-pressed={pilihan[index] === nilai}
                    onClick={() => pilih(index, nilai)}
                    className={clsx(
                      "rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors duration-feedback ease-enter",
                      pilihan[index] === nilai ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-surface text-ink-700 hover:bg-surface-muted",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : (
              <span className="text-xs font-medium text-ink-700">{item.penyelesaian ? LABEL_PENYELESAIAN[item.penyelesaian] : "Menunggu keputusan"}</span>
            )}
          </li>
        ))}
      </ul>

      {terbuka && (
        <>
          <p className="text-xs text-ink-500">
            {lengkap
              ? `Refund ${formatRupiah(totalRefund)} ke Saldo PasarDesa pembeli · ${jumlahPengganti} item dikirim ulang bebas biaya.`
              : "Pilih penyelesaian untuk setiap item."}
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={teruskan}>
              Tolak &amp; Teruskan ke BUMDes
            </Button>
            <Button size="sm" status={status} loadingLabel="Menyimpan…" disabled={!lengkap} onClick={selesaikan}>
              Selesaikan Komplain
            </Button>
          </div>
        </>
      )}

      {komplain.status === "diteruskan-bumdes" && (
        <div className="space-y-2">
          <p className="text-xs text-ink-500">Menunggu keputusan BUMDes. Dana pesanan tetap ditahan.</p>
          {/* Alat pengembangan: meniru keputusan admin BUMDes. Hilang di build produksi. */}
          {MODE_DEMO && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                selesaikanKomplain(pesanan.id, komplain.items.map(() => "refund"));
                toast({ type: "info", title: "Simulasi: BUMDes memutuskan refund semua item" });
              }}
            >
              Simulasi admin BUMDes: refund semua item (mode pengembangan)
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
