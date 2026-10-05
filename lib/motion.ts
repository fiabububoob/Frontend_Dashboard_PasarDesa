import type { CSSProperties } from "react";

// ---------------------------------------------------------------------------
// Motion tokens — satu-satunya sumber kebenaran untuk durasi & easing.
//
// Nilainya mengikuti materi P7 (Timing & Easing):
//   feedback ~100ms  → toggle, checkbox, pressed state (terasa instan)
//   enter    225ms   → elemen MASUK layar, pakai ease-out (langsung responsif, lalu settle)
//   exit     195ms   → elemen KELUAR layar, pakai ease-in
//   move     300ms   → perpindahan/transisi antar konteks, pakai ease-in-out
//
// tailwind.config.ts membaca file ini, jadi kelas seperti `duration-enter`,
// `ease-exit`, `animate-dialog-in` otomatis ikut berubah kalau angka di sini diubah.
// ---------------------------------------------------------------------------

export const DURATION = {
  feedback: 100,
  enter: 225,
  exit: 195,
  move: 300,
} as const;

export const EASING = {
  enter: "cubic-bezier(0, 0, 0.2, 1)", // ease-out
  exit: "cubic-bezier(0.4, 0, 1, 1)", // ease-in
  move: "cubic-bezier(0.4, 0, 0.2, 1)", // ease-in-out
} as const;

// Offset & Delay (staggering): jeda 20–50ms per item. Dibatasi maksimal 8 item
// supaya daftar panjang tidak terasa lambat.
const STAGGER_STEP_MS = 40;
const STAGGER_MAX_ITEMS = 8;

export function stagger(index: number): CSSProperties {
  return { animationDelay: `${Math.min(index, STAGGER_MAX_ITEMS) * STAGGER_STEP_MS}ms` };
}
