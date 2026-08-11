import { useLocation, useNavigate } from "react-router-dom";
import { resolveBackPath } from "./resolveBackPath";

/**
 * Навигация «назад» по карте parent-routes (не через history stack).
 * @returns `true`, если выполнен переход; `false`, если экран — корень.
 */
export const useNavigateBack = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (): boolean => {
    const backPath = resolveBackPath(pathname);
    if (!backPath) {
      return false;
    }
    navigate(backPath);
    return true;
  };
};
