import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "."),
      // `server-only` кидає помилку поза React Server-оточенням — у тестах
      // підміняємо його порожнім модулем.
      "server-only": path.resolve(import.meta.dirname, "test/empty.ts"),
    },
  },
});
