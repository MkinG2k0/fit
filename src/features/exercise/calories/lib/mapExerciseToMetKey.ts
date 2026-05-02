import type { Exercise } from "@/entities/exercise";

const normalize = (s: string): string => s.trim().toLowerCase();

/**
 * Грубая эвристика: русские/английские названия → ключ MET_TABLE.
 */
export const mapExerciseToMetKey = (exercise: Exercise): string => {
  const name = normalize(exercise.name);
  const category = normalize(exercise.category ?? exercise.categoryId ?? "");
  const hay = `${name} ${category}`;

  if (
    hay.includes("присед") ||
    hay.includes("squat") ||
    hay.includes("hack") ||
    hay.includes("nogi")
  ) {
    return "squats";
  }
  if (
    hay.includes("жим ног") ||
    hay.includes("leg press") ||
    hay.includes("гакк") ||
    hay.includes("platform") ||
    hay.includes("nogi")
  ) {
    return "leg_press";
  }
  if (hay.includes("выпад") || hay.includes("lunge")) {
    return "lunges";
  }
  if (
    hay.includes("жим стоя") ||
    hay.includes("армейский") ||
    hay.includes("military") ||
    hay.includes("overhead press")
  ) {
    return "overhead_press";
  }
  if (
    hay.includes("мах") ||
    hay.includes("разводк") ||
    hay.includes("lateral raise") ||
    hay.includes("fly")
  ) {
    return "lateral_raises";
  }

  return "default";
};
