import type { ExerciseIconGraphicId } from "@/shared/ui/exerciseIcon/svgHtml";

/** Относительные пути к SVG в `public/` (кэш PWA, внешние ссылки). */
export const EXERCISE_ICON_PATHS = {
  "nav-exercises": "icons/icon-kettlebell.svg",
  "nav-timer": "icons/icon-muscles-front.svg",
  "nav-body-metrics": "icons/icon-body-measurements.svg",
  "nav-menu": "icons/icon-legs-power.svg",
  "nav-analytics": "icons/icon-area-chart.svg",
  "logo-mark": "icons/icon-biceps.svg",
  "extra-9": "icons/icon-shoulders-stretch.svg",
  "nav-settings": "icons/icon-abs-core.svg",
  "extra-8": "icons/icon-mobility-arms-up.svg",
  "extra-cardio": "icons/icon-cardio.svg",
  "extra-calves": "icons/icon-calves.svg",
} as const satisfies Record<ExerciseIconGraphicId, string>;

export type ExerciseIconId = ExerciseIconGraphicId;

export const DEFAULT_EXERCISE_ICON_ID: ExerciseIconId = "nav-exercises";

const CATEGORY_DEFAULT_ICON: Record<string, ExerciseIconId> = {
  кардио: "extra-cardio",
  пресс: "nav-settings",
  ноги: "nav-menu",
  икры: "extra-calves",
  ягодицы: "nav-menu",
  спина: "nav-timer",
  грудь: "nav-exercises",
  плечи: "extra-9",
  руки: "logo-mark",
  предплечья: "nav-exercises",
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
  "extra-cardio",
  "extra-calves",
];
