import { clsx } from "clsx";
import type { SelectHTMLAttributes } from "react";
import { fieldClass } from "./formStyles";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  compact?: boolean;
  fullWidth?: boolean;
}

export function Select({ compact, fullWidth, className, children, ...props }: SelectProps) {
  return (
    <select className={clsx(fieldClass({ compact, fullWidth }), className)} {...props}>
      {children}
    </select>
  );
}
