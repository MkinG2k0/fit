import { useLocation, useNavigate } from "react-router-dom";
import { hasOverlaySearchParam } from "./overlaySearchParams";
import { resolveBackPath } from "./resolveBackPath";

/**
 * Навигация «назад» по карте parent-routes (не через history stack).
 * Overlay search-параметры закрываются через history pop.
 * @returns `true`, если выполнен переход; `false`, если экран — корень.
 */
export const useNavigateBack = () => {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  return (): boolean => {
    const searchParams = new URLSearchParams(search);
    if (hasOverlaySearchParam(searchParams)) {
      navigate(-1);
      return true;
    }
    const backPath = resolveBackPath(pathname);
    if (!backPath) {
      return false;
    }
    navigate(backPath);
    return true;
  };
};
