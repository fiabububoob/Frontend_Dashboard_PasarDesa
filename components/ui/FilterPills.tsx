"use client";

import { clsx } from "clsx";
import { useState } from "react";

interface FilterPillsProps {
  options: { label: string; count?: number }[];
  defaultActive?: string;
  active?: string; // isi untuk mode controlled
  onChange?: (label: string) => void;
}

// The rounded, count-badged filter tabs seen at the top of both the
// Komoditas list and the Pesanan list. One component, driven by an
// `options` array, so both pages share the exact same look and behavior.
export function FilterPills({ options, defaultActive, active: activeProp, onChange }: FilterPillsProps) {
  const [internal, setInternal] = useState(defaultActive ?? options[0]?.label);
  const active = activeProp ?? internal;
  const setActive = (label: string) => {
    setInternal(label);
    onChange?.(label);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = active === option.label;
        return (
          <button
            key={option.label}
            type="button"
            onClick={() => setActive(option.label)}
            className={clsx(
              "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors duration-feedback ease-enter",
              isActive ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-surface text-ink-700 hover:bg-surface-muted",
            )}
          >
            {option.label}
            {option.count !== undefined && (
              <span
                className={clsx(
                  "rounded-full px-1.5 py-0.5 text-xs",
                  isActive ? "bg-white/25" : "bg-surface-sunken text-ink-500",
                )}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
