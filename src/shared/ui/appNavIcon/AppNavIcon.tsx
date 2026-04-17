import type { ImgHTMLAttributes } from "react";
import { cn, publicAssetUrl } from "@/shared/lib";

export type AppNavIconVariant =
  | "timer"
  | "exercises"
  | "analytics"
  | "chart"
  | "settings"
  | "body-metrics"
  | "menu";

/** Меню: таймер — торс, список — гиря, аналитика — бицепс, настройки — пресс, тело — плечи/спина; chart — график для статистики. */
const ICON_FILE: Record<AppNavIconVariant, string> = {
  timer: "icons/nav-body-metrics.svg",
  exercises: "icons/nav-exercises.svg",
  analytics: "icons/logo-mark.svg",
  chart: "icons/nav-analytics.svg",
  settings: "icons/nav-settings.svg",
  "body-metrics": "icons/extra-9.svg",
  menu: "icons/nav-menu.svg",
};

export interface AppNavIconProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  variant: AppNavIconVariant;
}

export const AppNavIcon = ({
  variant,
  className,
  alt = "",
  draggable = false,
  ...rest
}: AppNavIconProps) => (
  <img
    alt={alt}
    draggable={draggable}
    src={publicAssetUrl(ICON_FILE[variant])}
    className={cn("size-5 shrink-0 object-contain", className)}
    {...rest}
  />
);
