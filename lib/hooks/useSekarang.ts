"use client";

import { useEffect, useState } from "react";
import { INTERVAL_PEMBARUAN_JAM_MS } from "@/lib/constants";

// Waktu sekarang yang diperbarui berkala. Bernilai null saat render pertama
// (server & hydration) dan baru terisi setelah mount, supaya HTML dari server
// tidak berbeda dengan browser (hydration mismatch).
export function useSekarang(intervalMs: number = INTERVAL_PEMBARUAN_JAM_MS): Date | null {
  const [sekarang, setSekarang] = useState<Date | null>(null);
  useEffect(() => {
    setSekarang(new Date());
    const timer = setInterval(() => setSekarang(new Date()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return sekarang;
}
