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

/** Меню: таймер — торс, список — гиря, аналитика — бицепс, настройки — пресс, тело — плечи/спина; chart — график для статистики. */
const VARIANT_TO_ICON_ID: Record<AppNavIconVariant, ExerciseIconGraphicId> = {
  timer: "nav-body-metrics",
  exercises: "nav-exercises",
  analytics: "logo-mark",
  chart: "nav-analytics",
  settings: "nav-settings",
  "body-metrics": "extra-9",
  menu: "nav-menu",
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
