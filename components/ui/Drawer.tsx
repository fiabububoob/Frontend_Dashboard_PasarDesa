"use client";

import { clsx } from "clsx";
import { X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { DURATION } from "@/lib/motion";

interface DrawerProps {
  title: string;
  subtitle?: string;
  /** Badge di sebelah judul (mis. status pesanan). */
  badge?: ReactNode;
  /** Area di bawah header, mis. indikator langkah. */
  stepper?: ReactNode;
  /** Tombol-tombol di dasar panel. */
  /** Boleh fungsi: menerima `tutup` yang menutup panel dengan animasi. */
  footer?: ReactNode | ((tutup: () => void) => ReactNode);
  onClose: () => void; // dipanggil SETELAH animasi keluar selesai
  children: ReactNode;
}

// Panel samping kanan untuk form & detail (Tambah/Ubah Komoditas, Tarik Saldo, Detail Pesanan).
// Perilaku sama dengan Modal: Esc / klik latar menutup, Tab terkunci di dalam panel, fokus dikembalikan.
export function Drawer({ title, subtitle, badge, stepper, footer, onClose, children }: DrawerProps) {
  const [closing, setClosing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const requestClose = useCallback(() => {
    setClosing(true);
    setTimeout(onClose, DURATION.exit);
  }, [onClose]);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    return () => previous?.focus?.();
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") return requestClose();
      if (e.key !== "Tab") return;
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
      );
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
  }, [requestClose]);

  return (
    <div className="modal-root fixed inset-0 z-50 flex justify-end">
      <div
        aria-hidden
        onMouseDown={requestClose}
        className={clsx("no-print absolute inset-0 bg-ink-900/45", closing ? "animate-backdrop-out" : "animate-backdrop-in")}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={clsx(
          "modal-panel relative flex h-full w-full max-w-[616px] flex-col bg-white shadow-2xl focus:outline-none",
          closing ? "animate-drawer-out" : "animate-drawer-in",
        )}
      >
        <div className="flex items-start gap-3 px-7 pb-4 pt-6">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="font-display text-[22px] font-bold leading-tight text-ink-900">
              {title}
            </h2>
            {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
          </div>
          {badge}
          <button
            type="button"
            onClick={requestClose}
            aria-label="Tutup"
            className="no-print flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line text-ink-700 transition-colors duration-feedback ease-enter hover:bg-surface-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {stepper && <div className="border-b border-line px-7 pb-3">{stepper}</div>}
        {!stepper && <div className="border-b border-line" />}
        <div className="modal-body flex-1 overflow-y-auto px-7 py-6">{children}</div>
        {footer && <div className="no-print flex items-center gap-3 border-t border-line px-7 py-4">{typeof footer === "function" ? footer(requestClose) : footer}</div>}
      </div>
    </div>
  );
}

interface StepperProps {
  steps: string[];
  /** Indeks langkah aktif (mulai 0); langkah ≤ aktif diberi warna. */
  current: number;
  onSelect?: (index: number) => void;
}

// Garis progres bersegmen di atas isi drawer: segmen yang sudah/sedang dikerjakan berwarna hijau.
export function Stepper({ steps, current, onSelect }: StepperProps) {
  return (
    <ol className="flex gap-2">
      {steps.map((label, i) => {
        const done = i <= current;
        const body = (
          <>
            <span className={clsx("block h-1 rounded-full", done ? "bg-brand-600" : "bg-line")} />
            <span className={clsx("mt-2 block text-left text-xs font-semibold leading-tight", done ? "text-brand-700" : "text-ink-500")}>
              {i + 1}. {label}
            </span>
          </>
        );
        return (
          <li key={label} className="flex-1" aria-current={i === current ? "step" : undefined}>
            {onSelect ? (
              <button type="button" onClick={() => onSelect(i)} className="block w-full">
                {body}
              </button>
            ) : (
              body
            )}
          </li>
        );
      })}
    </ol>
  );
}
