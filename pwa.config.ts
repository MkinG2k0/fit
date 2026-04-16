import type { ManifestOptions } from "vite-plugin-pwa";

const SCREENSHOT_SIZE = "488x1055";
const SCREENSHOT_TYPE = "image/png";

export const pwaManifest: Partial<ManifestOptions> = {
  id: "/",
  name: "Fit",
  short_name: "Fit",
  description: "Фитнес-дневник тренировок",
  lang: "ru",
  theme_color: "#000000",
  background_color: "#ffffff",
  display: "standalone",
  scope: "/",
  start_url: "/",
  icons: [
    {
      src: "/pwa-192x192.png",
      type: "image/png",
      sizes: "192x192",
    },
    {
      src: "/pwa-512x512.png",
      type: "image/png",
      sizes: "512x512",
    },
    {
      src: "/pwa-512x512-maskable.png",
      type: "image/png",
      sizes: "512x512",
      purpose: "any maskable",
    },
    {
      src: "/logo.svg",
      type: "image/svg+xml",
      sizes: "any",
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
