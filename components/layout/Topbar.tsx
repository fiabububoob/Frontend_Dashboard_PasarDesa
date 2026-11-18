"use client";

import { NotificationMenu } from "./topbar/NotificationMenu";
import { ProfileMenu } from "./topbar/ProfileMenu";
import { SearchBox } from "./topbar/SearchBox";

// Topbar hanya merangkai bagian-bagiannya: pencarian, notifikasi, aksi cepat, profil.
export function Topbar() {
  return (
    <header className="relative z-30 flex items-center gap-3 border-b border-line bg-surface px-4 py-3 lg:px-8">
      <SearchBox />
      <div className="flex-1" aria-hidden />
      <NotificationMenu />
      <ProfileMenu />
    </header>
  );
}
