import dayjs, { type Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import type { CalendarDay } from "@/entities/calendarDay";
import type { AiRecommendationPeriod } from "../model/types";

dayjs.extend(customParseFormat);

const DAY_KEY_FORMAT = "DD-MM-YYYY";

const dayHasLoggedSet = (day: CalendarDay): boolean => {
  return day.exercises.some((exercise) =>
    exercise.sets.some((set) => set.reps > 0 || set.weight > 0),
  );
};

const parseDayKey = (key: string): Dayjs | null => {
  const parsed = dayjs(key, DAY_KEY_FORMAT, true);
  return parsed.isValid() ? parsed.startOf("day") : null;
};

const sortEntriesByDateAsc = (
  entries: [string, CalendarDay][],
): [string, CalendarDay][] => {
  return [...entries].sort(([keyA], [keyB]) => {
    const dateA = parseDayKey(keyA);
    const dateB = parseDayKey(keyB);
    if (!dateA || !dateB) {
      return keyA.localeCompare(keyB);
    }
    return dateA.valueOf() - dateB.valueOf();
  });
};

export const filterDaysByPeriod = (
  days: Record<string, CalendarDay>,
  period: AiRecommendationPeriod,
  now: Dayjs = dayjs(),
): Record<string, CalendarDay> => {
  const today = now.startOf("day");
  const entries = Object.entries(days).filter(([, day]) =>
    dayHasLoggedSet(day),
  );

  if (period === "all") {
    return Object.fromEntries(entries);
  }

  if (period === "last_workout") {
    const sorted = sortEntriesByDateAsc(entries);
    const last = sorted.at(-1);
    if (!last) {
      return {};
    }
    return { [last[0]]: last[1] };
  }

  const daysBack = period === "week" ? 6 : 29;
  const from = today.subtract(daysBack, "day");

  const filtered = entries.filter(([key]) => {
    const date = parseDayKey(key);
    if (!date) {
      return false;
    }
    return (
      (date.isSame(from, "day") || date.isAfter(from, "day")) &&
      (date.isSame(today, "day") || date.isBefore(today, "day"))
    );
  });

  return Object.fromEntries(filtered);
};
