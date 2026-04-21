import { appStorage } from "./appStorage";

const WORKOUT_MONTH_INDEX_KEY = "workout:month-index";

const toUnique = (items: string[]) => [...new Set(items)];

const toSorted = (items: string[]) => [...items].sort();

const isMonthKey = (key: string, regex: RegExp) => regex.test(key);

const normalizeMonthKeys = (keys: unknown, monthKeyRegex: RegExp): string[] => {
  if (!Array.isArray(keys)) {
    return [];
  }

  return toSorted(
    toUnique(keys.filter((key): key is string => typeof key === "string")).filter(
      (key) => isMonthKey(key, monthKeyRegex),
    ),
  );
};

const setMonthIndex = async (monthKeys: string[]) => {
  await appStorage.setJson(WORKOUT_MONTH_INDEX_KEY, monthKeys);
};

const rebuildMonthIndex = async (monthKeyRegex: RegExp): Promise<string[]> => {
  const keys = await appStorage.keys();
  const monthKeys = toSorted(keys.filter((key) => isMonthKey(key, monthKeyRegex)));
  await setMonthIndex(monthKeys);
  return monthKeys;
};

export const listWorkoutMonthKeys = async (
  monthKeyRegex: RegExp,
): Promise<string[]> => {
  const existing = await appStorage.getJson<unknown>(WORKOUT_MONTH_INDEX_KEY);
  const normalized = normalizeMonthKeys(existing, monthKeyRegex);

  if (normalized.length > 0) {
    return normalized;
  }

  return rebuildMonthIndex(monthKeyRegex);
};

export const registerWorkoutMonthKey = async (
  monthKey: string,
  monthKeyRegex: RegExp,
) => {
  if (!isMonthKey(monthKey, monthKeyRegex)) {
    return;
  }

  const current = await listWorkoutMonthKeys(monthKeyRegex);
  if (current.includes(monthKey)) {
    return;
  }

  await setMonthIndex(toSorted([...current, monthKey]));
};
