"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ActionStatus } from "@/components/ui/Button";

// Mengelola siklus idle → loading → success/error untuk satu aksi (mis. tombol
// Simpan). Setelah success/error, status otomatis kembali ke idle.
//
//   const { status, run } = useActionStatus();
//   const ok = await run(() => api.save(data));   // ok = true kalau berhasil
//   <Button status={status}>Simpan</Button>
export function useActionStatus(resetAfterMs = 2000) {
  const [status, setStatus] = useState<ActionStatus>("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);

  const run = useCallback(
    async (action: () => Promise<unknown>): Promise<boolean> => {
      clearTimeout(timer.current);
      setStatus("loading");
      try {
        await action();
        setStatus("success");
        return true;
      } catch {
        setStatus("error");
        return false;
      } finally {
        timer.current = setTimeout(() => setStatus("idle"), resetAfterMs);
      }
    },
    [resetAfterMs],
  );

  return { status, run };
}
