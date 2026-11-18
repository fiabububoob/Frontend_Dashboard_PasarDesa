import { ChevronLeft, ChevronRight } from "lucide-react";
import { UKURAN_HALAMAN } from "@/lib/constants";

interface PaginationProps {
  showing: number;
  total: number;
  currentPage: number;
  totalPages: number;
  itemLabel?: string;
  /** Jumlah baris per halaman (untuk menghitung rentang "6–10"). */
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

export function Pagination({ showing, total, currentPage, totalPages, itemLabel = "data", pageSize = UKURAN_HALAMAN, onPageChange }: PaginationProps) {
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-line px-5 py-3 text-sm text-ink-500 sm:flex-row">
      <p>
        Menampilkan {showing === 0 ? 0 : `${(currentPage - 1) * pageSize + 1}–${(currentPage - 1) * pageSize + showing}`} dari {total} {itemLabel}
      </p>
      <div className="flex items-center gap-2">
        <button type="button" aria-label="Halaman sebelumnya" onClick={() => onPageChange?.(currentPage - 1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-line hover:bg-surface-muted disabled:opacity-40" disabled={currentPage === 1}>
          <ChevronLeft className="h-4 w-4" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            type="button"
            aria-current={page === currentPage ? "page" : undefined}
            onClick={() => onPageChange?.(page)}
            className={`h-9 w-9 rounded-lg border text-sm font-medium ${
              page === currentPage ? "border-brand-600 bg-brand-600 text-white" : "border-line hover:bg-surface-muted"
            }`}
          >
            {page}
          </button>
        ))}
        <button type="button" aria-label="Halaman berikutnya" onClick={() => onPageChange?.(currentPage + 1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-line hover:bg-surface-muted disabled:opacity-40" disabled={currentPage === totalPages}>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
