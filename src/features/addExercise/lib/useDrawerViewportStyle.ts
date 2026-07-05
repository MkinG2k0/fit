import { useEffect, useState } from "react";

type DrawerViewportStyle = {
  height?: number;
  top?: number;
};

export const useDrawerViewportStyle = (
  enabled: boolean,
): DrawerViewportStyle => {
  const [style, setStyle] = useState<DrawerViewportStyle>({});

  useEffect(() => {
    if (!enabled) {
      setStyle({});
      return;
    }

    const viewport = window.visualViewport;
    if (!viewport) {
      return;
    }

    const sync = () => {
      setStyle({
        height: viewport.height,
        top: viewport.offsetTop,
      });
    };

    sync();
    viewport.addEventListener("resize", sync);
    viewport.addEventListener("scroll", sync);

    return () => {
      viewport.removeEventListener("resize", sync);
      viewport.removeEventListener("scroll", sync);
    };
  }, [enabled]);

  return style;
};
