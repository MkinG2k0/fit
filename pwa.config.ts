import type { ManifestOptions } from "vite-plugin-pwa";
import { type GenerateSWOptions } from "workbox-build";

export const pwaManifest: Partial<ManifestOptions> = {
  id: "/",
  name: "MagFitDiary",
  short_name: "MagFitDiary",
  description: "Фитнес-дневник тренировок",
  theme_color: "#000000",
  background_color: "#ffffff",
  display: "standalone",
  start_url: "/",
  icons: [
    {
      src: "/logo.svg",
      type: "image/svg+xml",
      sizes: "512x512",
    },
  ],
  shortcuts: [
    {
      name: "Training Day",
      description: "View trainings for today",
      url: "/",
      icons: [
        {
          src: "/pageScreen/trainingDay.png",
          sizes: "1170x2532",
          type: "image/png",
        },
      ],
    },
  ],
  screenshots: [
    {
      src: "/pageScreen/trainingDay.png",
      type: "image/png",
      sizes: "1170x2532",
      form_factor: "narrow",
    },
    {
      src: "/pageScreen/exerciseList.png",
      type: "image/png",
      sizes: "1170x2532",
      form_factor: "narrow",
    },
    {
      src: "/pageScreen/timer.png",
      type: "image/png",
      sizes: "1170x2532",
      form_factor: "narrow",
    },
    {
      src: "/pageScreen/addExercise.png",
      type: "image/png",
      sizes: "1170x2532",
      form_factor: "narrow",
    },
    {
      src: "/pageScreen/trainingWide.png",
      type: "image/png",
      sizes: "2360x1640",
      form_factor: "wide",
    },
  ],
};

export const pwaWorkBoxOptions: Partial<GenerateSWOptions> = {
  globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/magfit-diary-backend\.onrender\.com\//,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24,
        },
      },
    },
    {
      urlPattern: ({ request }) =>
        ["document", "script", "style", "image", "font"].includes(
          request.destination,
        ),
      handler: "CacheFirst",
      options: {
        cacheName: "assets-cache",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 7,
        },
      },
    },
  ],
};
