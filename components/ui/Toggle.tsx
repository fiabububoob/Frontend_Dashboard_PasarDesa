"use client";

import { clsx } from "clsx";
import { useState } from "react";

interface ToggleProps {
  checked?: boolean; // isi untuk mode controlled (mis. saat butuh konfirmasi dulu)
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (next: boolean) => void;
  "aria-label"?: string;
}

// Uncontrolled by default supaya bisa langsung dipasang di baris tabel. Kalau
// `checked` diisi, komponen jadi controlled — perubahan hanya terjadi bila
// parent mengubah nilainya (berguna untuk alur "konfirmasi dulu baru berubah").
export function Toggle({ checked, defaultChecked = false, disabled, onChange, ...rest }: ToggleProps) {
  const [internal, setInternal] = useState(defaultChecked);
  const isControlled = checked !== undefined;
  const value = isControlled ? checked : internal;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={rest["aria-label"]}
      disabled={disabled}
      onClick={() => {
        const next = !value;
        if (!isControlled) setInternal(next);
        onChange?.(next);
      }}
      className={clsx(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-feedback ease-move",
        value ? "bg-brand-600" : "bg-ink-200",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span
        className={clsx(
          "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-feedback ease-move",
          value ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
}
