"use client";

import { useId, useMemo, useState } from "react";
import { clsx } from "clsx";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { useSekarang } from "@/lib/hooks/useSekarang";
import { formatRupiah, formatRupiahRingkas } from "@/lib/format";
import { komoditasTerlaris, penjualanHarian, type PeriodeChart } from "@/lib/penjualan";

// Dua kartu sebaris (grid 12 kolom, tinggi sejajar): garis penjualan harian + Top 5 komoditas terlaris.
// Keduanya memakai satu pilihan periode (7 / 30 hari) dan satu sumber: pesanan SELESAI per hari dari
// data hidup (lib/penjualan.ts), jadi angkanya ikut backend Express dan berubah saat pesanan selesai.

const HARI_SINGKAT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
// 12:00 WIB = 05:00 UTC, jadi hari dalam minggu di UTC sama dengan hari WIB.
const hariDariIso = (iso: string) => new Date(`${iso}T12:00:00+07:00`).getUTCDay();

function labelSumbuX(iso: string, periode: PeriodeChart, terakhir: boolean): string {
  if (terakhir) return "Hari Ini";
  return periode === 7 ? HARI_SINGKAT[hariDariIso(iso)] : `${Number(iso.slice(8))}/${Number(iso.slice(5, 7))}`;
}

// Batas atas sumbu Y dibulatkan ke angka "bulat" supaya garis bantu rapi.
function batasAtas(maks: number): number {
  if (maks <= 0) return 1_000_000;
  const pangkat = 10 ** Math.floor(Math.log10(maks));
  const f = maks / pangkat;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * pangkat;
}

const W = 640;
const H = 240;
const PAD = { kiri: 48, kanan: 16, atas: 12, bawah: 28 };

function ToggleHari({ periode, onChange }: { periode: PeriodeChart; onChange: (p: PeriodeChart) => void }) {
  return (
    <div role="group" aria-label="Periode chart" className="flex overflow-hidden rounded-lg border border-line text-xs font-medium">
      {([7, 30] as const).map((p) => (
        <button
          key={p}
          type="button"
          aria-pressed={periode === p}
          onClick={() => onChange(p)}
          className={clsx("px-3 py-1.5 transition-colors duration-feedback ease-enter", periode === p ? "bg-brand-600 text-white" : "bg-white text-ink-700 hover:bg-surface-muted")}
        >
          {p} Hari
        </button>
      ))}
    </div>
  );
}

