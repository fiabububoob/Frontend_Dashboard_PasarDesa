import {
  LayoutDashboard,
  Warehouse,
  Truck,
  Wallet,
  Store,
  type LucideIcon,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Single source of truth for the sidebar navigation.
//
// To add, rename, or reorder a menu item, edit this array only — the
// Sidebar component just maps over it. No other file needs to change.
// ---------------------------------------------------------------------------

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Komoditas", href: "/komoditas", icon: Warehouse },
  { label: "Pesanan", href: "/pesanan", icon: Truck },
  { label: "Kas & Saldo", href: "/kas", icon: Wallet },
  { label: "Pengaturan", href: "/pengaturan", icon: Store },
];
