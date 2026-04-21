import type { MuscleBalance, TrainingSessionStat } from "../model/types";

const MUSCLES = ["Плечи", "Грудь", "Ноги", "Спина", "Трицепс", "Бицепс"] as const;

const inferMuscle = (exerciseName: string, category: string) => {
  const normalizedName = exerciseName.toLowerCase();
  const normalizedCategory = category.toLowerCase();

  if (normalizedName.includes("трицепс")) {
    return "Трицепс";
  }
  if (normalizedName.includes("бицепс")) {
    return "Бицепс";
  }
  if (normalizedCategory.includes("плеч")) {
    return "Плечи";
  }
  if (normalizedCategory.includes("груд")) {
    return "Грудь";
  }
  if (normalizedCategory.includes("спин")) {
    return "Спина";
  }
  if (
    normalizedCategory.includes("ног") ||
    normalizedCategory.includes("ягод") ||
    normalizedCategory.includes("икр")
  ) {
    return "Ноги";
  }
  if (normalizedCategory.includes("рук")) {
    return "Бицепс";
  }
  return null;
};

export const calculateMuscleBalance = (
  sessions: TrainingSessionStat[],
): MuscleBalance => {
  const tonnageByMuscle = new Map<string, number>(
    MUSCLES.map((muscle) => [muscle, 0]),
  );

  sessions.forEach((session) => {
    session.exercises.forEach((exercise) => {
      const muscle = inferMuscle(exercise.name, exercise.category);
      if (!muscle) {
        return;
      }
      tonnageByMuscle.set(muscle, (tonnageByMuscle.get(muscle) ?? 0) + exercise.tonnage);
    });
  });

  const totalTonnage = Array.from(tonnageByMuscle.values()).reduce(
    (acc, value) => acc + value,
    0,
  );

  const items = MUSCLES.map((muscle) => {
    const tonnage = tonnageByMuscle.get(muscle) ?? 0;
    return {
      muscle,
      tonnage,
      percent: totalTonnage > 0 ? (tonnage / totalTonnage) * 100 : 0,
    };
  });

  return { items };
};
