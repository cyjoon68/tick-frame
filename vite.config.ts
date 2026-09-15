import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@/app": resolve(rootDir, "src/app"),
      "@/pages": resolve(rootDir, "src/pages"),
      "@/features": resolve(rootDir, "src/features"),
      "@/entities": resolve(rootDir, "src/entities"),
      "@/shared": resolve(rootDir, "src/shared"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./tests/setup.ts",
  },
});
