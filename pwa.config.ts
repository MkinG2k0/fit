import type { ManifestOptions } from "vite-plugin-pwa";
import { type GenerateSWOptions } from "workbox-build";

const SCREENSHOT_SIZE = "488x1055";
const SCREENSHOT_TYPE = "image/png";

export const pwaManifest: Partial<ManifestOptions> = {
  id: "/",
  name: "Fit",
  short_name: "Fit",
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
          src: "/screen/training_week_exercise_list.png",
          sizes: SCREENSHOT_SIZE,
          type: SCREENSHOT_TYPE,
        },
      ],
    },
  ],
  screenshots: [
    {
      src: "/screen/analytics_filters_kpis.png",
      type: SCREENSHOT_TYPE,
      sizes: SCREENSHOT_SIZE,
      form_factor: "narrow",
    },
    {
      src: "/screen/analytics_load_progress_chart.png",
      type: SCREENSHOT_TYPE,
      sizes: SCREENSHOT_SIZE,
      form_factor: "narrow",
    },
    {
      src: "/screen/exercises_categories_legs_expanded.png",
      type: SCREENSHOT_TYPE,
      sizes: SCREENSHOT_SIZE,
      form_factor: "narrow",
    },
    {
      src: "/screen/exercises_categories_with_presets.png",
      type: SCREENSHOT_TYPE,
      sizes: SCREENSHOT_SIZE,
      form_factor: "narrow",
    },
    {
      src: "/screen/exercises_create_modal.png",
      type: SCREENSHOT_TYPE,
      sizes: SCREENSHOT_SIZE,
      form_factor: "narrow",
    },
    {
      src: "/screen/exercises_edit_preset_modal.png",
      type: SCREENSHOT_TYPE,
      sizes: SCREENSHOT_SIZE,
      form_factor: "narrow",
    },
    {
      src: "/screen/exercises_presets_list.png",
      type: SCREENSHOT_TYPE,
      sizes: SCREENSHOT_SIZE,
      form_factor: "narrow",
    },
    {
      src: "/screen/settings_calendar_goals_backup.png",
      type: SCREENSHOT_TYPE,
      sizes: SCREENSHOT_SIZE,
      form_factor: "narrow",
    },
    {
      src: "/screen/settings_theme_selection.png",
      type: SCREENSHOT_TYPE,
      sizes: SCREENSHOT_SIZE,
      form_factor: "narrow",
    },
    {
      src: "/screen/timer_idle_screen.png",
      type: SCREENSHOT_TYPE,
      sizes: SCREENSHOT_SIZE,
      form_factor: "narrow",
    },
    {
      src: "/screen/training_calendar_exercise_expanded.png",
      type: SCREENSHOT_TYPE,
      sizes: SCREENSHOT_SIZE,
      form_factor: "narrow",
    },
    {
      src: "/screen/training_calendar_exercise_list.png",
      type: SCREENSHOT_TYPE,
      sizes: SCREENSHOT_SIZE,
      form_factor: "narrow",
    },
    {
      src: "/screen/training_week_bench_expanded.png",
      type: SCREENSHOT_TYPE,
      sizes: SCREENSHOT_SIZE,
      form_factor: "narrow",
    },
    {
      src: "/screen/training_week_exercise_list.png",
      type: SCREENSHOT_TYPE,
      sizes: SCREENSHOT_SIZE,
      form_factor: "narrow",
    },
  ],
};

export const pwaWorkBoxOptions: Partial<GenerateSWOptions> = {
  globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fit-backend\.onrender\.com\//,
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
