import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

// Tes unit untuk logika murni di lib/ (tanpa DOM). Alias "@" sama dengan tsconfig.
export default defineConfig({
  resolve: { alias: { "@": resolve(__dirname) } },
  test: { include: ["tests/**/*.test.ts"], environment: "node" },
});
