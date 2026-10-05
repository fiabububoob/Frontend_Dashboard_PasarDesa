"use client";

import { useId, useState } from "react";
import { clsx } from "clsx";
import { AlertCircle, Landmark, Banknote, Info, Send } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { useActionStatus } from "@/lib/hooks/useActionStatus";
import { LATENSI } from "@/lib/constants";
import { simulateRequest } from "@/lib/fake-api";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { useDetail } from "@/components/detail/DetailProvider";
import { KAS_MIN_TARIK } from "@/lib/data/kas";
import { formatNumber, formatRupiah } from "@/lib/format";

const QUICK_AMOUNTS = [500000, 1000000, 2500000];
const MIN_TARIK = KAS_MIN_TARIK;

// Validasi nominal. Mengembalikan pesan error, atau null bila valid / masih kosong.
function validateAmount(amount: number, maxSaldo: number): string | null {
  if (amount <= 0) return null; // kosong: tombol disabled, belum perlu pesan error
  if (amount > maxSaldo) return `Melebihi saldo aktif (maksimal Rp ${formatNumber(maxSaldo)})`;
  if (amount < MIN_TARIK) return `Minimal penarikan Rp ${formatNumber(MIN_TARIK)}`;
  return null;
}

export function WithdrawForm() {
  const [channel, setChannel] = useState<"bank" | "tunai">("bank");
  const { saldoAktif, rekening, ajukanPencairan } = useDashboardData();
  const { open } = useDetail();
  const [amount, setAmount] = useState(2000000);
  const errorId = useId();
  const confirm = useConfirm();
  const toast = useToast();
  const { status, run } = useActionStatus(2500);

  const error = validateAmount(amount, saldoAktif);
  const canSubmit = amount >= MIN_TARIK && amount <= saldoAktif;
  const namaBank = rekening.bank;

  async function handleSubmit() {
    const ok = await confirm({
      title: "Kirim pengajuan pencairan dana?",
      description: "Pengajuan tidak dapat dibatalkan setelah dikirim.",
      details: [
        { label: "Jalur pencairan", value: channel === "bank" ? `Transfer ${namaBank}` : "Tunai di Balai Desa" },
        { label: "Nominal", value: formatRupiah(amount) },
        { label: "Biaya admin", value: "Gratis" },
        { label: "Sisa saldo aktif", value: formatRupiah(saldoAktif - amount) },
      ],
      confirmLabel: "Ya, Kirim Pengajuan",
    });
    if (!ok) return;

    const sent = await run(async () => {
      await simulateRequest(LATENSI.lambat);
      // Saldo dikurangi & mutasi dicatat hanya setelah permintaan berhasil.
      if (!ajukanPencairan(amount, channel)) throw new Error("Saldo tidak cukup");
    });
    if (sent) {
      toast({ type: "success", title: "Pengajuan pencairan terkirim", description: `${formatRupiah(amount)} sedang diproses.` });
      setAmount(Math.min(2000000, saldoAktif - amount)); // kembali ke nominal umum, dibatasi sisa saldo
    } else {
      toast({ type: "error", title: "Pengajuan gagal dikirim", description: "Saldo Anda tidak berubah. Silakan coba lagi." });
    }
  }

  return (
    <Card className="p-5" id="form-tarik">
      <p className="text-xs font-medium uppercase text-brand-600">Pengajuan Kas Keluar</p>
      <h3 className="mt-1 font-display text-lg font-bold text-ink-900">Formulir Penarikan Dana Hasil Panen</h3>
      <div className="mt-2">
        <Badge tone="success">Proses Cepat &lt; 2 Jam</Badge>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg border border-line p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-ink-900">
              {rekening.bank} {rekening.unit}
              <Badge tone={rekening.terverifikasi ? "success" : "warning"}>{rekening.terverifikasi ? "Terverifikasi BUMDes" : "Menunggu Verifikasi"}</Badge>
            </p>
            <p className="text-xs text-ink-500">
              a.n. {rekening.atasNama} · No. Rek: {rekening.nomor}
            </p>
          </div>
        </div>
        <button type="button" onClick={() => open({ type: "rekening" })} className="shrink-0 text-xs font-medium text-brand-600 hover:underline">
          Ubah Rekening
        </button>
      </div>

      <p className="mt-5 text-sm font-medium text-ink-900">Pilih Jalur Pencairan Dana</p>
      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {(
          [
            { key: "bank", icon: Landmark, title: `Transfer ${namaBank}`, desc: "Langsung ke rekening tani terdaftar. Biaya admin: Gratis (Rp 0)" },
            { key: "tunai", icon: Banknote, title: "Tunai di Balai Desa", desc: "Ambil cash langsung di Kasir BUMDes Balai Desa Sukorejo (08.00 - 15.00 WIB)" },
          ] as const
        ).map(({ key, icon: Icon, title, desc }) => (
          <button
            key={key}
            type="button"
            onClick={() => setChannel(key)}
            aria-pressed={channel === key}
            className={clsx(
              "rounded-lg border p-3.5 text-left transition-colors duration-feedback ease-enter",
              channel === key ? "border-brand-500 bg-brand-50/60" : "border-line hover:bg-surface-muted",
            )}
          >
            <p className="flex items-center gap-2 text-sm font-medium text-ink-900">
              <Icon className="h-4 w-4 text-brand-600" />
              {title}
            </p>
            <p className="mt-1 text-xs text-ink-500">{desc}</p>
          </button>
        ))}
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-sm">
          <label htmlFor="nominal-tarik" className="font-medium text-ink-900">
            Nominal Penarikan Saldo
          </label>
          <p className="text-xs text-ink-500">Maksimal: Rp {formatNumber(saldoAktif)}</p>
        </div>
        {/* State input: default · focus · error. Border+ring berubah dengan transisi 100ms. */}
        <div
          className={clsx(
            "mt-2 flex items-center gap-2 rounded-lg border px-4 py-3 transition-[border-color,box-shadow] duration-feedback ease-enter",
            error
              ? "border-danger-600 ring-1 ring-danger-600/30"
              : "border-line focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500",
          )}
        >
          <span className="font-display text-lg font-bold text-ink-900">Rp</span>
          <input
            id="nominal-tarik"
            type="text"
            inputMode="numeric"
            value={formatNumber(amount)}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? errorId : undefined}
            onChange={(e) => {
              const numeric = Number(e.target.value.replace(/\D/g, ""));
              setAmount(Number.isNaN(numeric) ? 0 : numeric);
            }}
            className="min-w-0 flex-1 bg-transparent text-lg font-semibold tabular-nums text-ink-900 focus:outline-none"
          />
          <button type="button" onClick={() => setAmount(saldoAktif)} className="text-sm font-medium text-brand-600 hover:underline">
            Tarik Semua
          </button>
        </div>
        {error && (
          <p id={errorId} role="alert" className="mt-1.5 flex animate-fade-up items-center gap-1 text-xs text-danger-600">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {error}
          </p>
        )}
        <div className="mt-2 flex flex-wrap gap-2">
          {QUICK_AMOUNTS.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setAmount(val)}
              className="rounded-full border border-line px-3 py-1 text-xs font-medium text-ink-700 transition-[background-color,transform] duration-feedback ease-enter hover:bg-surface-muted active:scale-95"
            >
              Rp {formatNumber(val)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex gap-2 rounded-lg bg-surface-muted p-3 text-xs text-ink-500">
        <Info className="h-4 w-4 shrink-0 text-ink-400" />
        Diproses pada jam kerja (08.00–15.00 WIB). Bukti mutasi resmi terbit otomatis dalam format PDF.
      </div>

      <Button
        className="mt-4 w-full"
        status={status}
        disabled={!canSubmit && status === "idle"}
        loadingLabel="Mengirim pengajuan…"
        successLabel="Pengajuan Terkirim"
        errorLabel="Gagal mengirim, coba lagi"
        onClick={handleSubmit}
      >
        <Send className="h-4 w-4" />
        Kirim Pengajuan Pencairan Dana Sekarang
      </Button>
    </Card>
  );
}
