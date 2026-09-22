import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "WORLD AI",
        short_name: "WORLD AI",
        description: "AI workspace for chat, code, images and voice",
        id: "/",
        start_url: "/",
        scope: "/",
        lang: "en",
        dir: "ltr",
        categories: ["productivity", "utilities"],
        theme_color: "#000000",
        background_color: "#000000",
        display: "standalone",
        orientation: "portrait",
        icons: [
          { src: "/pwa-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
          { src: "/pwa-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
        ]
      },
      workbox: { cleanupOutdatedCaches: true }
    })
  ]
});