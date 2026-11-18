import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

// Every page (Ringkasan, Komoditas, Pesanan, Kas, Pengaturan) opens with the
// same title + description + action-buttons row. Defining it once keeps the
// spacing/typography consistent without copy-pasting markup into each page.
export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow && <p className="mb-1 text-sm font-semibold text-brand-600">{eyebrow}</p>}
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-[32px] sm:leading-tight">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-ink-700">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
