"use client";

import { clsx } from "clsx";
import { BADGE_PRODUK } from "@/lib/data/badgeProduk";
import type { BadgeProduk } from "@/types";

interface BadgePickerProps {
  nilai: BadgeProduk[];
  onChange: (nilai: BadgeProduk[]) => void;
}

// Pilih label produk (boleh lebih dari satu). Urutan hasil selalu mengikuti daftar baku.
export function BadgePicker({ nilai, onChange }: BadgePickerProps) {
  function toggle(kode: BadgeProduk) {
    const berikutnya = nilai.includes(kode) ? nilai.filter((k) => k !== kode) : [...nilai, kode];
    onChange(BADGE_PRODUK.map((b) => b.kode).filter((k) => berikutnya.includes(k)));
  }

  return (
    <div>
      <span className="mb-1.5 block text-xs font-medium text-ink-700">Label di foto produk</span>
      <div className="flex flex-wrap gap-2">
        {BADGE_PRODUK.map(({ kode, label }) => {
          const aktif = nilai.includes(kode);
          return (
            <button
              key={kode}
              type="button"
              aria-pressed={aktif}
              onClick={() => toggle(kode)}
              className={clsx(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors duration-feedback ease-enter",
                aktif ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-surface text-ink-700 hover:bg-surface-muted",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}