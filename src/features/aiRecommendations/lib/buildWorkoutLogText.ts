import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import "dayjs/locale/ru";
import type { CalendarDay } from "@/entities/calendarDay";

dayjs.extend(customParseFormat);
dayjs.locale("ru");

const DAY_KEY_FORMAT = "DD-MM-YYYY";

const formatDateHeading = (dateKey: string): string => {
  const parsed = dayjs(dateKey, DAY_KEY_FORMAT, true);
  if (!parsed.isValid()) {
    return dateKey;
  }
  return parsed.format("D MMMM YYYY");
};

export const buildWorkoutLogText = (
  days: Record<string, CalendarDay>,
): string => {
  const keyed = Object.entries(days)
    .filter(([, day]) =>
      day.exercises.some((exercise) =>
        exercise.sets.some((set) => set.reps > 0 || set.weight > 0),
      ),
    )
    .sort(([keyA], [keyB]) => {
      const dateA = dayjs(keyA, DAY_KEY_FORMAT, true);
      const dateB = dayjs(keyB, DAY_KEY_FORMAT, true);
      if (!dateA.isValid() || !dateB.isValid()) {
        return keyA.localeCompare(keyB);
      }
      return dateA.valueOf() - dateB.valueOf();
    });

  const blocks = keyed
    .map(([key, day]) => {
      const exercisesWithSets = day.exercises
        .map((exercise) => {
          const loggedSets = exercise.sets.filter(
            (set) => set.reps > 0 || set.weight > 0,
          );
          if (loggedSets.length === 0) {
            return null;
          }
          const setsText = loggedSets
            .map((set) => `${set.weight} кг × ${set.reps}`)
            .join(", ");
          return `${exercise.name}\n${setsText}`;
        })
        .filter((block): block is string => block !== null);

      if (exercisesWithSets.length === 0) {
        return null;
      }

      return `${formatDateHeading(key)}\n${exercisesWithSets.join("\n")}`;
    })
    .filter((block): block is string => block !== null);

  return blocks.join("\n\n");
};
