import { useEffect } from "react";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import type { PluginListenerHandle } from "@capacitor/core";
import { useLocation, useNavigate } from "react-router-dom";
import { hasOverlaySearchParam, resolveBackPath } from "@/shared/lib";

export const AndroidBackNavigation = () => {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") {
      return;
    }

    let isActive = true;
    let backButtonListener: PluginListenerHandle | null = null;

    const registerListener = async () => {
      backButtonListener = await App.addListener("backButton", () => {
        const searchParams = new URLSearchParams(search);
        if (hasOverlaySearchParam(searchParams)) {
          navigate(-1);
          return;
        }
        const backPath = resolveBackPath(pathname);
        if (backPath) {
          navigate(backPath);
          return;
        }
        // На корневом экране — стандартное поведение Android (свернуть/выйти).
        void App.minimizeApp();
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
  }, [navigate, pathname, search]);

  return null;
};
