import type { ExerciseSet } from "@/entities/exercise";

/**
 * Форматирует уже залогированные подходы текущей сессии для AI-fill промпта.
 * Пустые (0×0) подходы пропускаются.
 */
export const formatCurrentSessionSets = (sets: ExerciseSet[]): string => {
  const logged = sets.filter((set) => set.reps > 0 || set.weight > 0);
  if (logged.length === 0) {
    return "";
  }
  return logged
    .map((set, index) => `${index + 1}. ${set.weight} кг × ${set.reps}`)
    .join("\n");
};
