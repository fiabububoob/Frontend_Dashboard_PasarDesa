"use client";

import { clsx } from "clsx";
import { ArrowLeft, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { DURATION } from "@/lib/motion";

interface ModalProps {
  title: string;
  subtitle?: string;
  onClose: () => void; // dipanggil SETELAH animasi keluar selesai
  onBack?: () => void;
  size?: "md" | "lg";
  children: ReactNode;
}

// Modal generik (overlay + obscuration, sama seperti ConfirmDialog): Esc/klik
// latar menutup, Tab terkunci di dalam modal, fokus dikembalikan saat ditutup.
export function Modal({ title, subtitle, onClose, onBack, size = "md", children }: ModalProps) {
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
    <div className="modal-root fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div
        aria-hidden
        onMouseDown={requestClose}
        className={clsx("no-print absolute inset-0 bg-ink-900/40 backdrop-blur-sm", closing ? "animate-backdrop-out" : "animate-backdrop-in")}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={clsx(
          "modal-panel relative flex max-h-[90vh] w-full flex-col rounded-2xl bg-white shadow-2xl focus:outline-none",
          size === "lg" ? "max-w-2xl" : "max-w-lg",
          closing ? "animate-dialog-out" : "animate-dialog-in",
        )}
      >
        <div className="flex items-start gap-3 border-b border-line px-5 py-4">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Kembali"
              className="no-print -ml-1 mt-0.5 rounded-lg p-1.5 text-ink-500 transition-colors duration-feedback ease-enter hover:bg-surface-muted"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="font-display text-lg font-bold text-ink-900">
              {title}
            </h2>
            {subtitle && <p className="mt-0.5 text-xs text-ink-500">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={requestClose}
            aria-label="Tutup"
            className="no-print rounded-lg p-1.5 text-ink-400 transition-colors duration-feedback ease-enter hover:bg-surface-muted hover:text-ink-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="modal-body overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
