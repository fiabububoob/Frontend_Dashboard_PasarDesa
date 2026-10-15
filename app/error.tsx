"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

// Error boundary tingkat aplikasi: mis. backend mati saat layout dashboard memverifikasi sesi.
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg items-center p-6">
      <Card className="w-full">
        <EmptyState
          tone="error"
          icon={AlertTriangle}
          title="Server tidak merespons"
          description="Pastikan backend sedang berjalan, lalu coba lagi."
          action={
            <Button onClick={reset}>
              <RefreshCcw className="h-4 w-4" />
              Coba Lagi
            </Button>
          }
        />
      </Card>
    </div>
  );
}
