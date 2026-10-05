"use client";

import { WARTA_LIST } from "@/lib/data/ringkasan";
import { useDetail } from "./DetailProvider";

export function WartaContent({ id }: { id: string }) {
  const { push } = useDetail();
  const w = WARTA_LIST.find((x) => x.id === id);
  if (!w) return <p className="text-sm text-ink-500">Warta tidak ditemukan.</p>;
  const lain = WARTA_LIST.filter((x) => x.id !== id);

  return (
    <div className="space-y-4 text-sm">
      <div>
        <span className="rounded bg-brand-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">{w.label}</span>
        <span className="ml-2 text-xs text-ink-400">{w.tanggal}</span>
        <p className="mt-2 leading-relaxed text-ink-700">{w.isi}</p>
      </div>
      {lain.length > 0 && (
        <div>
          <p className="text-xs font-medium uppercase text-ink-400">Warta lainnya</p>
          <ul className="mt-2 space-y-1.5">
            {lain.map((x) => (
              <li key={x.id}>
                <button
                  type="button"
                  onClick={() => push({ type: "warta", id: x.id })}
                  className="w-full rounded-lg border border-line px-3 py-2 text-left font-medium text-ink-900 transition-colors duration-feedback ease-enter hover:bg-surface-muted"
                >
                  {x.judul}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
