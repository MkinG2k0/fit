import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib";
import { ExerciseIconGraphic } from "../exerciseIcon/ExerciseIconGraphic";
import type { ExerciseIconGraphicId } from "../exerciseIcon/svgHtml";

export type AppNavIconVariant =
  | "timer"
  | "exercises"
  | "analytics"
  | "chart"
  | "settings"
  | "body-metrics"
  | "menu";

/** Варианты нижней навигации → id графики (см. `EXERCISE_ICON_SVG_BY_ID`). */
const VARIANT_TO_ICON_ID: Record<AppNavIconVariant, ExerciseIconGraphicId> = {
  timer: "icon-muscles-front",
  exercises: "icon-hand-power",
  analytics: "icon-triceps",
  chart: "icon-cardio",
  settings: "icon-abs-core",
  "body-metrics": "icon-shoulders",
  menu: "icon-leg",
};

export interface AppNavIconProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  variant: AppNavIconVariant;
}

export const AppNavIcon = ({
  variant,
  className,
  ...rest
}: AppNavIconProps) => (
  <ExerciseIconGraphic
    iconId={VARIANT_TO_ICON_ID[variant]}
    className={cn("size-5 shrink-0 object-contain", className)}
    {...rest}
  />
);
