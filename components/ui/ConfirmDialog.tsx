"use client";

import { clsx } from "clsx";
import { AlertTriangle, Info } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Button } from "./Button";
import { DURATION } from "@/lib/motion";

export interface ConfirmOptions {
  title: string;
  description?: string;
  details?: { label: string; value: string }[]; // ringkasan yang akan dikonfirmasi
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;
const ConfirmContext = createContext<ConfirmFn | null>(null);

// Pemakaian:
//   const confirm = useConfirm();
//   const ok = await confirm({ title: "Yakin ingin menyimpan perubahan?" });
//   if (!ok) return;
//
// Prinsip motion: OVERLAY (dialog menumpuk di atas halaman tanpa kehilangan
// konteks) + OBSCURATION (latar diburamkan). Masuk ease-out 225ms, keluar
// ease-in 195ms. Dialog tetap ter-mount sampai animasi keluar selesai.
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ options: ConfirmOptions; closing: boolean } | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((options) => {
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
      setState({ options, closing: false });
    });
  }, []);

  const settle = useCallback((result: boolean) => {
    if (!resolver.current) return; // cegah klik ganda saat animasi keluar
    resolver.current(result);
    resolver.current = null;
    setState((s) => (s ? { ...s, closing: true } : s));
    setTimeout(() => setState(null), DURATION.exit);
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && <Dialog options={state.options} closing={state.closing} onResult={settle} />}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm harus dipakai di dalam <ConfirmProvider>");
  return ctx;
}

function Dialog({
  options,
  closing,
  onResult,
}: {
  options: ConfirmOptions;
  closing: boolean;
  onResult: (result: boolean) => void;
}) {
  const { title, description, details, confirmLabel = "Ya, Lanjutkan", cancelLabel = "Batal", tone = "default" } = options;
  const danger = tone === "danger";
  const Icon = danger ? AlertTriangle : Info;
  const panelRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descId = useId();

  // Fokus awal ke "Batal" (pilihan paling aman), kembalikan fokus saat ditutup.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    return () => previous?.focus?.();
  }, []);

  // Esc = batal. Tab dikunci di dalam dialog (focus trap).
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") return onResult(false);
      if (e.key !== "Tab") return;
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>("button:not([disabled])");
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onResult]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div
        aria-hidden
        onMouseDown={() => onResult(false)}
        className={clsx(
          "absolute inset-0 bg-ink-900/40 backdrop-blur-sm",
          closing ? "animate-backdrop-out" : "animate-backdrop-in",
        )}
      />
      <div
        ref={panelRef}
        role={danger ? "alertdialog" : "dialog"}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className={clsx(
          "relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl",
          closing ? "animate-dialog-out" : "animate-dialog-in",
        )}
      >
        <div
          className={clsx(
            "flex h-11 w-11 items-center justify-center rounded-full",
            danger ? "bg-danger-50 text-danger-600" : "bg-brand-100 text-brand-700",
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <h2 id={titleId} className="mt-4 font-display text-lg font-bold text-ink-900">
          {title}
        </h2>
        {description && (
          <p id={descId} className="mt-1.5 text-sm text-ink-500">
            {description}
          </p>
        )}
        {details && details.length > 0 && (
          <dl className="mt-4 space-y-2 rounded-lg bg-surface-muted p-3 text-sm">
            {details.map((d) => (
              <div key={d.label} className="flex justify-between gap-4">
                <dt className="text-ink-500">{d.label}</dt>
                <dd className="text-right font-medium text-ink-900">{d.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button ref={cancelRef} variant="secondary" onClick={() => onResult(false)}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? "danger" : "primary"} onClick={() => onResult(true)}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
