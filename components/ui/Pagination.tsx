import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  showing: number;
  total: number;
  currentPage: number;
  totalPages: number;
  itemLabel?: string;
  onPageChange?: (page: number) => void;
}

export function Pagination({ showing, total, currentPage, totalPages, itemLabel = "data", onPageChange }: PaginationProps) {
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-line px-5 py-3 text-sm text-ink-500 sm:flex-row">
      <p>
        Menampilkan {showing} dari {total} {itemLabel}
      </p>
      <div className="flex items-center gap-1">
        <button type="button" aria-label="Halaman sebelumnya" onClick={() => onPageChange?.(currentPage - 1)} className="rounded-lg p-1.5 hover:bg-surface-muted disabled:opacity-40" disabled={currentPage === 1}>
          <ChevronLeft className="h-4 w-4" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            type="button"
            aria-current={page === currentPage ? "page" : undefined}
            onClick={() => onPageChange?.(page)}
            className={`h-8 w-8 rounded-lg text-sm font-medium ${
              page === currentPage ? "bg-brand-600 text-white" : "hover:bg-surface-muted"
            }`}
          >
            {page}
          </button>
        ))}
        <button type="button" aria-label="Halaman berikutnya" onClick={() => onPageChange?.(currentPage + 1)} className="rounded-lg p-1.5 hover:bg-surface-muted disabled:opacity-40" disabled={currentPage === totalPages}>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
