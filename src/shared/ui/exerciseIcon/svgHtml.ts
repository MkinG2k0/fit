import extra8 from "./svg/extra-8.svg?raw";
import extra9 from "./svg/extra-9.svg?raw";
import logoMark from "./svg/logo-mark.svg?raw";
import navAnalytics from "./svg/nav-analytics.svg?raw";
import navBodyMetrics from "./svg/nav-body-metrics.svg?raw";
import navExercises from "./svg/nav-exercises.svg?raw";
import navMenu from "./svg/nav-menu.svg?raw";
import navSettings from "./svg/nav-settings.svg?raw";
import navTimer from "./svg/nav-timer.svg?raw";

export const EXERCISE_ICON_SVG_BY_ID = {
  "nav-exercises": navExercises,
  "nav-timer": navTimer,
  "nav-body-metrics": navBodyMetrics,
  "nav-menu": navMenu,
  "nav-analytics": navAnalytics,
  "logo-mark": logoMark,
  "extra-9": extra9,
  "nav-settings": navSettings,
  "extra-8": extra8,
} as const;

export type ExerciseIconGraphicId = keyof typeof EXERCISE_ICON_SVG_BY_ID;
