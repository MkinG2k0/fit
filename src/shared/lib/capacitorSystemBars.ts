import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

/** Прозрачные панели и контент под системные отступы (вместе с MainActivity edge-to-edge). */
export const initCapacitorEdgeToEdgeChrome = (): void => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }
  void StatusBar.setOverlaysWebView({ overlay: true }).catch(() => {});
  void StatusBar.setBackgroundColor({ color: "#00000000" }).catch(() => {});
};

/**
 * В @capacitor/status-bar имена обратные ожиданию:
 * Style.Dark — светлые иконки/текст для тёмного фона приложения;
 * Style.Light — тёмные иконки для светлого фона.
 */
export const syncCapacitorStatusBarStyle = (isDarkAppearance: boolean): void => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }
  void StatusBar.setStyle({
    style: isDarkAppearance ? Style.Dark : Style.Light,
  }).catch(() => {});
};
