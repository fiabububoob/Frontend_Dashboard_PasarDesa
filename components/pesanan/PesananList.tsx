"use client";

import { clsx } from "clsx";
import { Check, ChevronDown, Search, SearchX, Filter } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "./StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { stagger } from "@/lib/motion";
import { formatRupiah } from "@/lib/format";
import { STATUS_LABEL } from "@/lib/pesanan";
import { useClickOutside } from "@/lib/hooks/useClickOutside";
import { cocokSemuaKata } from "@/lib/text";
import type { Pesanan } from "@/types";

interface PesananListProps {
  judul: string;
  data: Pesanan[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const SEMUA_BATCH = "Semua Drop-Point";

export function PesananList({ judul, data, selectedId, onSelect }: PesananListProps) {
  const [query, setQuery] = useState("");
  const [batch, setBatch] = useState(SEMUA_BATCH);
  const [batchBuka, setBatchBuka] = useState(false);
  const batchRef = useRef<HTMLDivElement>(null);

  // "Batch kemas" = kelompok paket per drop-point, supaya pengemasan bisa
  // dikerjakan per tujuan kurir.
  const batches = useMemo(() => {
    const hitung = new Map<string, number>();
    data.forEach((p) => hitung.set(p.dropPoint, (hitung.get(p.dropPoint) ?? 0) + 1));
    return Array.from(hitung.entries());
  }, [data]);

  // Batch yang sudah tidak punya paket (mis. semua sudah diproses) kembali ke "Semua".
  useEffect(() => {
    if (batch !== SEMUA_BATCH && !batches.some(([nama]) => nama === batch)) setBatch(SEMUA_BATCH);
  }, [batch, batches]);

  useClickOutside(batchRef, () => setBatchBuka(false));

  const filtered = useMemo(
    () =>
      data.filter(
        (p) =>
          (batch === SEMUA_BATCH || p.dropPoint === batch) &&
          cocokSemuaKata(query, p.id, p.pembeli, p.alamat, p.dropPoint, STATUS_LABEL[p.status], ...p.items.map((i) => i.komoditas)),
      ),
    [data, query, batch],
  );

  const adaFilter = query.trim() !== "" || batch !== SEMUA_BATCH;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-ink-900">
          {judul} ({filtered.length})
        </p>

        <div ref={batchRef} className="relative">
          <button
            type="button"
            aria-expanded={batchBuka}
            onClick={() => setBatchBuka((v) => !v)}
            className="flex max-w-[11rem] items-center gap-1 text-xs text-ink-500 hover:text-ink-700"
          >
            <Filter className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{batch === SEMUA_BATCH ? "Pilih Batch Kemas" : batch}</span>
            <ChevronDown className="h-3 w-3 shrink-0" />
          </button>

          {batchBuka && (
            <div className="absolute right-0 top-full z-20 mt-2 w-64 animate-fade-in-fast rounded-xl border border-line bg-white p-1.5 shadow-lg">
              {[[SEMUA_BATCH, data.length] as const, ...batches].map(([nama, jumlah]) => (
                <button
                  key={nama}
                  type="button"
                  onClick={() => {
                    setBatch(nama);
                    setBatchBuka(false);
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors duration-feedback ease-enter hover:bg-surface-muted"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Check className={clsx("h-3.5 w-3.5 shrink-0 text-brand-600", batch === nama ? "opacity-100" : "opacity-0")} aria-hidden />
                    <span className="truncate text-ink-700">{nama}</span>
                  </span>
                  <span className="shrink-0 text-ink-400">{jumlah}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="relative mt-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Cari pesanan"
          placeholder="Cari No. Pesanan / Pembeli / Komoditas..."
          className="w-full rounded-lg border border-line bg-surface-muted py-2 pl-9 pr-3 text-sm placeholder:text-ink-400 focus:border-brand-500 focus:outline-none"
        />
      </div>

      <div className="mt-3 space-y-2">
        {filtered.length === 0 && (
          <EmptyState
            icon={SearchX}
            title={adaFilter ? "Pesanan tidak ditemukan" : "Belum ada pesanan"}
            description={
              adaFilter ? "Tidak ada pesanan yang cocok dengan pencarian atau batch ini." : "Tidak ada pesanan di kategori ini."
            }
            action={
              adaFilter ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setBatch(SEMUA_BATCH);
                  }}
                  className="text-xs font-medium text-brand-600 hover:underline"
                >
                  Hapus pencarian &amp; batch
                </button>
              ) : undefined
            }
          />
        )}
        {filtered.map((p, index) => {
          const active = p.id === selectedId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p.id)}
              style={stagger(index)}
              className={clsx(
                "w-full animate-fade-up rounded-lg border p-3 text-left transition-colors duration-feedback ease-enter",
                active ? "border-brand-500 bg-brand-50/60" : "border-line hover:bg-surface-muted",
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-ink-900">#{p.id}</p>
                <div className="flex items-center gap-2">
                  <StatusBadge status={p.status} />
                  <span className="text-xs text-ink-400">{p.waktu}</span>
                </div>
              </div>
              <p className="mt-1 text-sm text-ink-700">{p.pembeli}</p>
              <p className="text-xs text-ink-400">{p.alamat}</p>
              <div className="mt-2 flex items-center justify-between">
                <Badge tone={p.metodeBayar === "QRIS" ? "info" : "neutral"}>{p.metodeBayar === "QRIS" ? "QRIS Lunas" : "COD Kasir"}</Badge>
                <p className="text-sm font-semibold text-ink-900">{formatRupiah(p.total)}</p>
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-center text-xs text-ink-400">
        Menampilkan {filtered.length} dari {data.length} pesanan
      </p>
    </Card>
  );
}
