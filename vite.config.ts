import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import appPackage from "./package.json" with { type: "json" };

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "public",
      filename: "sw.js",
      injectRegister: false,
      manifest: false,
      workbox: {
        cleanupOutdatedCaches: true,
      },
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,webp,json,woff,woff2}"],
        globIgnores: ["**/offline.html", "**/images/fallback.png"],
        additionalManifestEntries: [
          { url: "/", revision: appPackage.version ?? "0.0.0" },
          { url: "/offline.html", revision: appPackage.version ?? "0.0.0" },
          { url: "/images/fallback.png", revision: appPackage.version ?? "0.0.0" },
        ],
      },
      devOptions: {
        enabled: true,
        navigateFallback: "/offline.html",
      },
    }),
  ],
  base: "/",
  test: {
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
  },
});
