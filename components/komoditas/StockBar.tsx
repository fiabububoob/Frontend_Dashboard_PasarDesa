import { clsx } from "clsx";
import { Badge } from "@/components/ui/Badge";
import type { Komoditas } from "@/types";

const STATUS_LABEL: Record<Komoditas["statusStok"], string> = {
  aman: "Aman",
  menengah: "Menengah",
  kritis: "Kritis",
};

const STATUS_BAR_COLOR: Record<Komoditas["statusStok"], string> = {
  aman: "bg-brand-500",
  menengah: "bg-warn-400",
  kritis: "bg-danger-600",
};

export function StockBar({ komoditas }: { komoditas: Komoditas }) {
  const pct = Math.min((komoditas.stok / komoditas.stokMaks) * 100, 100);
  return (
    <div className="w-32">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-ink-900">
          {komoditas.stok} {komoditas.satuan}
        </span>
        <Badge tone={komoditas.statusStok === "aman" ? "success" : komoditas.statusStok === "menengah" ? "warning" : "danger"}>
          {STATUS_LABEL[komoditas.statusStok]}
        </Badge>
      </div>
      <div className="mt-1.5 h-1.5 w-full rounded-full bg-surface-sunken">
        <div
          className={clsx("h-1.5 origin-left animate-grow-x rounded-full", STATUS_BAR_COLOR[komoditas.statusStok])}
          style={{ width: `${pct}%` }}
        />
      </div>
      {komoditas.statusStok === "kritis" && (
        <p className="mt-1 text-[11px] text-danger-600">Sisa {komoditas.stok} {komoditas.satuan} di lumbung</p>
      )}
      <p className="mt-1 text-[11px] text-ink-400">Kapasitas Maks: {komoditas.stokMaks} {komoditas.satuan}</p>
    </div>
  );
}
