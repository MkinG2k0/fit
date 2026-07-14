import type { Exercise, TrainingPreset } from "../model/types";

export interface TargetExerciseMeta {
  name: string;
  categoryId?: string;
  category?: string;
}

/** Заменяет sourceId → targetId в пресетах и дедупит id (порядок первого вхождения). */
export const remapPresetExerciseIds = (
  presets: TrainingPreset[],
  sourceId: string,
  targetId: string,
): TrainingPreset[] => {
  if (sourceId === targetId) {
    return presets;
  }

  return presets.map((preset) => {
    const remapped = preset.exercises.map((exerciseId) =>
      exerciseId === sourceId ? targetId : exerciseId,
    );
    const seen = new Set<string>();
    const deduped: string[] = [];
    for (const exerciseId of remapped) {
      if (seen.has(exerciseId)) {
        continue;
      }
      seen.add(exerciseId);
      deduped.push(exerciseId);
    }
    return {
      ...preset,
      exercises: deduped,
    };
  });
};

/**
 * Ремапит catalogExerciseId source → target на инстансах дня.
 * D-01: карточки не сливаются; instance UUID не меняется.
 */
export const remapDayExercises = (
  exercises: Exercise[],
  sourceId: string,
  targetId: string,
  targetMeta?: TargetExerciseMeta,
): Exercise[] => {
  if (sourceId === targetId) {
    return exercises;
  }

  return exercises.map((exercise) => {
    const catalogKey = exercise.catalogExerciseId ?? exercise.id;
    if (catalogKey !== sourceId) {
      return exercise;
    }

    return {
      ...exercise,
      catalogExerciseId: targetId,
      ...(targetMeta?.name ? { name: targetMeta.name } : {}),
      ...(targetMeta?.categoryId
        ? { categoryId: targetMeta.categoryId }
        : {}),
      ...(targetMeta?.category ? { category: targetMeta.category } : {}),
    };
  });
};

/** Есть ли среди exercises инстанс с catalog key === sourceId. */
export const dayExercisesNeedRemap = (
  exercises: Exercise[],
  sourceId: string,
): boolean =>
  exercises.some(
    (exercise) => (exercise.catalogExerciseId ?? exercise.id) === sourceId,
  );
