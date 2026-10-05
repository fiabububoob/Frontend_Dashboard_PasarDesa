"use client";

import { MessageCircle, Phone } from "lucide-react";
import { HOTLINE_BUMDES } from "@/lib/data/ringkasan";
import { LinkButton } from "@/components/ui/LinkButton";
import { waLink } from "@/lib/format";

export function HotlineContent() {
  return (
    <div className="space-y-4 text-sm">
      <p className="text-ink-500">Butuh bantuan soal pesanan, kas, atau aplikasi? Hubungi tim BUMDes lewat salah satu cara di bawah.</p>
      <p className="text-lg font-semibold text-ink-900">{HOTLINE_BUMDES.telepon}</p>
      <div className="flex gap-2">
        <LinkButton href={`tel:${HOTLINE_BUMDES.telepon}`} className="flex-1">
          <Phone className="h-4 w-4" />
          Telepon
        </LinkButton>
        <LinkButton href={waLink(HOTLINE_BUMDES.telepon)} external className="flex-1">
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </LinkButton>
      </div>
    </div>
  );
}
