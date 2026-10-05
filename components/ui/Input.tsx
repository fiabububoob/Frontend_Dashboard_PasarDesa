"use client";

import { clsx } from "clsx";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useId, useState, type FormEvent, type InputHTMLAttributes } from "react";

// State input: default · focus · error · success · disabled
//
// Validasi memakai atribut HTML bawaan (required, minLength, pattern). Ketika
// form dicek (form.checkValidity()), event `invalid` memicu pesan error +
// getaran singkat; pesan hilang otomatis begitu isian diperbaiki. Jadi form
// cukup memberi atribut, tanpa state error manual per field.
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  prefixText?: string;
  error?: string; // error dari luar (validasi custom)
  success?: boolean;
  patternMessage?: string;
  containerClassName?: string;
}

function messageFor(el: HTMLInputElement, patternMessage?: string) {
  if (el.validity.valueMissing) return "Wajib diisi";
  if (el.validity.tooShort) return `Minimal ${el.minLength} karakter`;
  if (el.validity.patternMismatch || el.validity.typeMismatch) return patternMessage ?? "Format tidak valid";
  return el.validationMessage || "Isian tidak valid";
}

export function Input({
  prefixText,
  error,
  success,
  patternMessage,
  containerClassName,
  className,
  onInvalid,
  onChange,
  ...props
}: InputProps) {
  const messageId = useId();
  const [validityError, setValidityError] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);

  const message = error ?? validityError;
  const hasError = Boolean(message);

  function handleInvalid(e: FormEvent<HTMLInputElement>) {
    e.preventDefault(); // cegah bubble validasi bawaan browser; kita tampilkan sendiri
    setValidityError(messageFor(e.currentTarget, patternMessage));
    setShaking(true);
    onInvalid?.(e);
  }

  return (
    <div className={containerClassName}>
      <div
        onAnimationEnd={() => setShaking(false)}
        className={clsx(
          "flex items-center overflow-hidden rounded-lg border bg-white",
          "transition-[border-color,box-shadow,background-color] duration-feedback ease-enter",
          hasError
            ? "border-danger-600 ring-1 ring-danger-600/30"
            : success
              ? "border-brand-500"
              : "border-line focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500",
          props.disabled && "bg-surface-muted",
          shaking && "animate-shake",
        )}
      >
        {prefixText && (
          <span className="flex items-center self-stretch bg-surface-muted px-3 text-sm text-ink-500">{prefixText}</span>
        )}
        <input
          {...props}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? messageId : undefined}
          onInvalid={handleInvalid}
          onChange={(e) => {
            if (validityError && e.currentTarget.checkValidity()) setValidityError(null);
            onChange?.(e);
          }}
          className={clsx(
            "w-full bg-transparent px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none disabled:cursor-not-allowed disabled:text-ink-500",
            className,
          )}
        />
        {success && !hasError && <CheckCircle2 className="mr-3 h-4 w-4 shrink-0 animate-pop text-brand-600" aria-hidden />}
      </div>
      {hasError && (
        <p id={messageId} role="alert" className="mt-1 flex animate-fade-up items-center gap-1 text-xs text-danger-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {message}
        </p>
      )}
    </div>
  );
}
