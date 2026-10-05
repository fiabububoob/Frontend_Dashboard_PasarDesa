"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { formatNumber } from "@/lib/format";

// Prinsip "Value Change": angka berhitung naik agar terasa hidup (mis. saldo,
// omzet). Menerima string apa adanya ("Rp 14.850.000", "8 Paket") — angka di
// dalamnya dianimasikan, teks di sekitarnya dibiarkan. Tanpa angka → tampil biasa.
//
// Render awal (server) langsung menampilkan nilai akhir, jadi tanpa JavaScript
// pun angkanya benar. Pengguna dengan "reduce motion" juga langsung melihat nilai akhir.
const PATTERN = /^(\D*?)(\d[\d.]*)(.*)$/;
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function CountUp({ value, duration = 600 }: { value: string; duration?: number }) {
  const match = value.match(PATTERN);
  const target = match ? Number(match[2].replace(/\./g, "")) : NaN;
  const [display, setDisplay] = useState(target);

  useIsomorphicLayoutEffect(() => {
    if (Number.isNaN(target)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(target);
      return;
    }
    let frame = 0;
    const start = performance.now();
    setDisplay(0);
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out: cepat di awal, melambat di akhir
      setDisplay(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  if (!match) return <>{value}</>;
  return (
    <span className="tabular-nums">
      {match[1]}
      {formatNumber(display)}
      {match[3]}
    </span>
  );
}
