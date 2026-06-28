/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Relative asset paths so the same build works whether served at `/` (its own
  // Vercel project) or under the gallery at `/studio/`.
  base: "./",
  // The deck themes and shared layout templates live outside this package; allow
  // Vite's dev server to read them from the monorepo root.
  server: { fs: { allow: [".."] } },
  build: { outDir: "dist", emptyOutDir: true },
  test: {
    // Unit tests live in test/; the Playwright e2e suite (e2e/) runs separately.
    include: ["test/**/*.test.ts"],
    // Process CSS so `*.css?raw` template imports return real content
    // (Vitest stubs CSS to an empty string by default).
    css: true,
  },
});
