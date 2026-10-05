"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

// Error boundary: kalau sebuah halaman gagal dirender/memuat data, sidebar tetap
// ada dan pengguna diberi jalan keluar (coba lagi) — bukan layar putih.
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Card>
      <EmptyState
        tone="error"
        icon={AlertTriangle}
        title="Halaman gagal dimuat"
        description="Data belum bisa ditampilkan. Periksa koneksi internet, lalu coba lagi."
        action={
          <Button onClick={reset}>
            <RefreshCcw className="h-4 w-4" />
            Coba Lagi
          </Button>
        }
      />
    </Card>
  );
}
