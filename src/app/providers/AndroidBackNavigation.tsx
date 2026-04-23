import { useEffect } from "react";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import type { PluginListenerHandle } from "@capacitor/core";

export const AndroidBackNavigation = () => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") {
      return;
    }

    let isActive = true;
    let backButtonListener: PluginListenerHandle | null = null;

    const registerListener = async () => {
      backButtonListener = await App.addListener("backButton", () => {
        if (window.history.length > 1) {
          window.history.back();
        }
      });

      if (!isActive) {
        void backButtonListener.remove();
      }
    };

    void registerListener();

    return () => {
      isActive = false;
      void backButtonListener?.remove();
    };
  }, []);

  return null;
};
