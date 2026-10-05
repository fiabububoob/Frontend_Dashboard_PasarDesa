import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

// The one wrapper every panel/card on every page uses. Change the base
// look (border, radius) here and it updates everywhere at once.
export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-line bg-surface",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
