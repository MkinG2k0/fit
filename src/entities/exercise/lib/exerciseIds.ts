import slugify from "slugify";

const normalizeLegacyIdentityPart = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const normalizeIdentityPart = (value: string): string =>
  slugify(value, {
    lower: true,
    strict: true,
    trim: true,
    locale: "ru",
  });

export const buildCatalogExerciseId = (
  category: string,
  exerciseName: string,
): string =>
  `category:${normalizeIdentityPart(category)}:${normalizeIdentityPart(exerciseName)}`;

export const buildCategoryId = (categoryName: string): string =>
  `category:${normalizeIdentityPart(categoryName)}`;

export const buildPresetId = (presetName: string): string =>
  `preset:${normalizeIdentityPart(presetName)}`;

export const extractLegacyCatalogNamePart = (
  catalogId: string,
): string | null => {
  if (!catalogId.startsWith("catalog:")) {
    return null;
  }
  const parts = catalogId.split(":");
  if (parts.length < 3) {
    return null;
  }
  try {
    const decodedName = decodeURIComponent(parts[2] ?? "");
    const normalized = normalizeLegacyIdentityPart(decodedName);
    return normalized.length > 0 ? normalized : null;
  } catch {
    return null;
  }
};

export const normalizeLegacyCatalogName = (name: string): string =>
  normalizeLegacyIdentityPart(name);
