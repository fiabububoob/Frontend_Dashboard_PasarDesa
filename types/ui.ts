export interface StatCard {
  id: string;
  label: string;
  value: string;
  helper?: string;
  trend?: { direction: "up" | "down"; value: string };
  tone?: "default" | "warning" | "danger" | "success";
}
