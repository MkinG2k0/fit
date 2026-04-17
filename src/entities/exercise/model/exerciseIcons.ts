import type { ExerciseIconGraphicId } from "@/shared/ui/exerciseIcon/svgHtml";

/** Относительные пути к SVG в `public/` (кэш PWA, внешние ссылки). */
export const EXERCISE_ICON_PATHS = {
  "icon-abs-core": "icons/icon-abs-core.svg",
  "icon-breast": "icons/icon-breast.svg",
  "icon-cardio": "icons/icon-cardio.svg",
  "icon-hand-power": "icons/icon-hand-power.svg",
  "icon-leg": "icons/icon-leg.svg",
  "icon-mobility-arms-up": "icons/icon-mobility-arms-up.svg",
  "icon-muscles-front": "icons/icon-muscles-front.svg",
  "icon-shoulders": "icons/icon-shoulders.svg",
  "icon-triceps": "icons/icon-triceps.svg",
} as const satisfies Record<ExerciseIconGraphicId, string>;

export type ExerciseIconId = ExerciseIconGraphicId;

export const DEFAULT_EXERCISE_ICON_ID: ExerciseIconId = "icon-shoulders";

const CATEGORY_DEFAULT_ICON: Record<string, ExerciseIconId> = {
  кардио: "icon-cardio",
  пресс: "icon-abs-core",
  ноги: "icon-leg",
  икры: "icon-leg",
  ягодицы: "icon-leg",
  спина: "icon-muscles-front",
  грудь: "icon-breast",
  плечи: "icon-shoulders",
  руки: "icon-hand-power",
  предплечья: "icon-hand-power",
  мобильность: "icon-mobility-arms-up",
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
  "icon-abs-core",
  "icon-breast",
  "icon-cardio",
  "icon-hand-power",
  "icon-leg",
  "icon-mobility-arms-up",
  "icon-muscles-front",
  "icon-shoulders",
  "icon-triceps",
];
