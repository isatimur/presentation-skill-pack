import { defineConfig } from "@playwright/test";

// Serves the production build and runs the e2e flow against it.
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  use: { baseURL: "http://localhost:4317" },
  webServer: {
    command: "pnpm preview --port 4317 --strictPort",
    port: 4317,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
