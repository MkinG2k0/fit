import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { pwaManifest } from "./pwa.config.ts";

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler", { target: "19" }]],
      },
    }),
    tailwindcss(),
    VitePWA({
      strategies: "injectManifest",
      registerType: "autoUpdate",
      includeAssets: [
        "logo.svg",
        "logo.png",
        "pwa-192x192.png",
        "pwa-512x512.png",
        "pwa-512x512-maskable.png",
        "icons/*.svg",
      ],
      manifest: pwaManifest,
      srcDir: "src/app/providers/pwa",
      filename: "sw.js",
    }),
  ],
  server: {
    host: "127.0.0.1",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@app": path.resolve(__dirname, "./src/app"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@widgets": path.resolve(__dirname, "./src/widgets"),
      "@features": path.resolve(__dirname, "./src/features"),
      "@entities": path.resolve(__dirname, "./src/entities"),
      "@shared": path.resolve(__dirname, "./src/shared"),
      "@/ui": path.resolve(__dirname, "./src/shared/ui"),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        advancedChunks: {
          groups: [
            { name: "react", test: /node_modules\/react(|-dom)\// },
            { name: "radix", test: /node_modules\/@radix-ui\// },
            { name: "recharts", test: /node_modules\/recharts\// },
            { name: "motion", test: /node_modules\/framer-motion\// },
            { name: "widgets", test: /src\/shared\/ui\/widgets\// },
          ],
        },
      },
    },
  },
});
