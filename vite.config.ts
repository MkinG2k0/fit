import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { visualizer } from "rollup-plugin-visualizer";
import { pwaManifest, pwaWorkBoxOptions } from "./pwa.config.ts";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer(),
    VitePWA({
      strategies: "injectManifest",
      registerType: "autoUpdate",
      includeAssets: ["logo.svg"],
      manifest: pwaManifest,
      workbox: pwaWorkBoxOptions,
      srcDir: "src/app/providers/pwa",
      filename: "sw.js",
      injectManifest: {
        injectionPoint: undefined,
      },
    }),
  ],
  server: {
    host: "127.0.0.1",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
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
