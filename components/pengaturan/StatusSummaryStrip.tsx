"use client";

import { ToggleRight, Home, Clock, Truck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { LOKASI_DROP_POINT } from "@/lib/data/pengaturan";

// Ringkasan kondisi lapak saat ini. Membaca pengaturan TERSIMPAN (bukan draft),
// jadi hanya berubah setelah "Simpan Pengaturan" atau mode jeda tanam diaktifkan.
export function StatusSummaryStrip() {
  const { pengaturan, jedaTanam } = useDashboardData();
  const lokasi = LOKASI_DROP_POINT.find((l) => l.id === pengaturan.dropPointId) ?? LOKASI_DROP_POINT[0];

  const items: { icon: typeof Home; label: string; value: string; helper?: string; tag?: string; tone?: "success" | "warning" | "info" }[] = [
    {
      icon: ToggleRight,
      label: "Status Digital",
      value: jedaTanam ? "Ditutup Sementara" : "Buka Lapak",
      tone: jedaTanam ? "warning" : "success",
      tag: jedaTanam ? "Jeda Tanam" : "Aktif",
    },
    { icon: Home, label: "Drop-Point Utama", value: lokasi.nama, helper: "PJ: Pak Sutrisno · Krajan RW 01" },
    { icon: Clock, label: "Pickup Kurir Desa", value: "2 Sesi Harian", helper: "Pagi: 07:00 - 09:30 · Sore: 15:00 - 17:00" },
    { icon: Truck, label: "Jangkauan Warga", value: "4 Dusun Sukorejo", helper: "Subsidi Biaya: 100% Kas BUMDes" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="p-4">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-xs text-ink-500">
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </p>
            {item.tag && <Badge tone={item.tone ?? "info"}>{item.tag}</Badge>}
          </div>
          <p className="mt-1.5 text-sm font-semibold text-ink-900">{item.value}</p>
          {item.helper && <p className="mt-0.5 text-xs text-ink-400">{item.helper}</p>}
        </Card>
      ))}
    </div>
  );
}
