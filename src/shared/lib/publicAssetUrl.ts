/** URL файла из `public/` с учётом `base` в Vite. */
export const publicAssetUrl = (relativePath: string): string => {
  const base = import.meta.env.BASE_URL;
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  return `${normalizedBase}${relativePath}`;
};
