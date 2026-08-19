import { isPlainObject, isZustandPersistBlob } from "@/shared/lib/appSettingsTransfer";

const stripExerciseEntryMedia = (exercise: unknown): unknown => {
  if (!isPlainObject(exercise)) {
    return exercise;
  }
  const { photoDataUrl: _legacyPhoto, ...rest } = exercise;
  return {
    ...rest,
    photoDataUrls: [],
  };
};

export const stripExerciseMediaFromSnapshot = (snapshot: unknown): unknown => {
  if (!isZustandPersistBlob(snapshot) || !isPlainObject(snapshot.state)) {
    return snapshot;
  }

  const state = snapshot.state as { exercises?: unknown };
  if (!Array.isArray(state.exercises)) {
    return snapshot;
  }

  return {
    ...snapshot,
    state: {
      ...snapshot.state,
      exercises: state.exercises.map((category) => {
        if (!isPlainObject(category) || !Array.isArray(category.exercises)) {
          return category;
        }
        return {
          ...category,
          exercises: category.exercises.map(stripExerciseEntryMedia),
        };
      }),
    },
  };
};
