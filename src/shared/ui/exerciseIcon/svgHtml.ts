import absCore from "./svg/icon-abs-core.svg?raw";
import areaChart from "./svg/icon-area-chart.svg?raw";
import biceps from "./svg/icon-biceps.svg?raw";
import bodyMeasurements from "./svg/icon-body-measurements.svg?raw";
import calves from "./svg/icon-calves.svg?raw";
import cardio from "./svg/icon-cardio.svg?raw";
import kettlebell from "./svg/icon-kettlebell.svg?raw";
import legsPower from "./svg/icon-legs-power.svg?raw";
import mobilityArmsUp from "./svg/icon-mobility-arms-up.svg?raw";
import musclesFront from "./svg/icon-muscles-front.svg?raw";
import shouldersStretch from "./svg/icon-shoulders-stretch.svg?raw";

export const EXERCISE_ICON_SVG_BY_ID = {
  "nav-exercises": kettlebell,
  "nav-timer": musclesFront,
  "nav-body-metrics": bodyMeasurements,
  "nav-menu": legsPower,
  "nav-analytics": areaChart,
  "logo-mark": biceps,
  "extra-shoulders-stretch": shouldersStretch,
  "nav-settings": absCore,
  "extra-mobility-arms-up": mobilityArmsUp,
  "extra-cardio": cardio,
  "extra-calves": calves,
} as const;

export type ExerciseIconGraphicId = keyof typeof EXERCISE_ICON_SVG_BY_ID;
