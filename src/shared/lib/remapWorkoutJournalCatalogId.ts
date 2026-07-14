import {
  dayExercisesNeedRemap,
  remapDayExercises,
  type TargetExerciseMeta,
} from "@/entities/exercise/lib/mergeCatalogExercise";
import type { CalendarDay } from "@/entities/calendarDay";
import { listWorkoutMonthKeys } from "./storageAdapter";
import {
  MONTH_YEAR_STORAGE_KEY_REGEX,
  readWorkoutMonthBucketsForKeys,
  writeWorkoutMonthBucket,
} from "./storage";

/**
 * Ремапит catalogExerciseId source → target во всех бакетах MM-YYYY журнала.
 * Analytics отдельно не пишет — статистика derived после ремапа (D-03).
 */
export const remapWorkoutJournalCatalogId = async (
  sourceId: string,
  targetId: string,
  targetMeta?: TargetExerciseMeta,
): Promise<{ remappedMonthCount: number }> => {
  if (sourceId === targetId || !sourceId || !targetId) {
    return { remappedMonthCount: 0 };
  }

  const monthKeys = await listWorkoutMonthKeys(MONTH_YEAR_STORAGE_KEY_REGEX);
  if (monthKeys.length === 0) {
    return { remappedMonthCount: 0 };
  }

  const buckets = await readWorkoutMonthBucketsForKeys(monthKeys);
  let remappedMonthCount = 0;

  for (const monthKey of monthKeys) {
    const bucket = buckets.get(monthKey) ?? {};
    let monthChanged = false;
    const nextBucket: Record<string, CalendarDay> = {};

    for (const [dateKey, day] of Object.entries(bucket)) {
      const exercises = day?.exercises ?? [];
      if (!dayExercisesNeedRemap(exercises, sourceId)) {
        nextBucket[dateKey] = day;
        continue;
      }

      monthChanged = true;
      nextBucket[dateKey] = {
        ...day,
        exercises: remapDayExercises(
          exercises,
          sourceId,
          targetId,
          targetMeta,
        ),
      };
    }

    if (monthChanged) {
      await writeWorkoutMonthBucket(monthKey, nextBucket);
      remappedMonthCount += 1;
    }
  }

  return { remappedMonthCount };
};
