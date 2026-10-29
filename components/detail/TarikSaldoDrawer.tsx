"use client";

import { useId, useState } from "react";
import { clsx } from "clsx";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { useActionStatus } from "@/lib/hooks/useActionStatus";
import { LATENSI, TUTUP_MODAL_SETELAH_SIMPAN_MS } from "@/lib/constants";
import { simulateRequest } from "@/lib/fake-api";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { KAS_MIN_TARIK } from "@/lib/data/kas";
import { formatNumber, formatRupiah } from "@/lib/format";
import { useDetail } from "./DetailProvider";

const NOMINAL_CEPAT = [500000, 1000000, 2500000];

// Validasi nominal. Mengembalikan pesan error, atau null bila valid / masih kosong.
function validasiNominal(nominal: number, maksimal: number): string | null {
  if (nominal <= 0) return null; // kosong: tombol nonaktif, belum perlu pesan galat
  if (nominal > maksimal) return `Melebihi saldo aktif (maksimal Rp ${formatNumber(maksimal)})`;
  if (nominal < KAS_MIN_TARIK) return `Minimal penarikan Rp ${formatNumber(KAS_MIN_TARIK)}`;
  return null;
}

// Form penarikan saldo dalam panel samping. Saldo dikurangi & mutasi dicatat hanya setelah permintaan berhasil.
export function TarikSaldoDrawer() {
  const { saldoAktif, rekening, ajukanPencairan } = useDashboardData();
  const { close, push } = useDetail();
  const confirm = useConfirm();
  const toast = useToast();
  const { status, run } = useActionStatus(2500);
  const errorId = useId();

  const [jalur, setJalur] = useState<"bank" | "tunai">("bank");
  const [nominal, setNominal] = useState(Math.min(2000000, saldoAktif));

  const error = validasiNominal(nominal, saldoAktif);
  const bisaKirim = nominal >= KAS_MIN_TARIK && nominal <= saldoAktif;

  async function kirim() {
    const ok = await confirm({
      title: "Kirim pengajuan pencairan dana?",
      description: "Pengajuan tidak dapat dibatalkan setelah dikirim.",
      details: [
        { label: "Jalur pencairan", value: jalur === "bank" ? `Transfer ${rekening.bank}` : "Tunai di Balai Desa" },
        { label: "Nominal", value: formatRupiah(nominal) },
        { label: "Biaya admin", value: "Gratis" },
        { label: "Sisa saldo aktif", value: formatRupiah(saldoAktif - nominal) },
      ],
      confirmLabel: "Ya, Kirim Pengajuan",
    });
    if (!ok) return;

    const terkirim = await run(async () => {
      await simulateRequest(LATENSI.lambat);
      if (!ajukanPencairan(nominal, jalur)) throw new Error("Saldo tidak cukup");
    });
    if (terkirim) {
      toast({ type: "success", title: "Pengajuan pencairan terkirim", description: `${formatRupiah(nominal)} sedang diproses.` });
      setTimeout(close, TUTUP_MODAL_SETELAH_SIMPAN_MS);
    } else {
      toast({ type: "error", title: "Pengajuan gagal dikirim", description: "Saldo Anda tidak berubah. Silakan coba lagi." });
    }
  }

  const jalurOpsi = [
    { key: "bank", judul: `Transfer ${rekening.bank.replace(/^Bank /, "Bank ")}`, ket: "Biaya admin gratis" },
    { key: "tunai", judul: "Tunai di Balai Desa", ket: "Kasir 08.00–15.00 WIB" },
  ] as const;

  return (
    <Drawer
      title="Tarik Saldo"
      subtitle={`Saldo siap tarik ${formatRupiah(saldoAktif)}`}
      onClose={close}
      footer={(tutup) => (
        <>
          <Button variant="secondary" className="border-brand-600 text-brand-700" onClick={tutup}>
            Batal
          </Button>
          <Button className="ml-auto" status={status} disabled={!bisaKirim && status === "idle"} loadingLabel="Mengirim pengajuan…" successLabel="Pengajuan Terkirim" errorLabel="Gagal, coba lagi" onClick={kirim}>
            Kirim Pengajuan
          </Button>
        </>
      )}
    >
      <div className="space-y-6">
        <section>
          <p className="mb-2 text-sm font-semibold text-ink-900">Rekening tujuan</p>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-line px-4 py-3">
            <div className="min-w-0 text-sm">
              <p className="font-bold text-ink-900">
                {rekening.bank} {rekening.unit}
              </p>
              <p className="text-ink-700">
                a.n. {rekening.atasNama} - {rekening.nomor}
              </p>
            </div>
            <button type="button" onClick={() => push({ type: "rekening" })} className="shrink-0 text-sm font-semibold text-brand-600 hover:underline">
              Ubah
            </button>
          </div>
        </section>

        <section>
          <p className="mb-2 text-sm font-semibold text-ink-900">Jalur pencairan</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {jalurOpsi.map((o) => (
              <button
                key={o.key}
                type="button"
                aria-pressed={jalur === o.key}
                onClick={() => setJalur(o.key)}
                className={clsx("rounded-xl border-2 px-4 py-3 text-left transition-colors duration-feedback ease-enter", jalur === o.key ? "border-brand-600 bg-[#EEFAF2]" : "border-line hover:bg-surface-muted")}
              >
                <p className="text-sm font-bold text-ink-900">{o.judul}</p>
                <p className="text-sm text-ink-700">{o.ket}</p>
              </button>
            ))}
          </div>
        </section>

        <section>
          <label htmlFor="nominal-tarik" className="mb-2 block text-sm font-semibold text-ink-900">
            Nominal penarikan
          </label>
          <div
            className={clsx(
              "rounded-xl border px-4 py-3 transition-[border-color,box-shadow] duration-feedback ease-enter",
              error ? "border-danger-600 ring-1 ring-danger-600/30" : "border-line focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500",
            )}
          >
            <input
              id="nominal-tarik"
              type="text"
              inputMode="numeric"
              value={`Rp ${formatNumber(nominal)}`}
              aria-invalid={Boolean(error) || undefined}
              aria-describedby={error ? errorId : undefined}
              onChange={(e) => {
                const angka = Number(e.target.value.replace(/\D/g, ""));
                setNominal(Number.isNaN(angka) ? 0 : angka);
              }}
              className="w-full bg-transparent text-2xl font-medium tabular-nums text-ink-900 focus:outline-none"
            />
          </div>
          {error ? (
            <p id={errorId} role="alert" className="mt-2 flex animate-fade-up items-center gap-1 text-xs text-danger-600">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {error}
            </p>
          ) : (
            <p className="mt-2 text-xs text-ink-500">
              Maksimal {formatRupiah(saldoAktif)} ·{" "}
              <button type="button" onClick={() => setNominal(saldoAktif)} className="font-semibold text-brand-600 hover:underline">
                Tarik semua
              </button>
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {NOMINAL_CEPAT.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNominal(Math.min(n, saldoAktif))}
                className="rounded-full border border-line px-4 py-1.5 text-sm font-medium text-ink-700 transition-[background-color,transform] duration-feedback ease-enter hover:bg-surface-muted active:scale-95"
              >
                Rp {formatNumber(n)}
              </button>
            ))}
          </div>
        </section>

        <p className="rounded-xl border border-brand-200 bg-[#EEFAF2] px-4 py-3 text-sm text-brand-900">
          Diproses jam kerja (08.00–15.00 WIB). Bukti mutasi resmi terbit otomatis dalam format PDF.
        </p>
      </div>
    </Drawer>
  );
}
