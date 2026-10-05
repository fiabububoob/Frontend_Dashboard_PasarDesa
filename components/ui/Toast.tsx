"use client";

import { clsx } from "clsx";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { DURATION } from "@/lib/motion";

type ToastType = "success" | "error" | "info";

interface ToastOptions {
  type?: ToastType;
  title: string;
  description?: string;
}

interface ToastItem extends ToastOptions {
  id: number;
  closing: boolean;
}

const ToastContext = createContext<((options: ToastOptions) => void) | null>(null);

const STYLES: Record<ToastType, { icon: typeof Info; color: string }> = {
  success: { icon: CheckCircle2, color: "text-brand-600" },
  error: { icon: AlertCircle, color: "text-danger-600" },
  info: { icon: Info, color: "text-info-600" },
};

// Pemakaian:  const toast = useToast();  toast({ type: "success", title: "Tersimpan" });
// Masuk: geser+fade dengan ease-out (225ms). Keluar: ease-in (195ms) — sesuai materi.
// Toast error tampil lebih lama supaya pesannya sempat dibaca.
const DURASI_TOAST_MS = 3500;
const DURASI_TOAST_ERROR_MS = 6000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setItems((list) => list.map((t) => (t.id === id ? { ...t, closing: true } : t)));
    setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), DURATION.exit);
  }, []);

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = ++nextId.current;
      setItems((list) => [...list.slice(-2), { ...options, id, closing: false }]); // maks. 3 sekaligus
      // Error dibiarkan lebih lama supaya sempat terbaca.
      setTimeout(() => dismiss(id), options.type === "error" ? DURASI_TOAST_ERROR_MS : DURASI_TOAST_MS);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2"
      >
        {items.map((t) => {
          const { icon: Icon, color } = STYLES[t.type ?? "info"];
          return (
            <div
              key={t.id}
              role={t.type === "error" ? "alert" : "status"}
              className={clsx(
                "pointer-events-auto flex items-start gap-3 rounded-xl border border-line bg-white p-4 shadow-lg",
                t.closing ? "animate-toast-out" : "animate-toast-in",
              )}
            >
              <Icon className={clsx("mt-0.5 h-5 w-5 shrink-0", color)} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink-900">{t.title}</p>
                {t.description && <p className="mt-0.5 text-xs text-ink-500">{t.description}</p>}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Tutup notifikasi"
                className="rounded p-0.5 text-ink-400 transition-colors duration-feedback ease-enter hover:text-ink-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast harus dipakai di dalam <ToastProvider>");
  return ctx;
}
