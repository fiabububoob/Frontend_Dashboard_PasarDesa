"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { clsx } from "clsx";
import { Search, SearchX, X } from "lucide-react";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { useDetail } from "@/components/detail/DetailProvider";
import { WARTA_LIST } from "@/lib/data/ringkasan";
import { useClickOutside } from "@/lib/hooks/useClickOutside";
import { cari, type HasilCari } from "@/lib/search";

const ID_PANEL = "hasil-pencarian";
const ELEMEN_ISIAN = ["INPUT", "TEXTAREA", "SELECT"];

type BarisHasil = { hasil: HasilCari; indeks: number };

// Pencarian global. Hasil dikelompokkan per jenis, tetapi indeks tetap global
// supaya navigasi panah/Enter berjalan lurus di seluruh hasil.
export function SearchBox() {
  const { komoditas, pesanan, transaksi } = useDashboardData();
  const { open } = useDetail();

  const [query, setQuery] = useState("");
  const [fokus, setFokus] = useState(false);
  const [aktif, setAktif] = useState(0);
  const wadahRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useClickOutside(wadahRef, () => setFokus(false));

  // Tombol "/" memfokuskan kolom pencarian (selama pengguna tidak sedang mengetik di kolom lain).
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const sedangMengetik = ELEMEN_ISIAN.includes((e.target as HTMLElement).tagName);
      if (e.key === "/" && !sedangMengetik) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const hasil = useMemo(() => cari(query, { komoditas, pesanan, transaksi, warta: WARTA_LIST }), [query, komoditas, pesanan, transaksi]);
  const grup = useMemo(() => {
    const peta = new Map<string, BarisHasil[]>();
    hasil.forEach((h, indeks) => peta.set(h.grup, [...(peta.get(h.grup) ?? []), { hasil: h, indeks }]));
    return Array.from(peta.entries());
  }, [hasil]);

  const panelBuka = fokus && query.trim().length > 0;

  function pilih(h: HasilCari) {
    open(h.target);
    setFokus(false);
    setQuery("");
    inputRef.current?.blur();
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAktif((i) => Math.min(i + 1, hasil.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setAktif((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && hasil[aktif]) {
      e.preventDefault();
      pilih(hasil[aktif]);
    } else if (e.key === "Escape") {
      setFokus(false);
      inputRef.current?.blur();
    }
  }

  return (
    <div ref={wadahRef} className="relative max-w-lg flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={panelBuka}
        aria-controls={ID_PANEL}
        aria-label="Cari data"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setAktif(0);
        }}
        onFocus={() => setFokus(true)}
        onKeyDown={onKeyDown}
        placeholder="Cari pesanan, komoditas, transaksi…  (tekan /)"
        className="w-full rounded-lg border border-line bg-surface py-2.5 pl-9 pr-9 text-sm text-ink-700 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
      {query && (
        <button
          type="button"
          aria-label="Hapus pencarian"
          onClick={() => {
            setQuery("");
            inputRef.current?.focus();
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-ink-400 hover:text-ink-700"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {panelBuka && (
        <div id={ID_PANEL} role="listbox" className="absolute left-0 right-0 top-full mt-2 max-h-[70vh] animate-fade-in-fast overflow-y-auto rounded-xl border border-line bg-white p-2 shadow-lg">
          {hasil.length === 0 ? (
            <div className="flex flex-col items-center px-4 py-8 text-center">
              <SearchX className="h-6 w-6 text-ink-400" aria-hidden />
              <p className="mt-2 text-sm font-medium text-ink-900">Tidak ada hasil untuk &ldquo;{query}&rdquo;</p>
              <p className="mt-1 text-xs text-ink-500">Coba nama komoditas, ID pesanan, atau nama pemesan.</p>
            </div>
          ) : (
            grup.map(([nama, baris]) => (
              <div key={nama} className="mb-1 last:mb-0">
                <p className="px-2 pb-1 pt-2 text-[11px] font-medium uppercase text-ink-400">{nama}</p>
                {baris.map(({ hasil: h, indeks }) => (
                  <button
                    key={h.key}
                    type="button"
                    role="option"
                    aria-selected={indeks === aktif}
                    onMouseEnter={() => setAktif(indeks)}
                    onClick={() => pilih(h)}
                    className={clsx("block w-full rounded-lg px-2 py-2 text-left transition-colors duration-feedback ease-enter", indeks === aktif ? "bg-brand-50" : "hover:bg-surface-muted")}
                  >
                    <span className="block truncate text-sm font-medium text-ink-900">{h.judul}</span>
                    <span className="block truncate text-xs text-ink-500">{h.keterangan}</span>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
