import type { ExerciseIconGraphicId } from "@/shared/ui/exerciseIcon/svgHtml";

/** Относительные пути к SVG в `public/` (кэш PWA, внешние ссылки). */
export const EXERCISE_ICON_PATHS = {
  "nav-exercises": "icons/nav-exercises.svg",
  "nav-timer": "icons/nav-timer.svg",
  "nav-body-metrics": "icons/nav-body-metrics.svg",
  "nav-menu": "icons/nav-menu.svg",
  "nav-analytics": "icons/nav-analytics.svg",
  "logo-mark": "icons/logo-mark.svg",
  "extra-9": "icons/extra-9.svg",
  "nav-settings": "icons/nav-settings.svg",
  "extra-8": "icons/extra-8.svg",
} as const satisfies Record<ExerciseIconGraphicId, string>;

export type ExerciseIconId = ExerciseIconGraphicId;

export const DEFAULT_EXERCISE_ICON_ID: ExerciseIconId = "nav-exercises";

const CATEGORY_DEFAULT_ICON: Record<string, ExerciseIconId> = {
  кардио: "nav-timer",
  пресс: "nav-body-metrics",
  ноги: "nav-menu",
  икры: "nav-menu",
  ягодицы: "nav-body-metrics",
  спина: "nav-analytics",
  грудь: "logo-mark",
  плечи: "extra-9",
  руки: "nav-settings",
  предплечья: "nav-settings",
  мобильность: "extra-8",
};

export const defaultIconIdForCategory = (category: string): ExerciseIconId => {
  const key = category.trim().toLowerCase();

  return CATEGORY_DEFAULT_ICON[key] ?? DEFAULT_EXERCISE_ICON_ID;
};

const isExerciseIconId = (value: string): value is ExerciseIconId =>
  Object.hasOwn(EXERCISE_ICON_PATHS, value);

export const normalizeExerciseIconId = (value: unknown): ExerciseIconId => {
  if (typeof value !== "string") {
    return DEFAULT_EXERCISE_ICON_ID;
  }

  if (isExerciseIconId(value)) {
    return value;
  }

  return DEFAULT_EXERCISE_ICON_ID;
};

export const EXERCISE_ICON_PICKER_IDS: ExerciseIconId[] = [
  "nav-exercises",
  "nav-timer",
  "nav-body-metrics",
  "nav-menu",
  "nav-analytics",
  "logo-mark",
  "extra-9",
  "nav-settings",
  "extra-8",
];
