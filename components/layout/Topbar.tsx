"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useDetail } from "@/components/detail/DetailProvider";
import { NotificationMenu } from "./topbar/NotificationMenu";
import { ProfileMenu } from "./topbar/ProfileMenu";
import { SearchBox } from "./topbar/SearchBox";

// Topbar hanya merangkai bagian-bagiannya: pencarian, notifikasi, aksi cepat, profil.
export function Topbar() {
  const { open } = useDetail();

  return (
    <header className="relative z-30 flex items-center gap-3 border-b border-line bg-surface px-4 py-3.5 lg:px-8">
      <SearchBox />
      <div className="flex-1" aria-hidden />
      <NotificationMenu />
      <Button className="hidden sm:inline-flex" onClick={() => open({ type: "tambah-panen" })}>
        <Plus className="h-4 w-4" />
        Tambah Hasil Panen
      </Button>
      <ProfileMenu />
    </header>
  );
}