function GarisPenjualan({ periode, onPeriode }: { periode: PeriodeChart; onPeriode: (p: PeriodeChart) => void }) {
  const { pesanan } = useDashboardData();
  const sekarang = useSekarang();
  const gradId = `grad-${useId().replace(/:/g, "")}`;
  const data = useMemo(() => (sekarang ? penjualanHarian(pesanan, periode, sekarang) : null), [pesanan, periode, sekarang]);

  const lebarPlot = W - PAD.kiri - PAD.kanan;
  const tinggiPlot = H - PAD.atas - PAD.bawah;
  const atas = data ? batasAtas(Math.max(...data.sekarang.map((t) => t.nilai), ...data.sebelumnya.map((t) => t.nilai))) : 1_000_000;
  const x = (i: number) => PAD.kiri + (i / (periode - 1)) * lebarPlot;
  const y = (v: number) => PAD.atas + tinggiPlot - (v / atas) * tinggiPlot;
  const jalur = (l: { nilai: number }[]) => l.map((t, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(t.nilai).toFixed(1)}`).join(" ");
  const kosong = !data || (data.total === 0 && data.totalSebelumnya === 0);
  const garisBantu = [0, 1, 2, 3, 4].map((i) => (atas / 4) * i);
  const langkahLabel = periode === 7 ? 1 : 5;

  const naik = data?.perubahanPersen !== null && data !== null && (data?.perubahanPersen ?? 0) >= 0;

  return (
    <Card className="flex h-full flex-col p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-ink-900">Penjualan Harian</h3>
          <p className="mt-0.5 text-xs text-ink-500">Nilai pesanan selesai per hari, {periode} hari terakhir</p>
        </div>
        <ToggleHari periode={periode} onChange={onPeriode} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-ink-500">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-5 rounded bg-brand-600" /> Periode ini
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-5 border-t-2 border-dashed border-ink-400" /> Periode sebelumnya
        </span>
        {data && (
          <span className="ml-auto flex items-center gap-2">
            <span className="font-semibold text-ink-900">{formatRupiah(data.total)}</span>
            {data.perubahanPersen !== null && (
              <span className={clsx("inline-flex items-center gap-0.5 font-medium", naik ? "text-brand-600" : "text-danger-600")}>
                {naik ? <TrendingUp className="h-3.5 w-3.5" aria-hidden /> : <TrendingDown className="h-3.5 w-3.5" aria-hidden />}
                {Math.abs(data.perubahanPersen)}%
              </span>
            )}
          </span>
        )}
      </div>

      <div className="relative mt-3 min-h-[220px] flex-1">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Grafik garis penjualan harian ${periode} hari terakhir dibanding periode sebelumnya`} className="h-full w-full">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#27A369" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#27A369" stopOpacity="0" />
            </linearGradient>
          </defs>

          {garisBantu.map((v) => (
            <g key={v}>
              <line x1={PAD.kiri} x2={W - PAD.kanan} y1={y(v)} y2={y(v)} stroke="#E4E9E5" strokeDasharray={v === 0 ? undefined : "3 4"} />
              <text x={PAD.kiri - 8} y={y(v) + 3.5} textAnchor="end" fontSize="10" fill="#9CA3AF">
                {v === 0 ? "0" : formatRupiahRingkas(v).replace("Rp ", "")}
              </text>
            </g>
          ))}

          {data && !kosong && (
            <>
              <path d={`${jalur(data.sekarang)} L${x(periode - 1)},${y(0)} L${x(0)},${y(0)} Z`} fill={`url(#${gradId})`} />
              <path d={jalur(data.sebelumnya)} fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="4 4" strokeLinejoin="round" />
              <path d={jalur(data.sekarang)} fill="none" stroke="#188250" strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" />
              {data.sekarang.map((t, i) => (
                <circle key={t.tanggal} cx={x(i)} cy={y(t.nilai)} r={i === periode - 1 ? 4 : 8} fill={i === periode - 1 ? "#188250" : "transparent"}>
                  <title>{`${labelSumbuX(t.tanggal, periode, false)} (${t.tanggal}): ${formatRupiah(t.nilai)} · sebelumnya ${formatRupiah(data.sebelumnya[i].nilai)}`}</title>
                </circle>
              ))}
            </>
          )}

          {data?.sekarang.map((t, i) =>
            i % langkahLabel === 0 || i === periode - 1 ? (
              <text key={t.tanggal} x={x(i)} y={H - 8} textAnchor="middle" fontSize="10" fontWeight={i === periode - 1 ? 700 : 400} fill={i === periode - 1 ? "#1B1F23" : "#9CA3AF"}>
                {labelSumbuX(t.tanggal, periode, i === periode - 1)}
              </text>
            ) : null,
          )}
        </svg>
        {data && kosong && <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-ink-500">Belum ada pesanan selesai pada periode ini.</p>}
      </div>
    </Card>
  );
}

function TopKomoditas({ periode }: { periode: PeriodeChart }) {
  const { pesanan } = useDashboardData();
  const sekarang = useSekarang();
  const ringkas = useMemo(() => (sekarang ? komoditasTerlaris(pesanan, periode, sekarang, 5) : null), [pesanan, periode, sekarang]);
  const terbesar = ringkas?.top[0]?.nilai ?? 0;

  return (
    <Card className="flex h-full flex-col p-5">
      <h3 className="font-display text-base font-semibold text-ink-900">Top 5 Komoditas Terlaris</h3>
      <p className="mt-0.5 text-xs text-ink-500">Berdasarkan nilai penjualan, {periode} hari terakhir</p>

      {!ringkas || ringkas.top.length === 0 ? (
        <p className="mt-6 text-sm text-ink-500">Belum ada penjualan selesai pada periode ini.</p>
      ) : (
        <>
          <ol className="mt-4 space-y-3.5">
            {ringkas.top.map((k, i) => (
              <li key={k.nama}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate font-medium text-ink-900">
                    {i + 1}. {k.nama}
                  </span>
                  <span className="shrink-0 text-xs text-ink-500">
                    {formatRupiahRingkas(k.nilai)} · {k.persen}%
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-sunken">
                  <div
                    className={clsx("h-full origin-left animate-grow-x rounded-full", i === 0 ? "bg-brand-700" : "bg-brand-500")}
                    style={{ width: `${terbesar > 0 ? Math.max((k.nilai / terbesar) * 100, 3) : 0}%` }}
                  />
                </div>
              </li>
            ))}
          </ol>
          {ringkas.persenLain > 0 && <p className="mt-auto pt-4 text-xs text-ink-500">Komoditas lain: {ringkas.persenLain}% dari total penjualan.</p>}
        </>
      )}
    </Card>
  );
}

export function PenjualanPanel() {
  const [periode, setPeriode] = useState<PeriodeChart>(7);
  return (
    <div className="grid grid-cols-12 items-stretch gap-6">
      <div className="col-span-12 min-w-0 xl:col-span-8">
        <GarisPenjualan periode={periode} onPeriode={setPeriode} />
      </div>
      <div className="col-span-12 min-w-0 xl:col-span-4">
        <TopKomoditas periode={periode} />
      </div>
    </div>
  );
}
