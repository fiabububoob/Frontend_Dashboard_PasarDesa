"use client";

import { clsx } from "clsx";

interface UnderlineTabsProps {
  options: { label: string; count?: number }[];
  active: string;
  onChange: (label: string) => void;
}

// Tab dengan garis bawah hijau (tab status di halaman Komoditas & Pesanan).
export function UnderlineTabs({ options, active, onChange }: UnderlineTabsProps) {
  return (
    <div role="tablist" className="flex gap-6 overflow-x-auto border-b border-line px-5">
      {options.map((o) => {
        const isActive = o.label === active;
        return (
          <button
            key={o.label}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(o.label)}
            className={clsx(
              "-mb-px whitespace-nowrap border-b-2 py-3.5 text-sm transition-colors duration-feedback ease-enter",
              isActive ? "border-brand-600 font-semibold text-brand-700" : "border-transparent font-medium text-ink-700 hover:text-ink-900",
            )}
          >
            {o.label}
            {o.count !== undefined && ` (${o.count})`}
          </button>
        );
      })}
    </div>
  );
}
