/**
 * Детерминированный parent-route для кнопки «назад».
 * Не использует history.back — избегает циклов между связанными экранами.
 */
const PARENT_BY_PATH: Record<string, string> = {
  "/exercises": "/",
  "/exercises/create": "/exercises",
  "/exercises/edit": "/exercises",
  "/exercises/bulk-create": "/exercises",
  "/presets/create": "/exercises",
  "/presets/edit": "/exercises",
  "/timer": "/",
  "/analytics": "/",
  "/news": "/",
  "/settings": "/",
  "/body-metrics": "/",
  "/load-table": "/",
  "/activity": "/",
};

/** Экраны без родителя (корень стека). */
const ROOT_PATHS = new Set(["/", "/onboarding"]);

/**
 * @returns путь родителя или `null`, если текущий экран — корень.
 */
export const resolveBackPath = (pathname: string): string | null => {
  if (ROOT_PATHS.has(pathname)) {
    return null;
  }

  if (pathname.startsWith("/load-table/")) {
    return "/load-table";
  }

  return PARENT_BY_PATH[pathname] ?? "/";
};
