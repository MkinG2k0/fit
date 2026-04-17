import absCore from "./svg/icon-abs-core.svg?raw";
import breast from "./svg/icon-breast.svg?raw";
import cardio from "./svg/icon-cardio.svg?raw";
import handPower from "./svg/icon-hand-power.svg?raw";
import leg from "./svg/icon-leg.svg?raw";
import mobilityArmsUp from "./svg/icon-mobility-arms-up.svg?raw";
import musclesFront from "./svg/icon-muscles-front.svg?raw";
import shoulders from "./svg/icon-shoulders.svg?raw";
import triceps from "./svg/icon-triceps.svg?raw";

export const EXERCISE_ICON_SVG_BY_ID = {
  "icon-abs-core": absCore,
  "icon-breast": breast,
  "icon-cardio": cardio,
  "icon-hand-power": handPower,
  "icon-leg": leg,
  "icon-mobility-arms-up": mobilityArmsUp,
  "icon-muscles-front": musclesFront,
  "icon-shoulders": shoulders,
  "icon-triceps": triceps,
} as const;

export type ExerciseIconGraphicId = keyof typeof EXERCISE_ICON_SVG_BY_ID;
